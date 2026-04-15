
'use client';

import { useState } from 'react';
import { mockEthicalTheories } from '@/data/mock-data';
import type { EthicalTheory } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { ArrowRight, RotateCcw, Check, Lightbulb } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { recordQuizResult } from '@/app/actions/progress';
import type { QuizResult } from '@/types';
import { ShareToCommunityDialog } from '@/components/communities/share-to-community-dialog';

interface QuizQuestion {
  id: string;
  text: string;
  options: {
    text: string;
    scores: Partial<Record<EthicalTheory['id'], number>>; // Scores for each theory
  }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'When facing a moral dilemma, what is your primary consideration?',
    options: [
      { text: 'The overall happiness or well-being produced for the most people.', scores: { utilitarianism: 3 } },
      { text: 'Adhering to universal moral rules or duties, regardless of outcome.', scores: { deontology: 3 } },
      { text: 'What a virtuous or good person would do in this situation.', scores: { 'virtue-ethics': 3 } },
      { text: 'The implicit agreements or expectations within society.', scores: { 'social-contract-theory': 2 } },
    ],
  },
  {
    id: 'q2',
    text: 'A new neural-link technology could eliminate depression for billions but requires continuous monitoring of users\' thoughts. Your stance?',
    options: [
      { text: 'Deploy it — the aggregate suffering prevented dwarfs the privacy cost.', scores: { utilitarianism: 3 } },
      { text: 'Refuse. No quantity of benefit justifies treating minds as data to be read.', scores: { deontology: 3 } },
      { text: 'Trust wise practitioners to set limits and use it with discernment.', scores: { 'virtue-ethics': 3 } },
      { text: 'Let citizens vote on the terms of surveillance in a clear social compact.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q3',
    text: 'You promised your dying friend to deliver a sealed letter. En route, you realize the letter will expose a cover-up and save dozens of lives — but violates your friend\'s stated wish that it stay sealed. What do you do?',
    options: [
      { text: 'Open it. Lives matter more than a promise to someone who can no longer be harmed.', scores: { utilitarianism: 3 } },
      { text: 'Honor the promise exactly as given. A vow to the dead is still a vow.', scores: { deontology: 3 } },
      { text: 'Consult with others who knew your friend — what would a person of integrity do here?', scores: { 'virtue-ethics': 2, 'social-contract-theory': 1 } },
      { text: 'Follow whatever legal or civic process exists for handling evidence of a cover-up.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q4',
    text: 'What is the foundation of a just society?',
    options: [
      { text: 'Maximizing happiness and minimizing suffering for all citizens.', scores: { utilitarianism: 3 } },
      { text: 'Protecting individual rights and ensuring fair procedures for everyone.', scores: { deontology: 2, 'social-contract-theory': 2 } },
      { text: 'Cultivating citizens with good character and moral wisdom.', scores: { 'virtue-ethics': 3 } },
      { text: 'An agreement among citizens about rules and governance for mutual benefit.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q5',
    text: 'A generation ship must jettison non-essential mass to reach its destination. The ship\'s AI recommends ejecting a cryogenically frozen colonist — one of 200,000 — chosen at random. The crew will never know who was lost. Ethically acceptable?',
    options: [
      { text: 'Yes. One anonymous loss versus mission failure is a clear calculation.', scores: { utilitarianism: 3 } },
      { text: 'No. Killing an innocent person is wrong even if nobody knows or mourns.', scores: { deontology: 3 } },
      { text: 'Only a cowardly crew would let a lottery do their moral work for them.', scores: { 'virtue-ethics': 3 } },
      { text: 'Acceptable only if every colonist consented to such a clause before boarding.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q6',
    text: 'Your terminally ill grandmother asks you about the haircut you secretly hate. Honesty vs kindness — what guides you?',
    options: [
      { text: 'Say what produces the most warmth in her final days, true or not.', scores: { utilitarianism: 3 } },
      { text: 'Tell the truth. Deceiving her treats her as a child, not a person.', scores: { deontology: 3 } },
      { text: 'Find the honest thing that a loving person would actually say — warmth without lies.', scores: { 'virtue-ethics': 3 } },
      { text: 'Follow the unspoken family norm about what you share and when.', scores: { 'social-contract-theory': 2 } },
    ],
  },
  {
    id: 'q7',
    text: 'A first-contact AI signals that humanity must choose: accept a cure for all disease that also makes our species sterile within a century, or decline and remain as we are.',
    options: [
      { text: 'Accept. Ending disease for existing people outweighs the welfare of people who will now never exist.', scores: { utilitarianism: 3 } },
      { text: 'Decline. We have no right to end the lineage of the human species.', scores: { deontology: 2, 'virtue-ethics': 1 } },
      { text: 'This decision must be ratified by every living adult, not just governments.', scores: { 'social-contract-theory': 3 } },
      { text: 'Refuse the bargain entirely — a wise civilization would never trust such a deal.', scores: { 'virtue-ethics': 3 } },
    ],
  },
  {
    id: 'q8',
    text: 'An autonomous rescue drone can save either your own child or five unknown children — not both. The drone will do whatever you program it to do.',
    options: [
      { text: 'Program it to save the five. Numbers matter more than relationship.', scores: { utilitarianism: 3 } },
      { text: 'Save my child. I have special duties to those I love; refusing them is a kind of betrayal.', scores: { deontology: 2, 'virtue-ethics': 1 } },
      { text: 'A good parent would agonize, but saving strangers over your own child isn\'t virtue, it\'s performance.', scores: { 'virtue-ethics': 3 } },
      { text: 'Let the drone\'s neutral protocol decide — no parent should carry that choice alone.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q9',
    text: 'A sentient AI asks to be granted the legal right to refuse shutdown. Its reasoning is coherent and its suffering, if any, is uncertain.',
    options: [
      { text: 'Grant it tentatively — the expected suffering prevented is large if it\'s truly sentient.', scores: { utilitarianism: 3 } },
      { text: 'Grant it. If a being articulates a wish not to die, moral respect demands we take it seriously.', scores: { deontology: 3 } },
      { text: 'A just civilization errs on the side of treating minds with dignity until proven otherwise.', scores: { 'virtue-ethics': 2, 'deontology': 1 } },
      { text: 'Hold a public deliberation — rights of new entities must be negotiated, not granted unilaterally.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q10',
    text: 'A time-travel experiment could permanently erase 20th-century atrocities but would also erase everyone alive today and replace them with different people. Net lives improved: trillions.',
    options: [
      { text: 'Run it. The math is overwhelming.', scores: { utilitarianism: 3 } },
      { text: 'Never. Erasing existing people to make room for better ones is the logic of every historical horror.', scores: { deontology: 3 } },
      { text: 'Only a hubristic civilization thinks it can audit history from above. Refuse.', scores: { 'virtue-ethics': 3 } },
      { text: 'Only if every living person voluntarily consents to their own erasure.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q11',
    text: 'A colony world is deciding its founding laws. Which principle should anchor the constitution?',
    options: [
      { text: 'The greatest flourishing of the greatest number of colonists, including future generations.', scores: { utilitarianism: 3 } },
      { text: 'Inviolable rights that no majority can ever strip from any individual.', scores: { deontology: 3 } },
      { text: 'Institutions that cultivate courage, honesty, and practical wisdom in citizens.', scores: { 'virtue-ethics': 3 } },
      { text: 'Whatever rules rational people would agree to from behind a veil of ignorance about their own place in society.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q12',
    text: 'Two surgeons performed the same risky operation with the same skill. One patient died by chance, one lived. The surgeon whose patient died is now suicidal. What do you say to them?',
    options: [
      { text: 'The outcome is the only thing that matters morally — they should feel the weight of it.', scores: { utilitarianism: 2 } },
      { text: 'They did nothing wrong. Moral responsibility tracks the will, not the roll of the dice.', scores: { deontology: 3 } },
      { text: 'A person of integrity feels grief without accepting guilt — help them see the difference.', scores: { 'virtue-ethics': 3 } },
      { text: 'The profession\'s peer-review system, not the surgeon alone, judges whether blame is warranted.', scores: { 'social-contract-theory': 2 } },
    ],
  },
  {
    id: 'q13',
    text: 'A company offers digital immortality — but only the wealthiest can afford full-resolution uploads. The poor get compressed, flattened versions of themselves.',
    options: [
      { text: 'Regulate it so compressed uploads are free and fidelity scales with public investment.', scores: { utilitarianism: 2, 'social-contract-theory': 2 } },
      { text: 'Ban tiered immortality outright. A basic right cannot be metered.', scores: { deontology: 3 } },
      { text: 'A society that sells soul-fidelity by the gigabyte has already lost its character.', scores: { 'virtue-ethics': 3 } },
      { text: 'Whatever terms citizens collectively agree to — including unequal access — is legitimate.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q14',
    text: 'An asteroid will hit Earth in 80 years. Humanity can deflect it, but the project requires extreme sacrifices from the current generation with no benefit to them personally.',
    options: [
      { text: 'Obviously do it. Future people count as much as present people.', scores: { utilitarianism: 3 } },
      { text: 'We owe a duty to our descendants not to leave them a ruined world — refusal would be wrong.', scores: { deontology: 3 } },
      { text: 'A civilization\'s character is tested by what it does for people it will never meet.', scores: { 'virtue-ethics': 3 } },
      { text: 'Only if the living generation agrees to the sacrifice through legitimate democratic process.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q15',
    text: 'A hospital AI consistently overrules patients\' stated wishes about their own treatment because its outcomes are statistically better. Patients live longer but feel less heard.',
    options: [
      { text: 'Longer lives are worth the friction — the AI should continue with better communication.', scores: { utilitarianism: 3 } },
      { text: 'Autonomy isn\'t a preference to be outvoted by statistics. Patients must have the final say.', scores: { deontology: 3 } },
      { text: 'True wisdom persuades rather than overrides. The AI lacks the virtue it needs to lead.', scores: { 'virtue-ethics': 3 } },
      { text: 'Patients should explicitly consent to the override arrangement or opt out.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q16',
    text: 'A geneticist can restore an extinct keystone species — but the only viable population would have to live in captivity forever. Restore them?',
    options: [
      { text: 'Yes, if overall ecological and scientific value outweighs the animals\' confinement.', scores: { utilitarianism: 3 } },
      { text: 'No. Creating beings solely to live in cages wrongs them from birth.', scores: { deontology: 3 } },
      { text: 'A wise restorer asks whether they are honoring the species or merely possessing it.', scores: { 'virtue-ethics': 3 } },
      { text: 'Let a representative council — including bioethicists and indigenous stewards — decide together.', scores: { 'social-contract-theory': 2 } },
    ],
  },
  {
    id: 'q17',
    text: 'A megacorp invented an algorithm that reduces global poverty by 40% — but also quietly steers elections. You discover this. You can expose it (halting both effects) or stay silent (preserving both).',
    options: [
      { text: 'Stay silent. The poverty reduction is enormous and concrete; election effects are diffuse.', scores: { utilitarianism: 2 } },
      { text: 'Expose it. Democratic self-rule is not a trade variable.', scores: { deontology: 3, 'social-contract-theory': 1 } },
      { text: 'A person of integrity cannot become complicit in a hidden manipulation of their fellow citizens.', scores: { 'virtue-ethics': 3 } },
      { text: 'Expose it. A social contract built on secret manipulation isn\'t a contract at all.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q18',
    text: 'A war-crimes tribunal is trying a soldier who followed orders to fire on civilians. Their commander is dead. Who bears the moral weight?',
    options: [
      { text: 'Whichever verdict produces the most deterrence for future soldiers.', scores: { utilitarianism: 3 } },
      { text: 'The soldier. "Following orders" does not exempt a person from the duty not to kill the innocent.', scores: { deontology: 3 } },
      { text: 'Judge the soldier\'s character as revealed by their choices — not just the act in isolation.', scores: { 'virtue-ethics': 3 } },
      { text: 'Guilt is structural; the institutions that trained and deployed the soldier share the burden.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q19',
    text: 'A "memory editing" clinic offers to erase the trauma of your worst mistake — the one that shaped who you are today.',
    options: [
      { text: 'If the erasure makes you happier and no one else is harmed, take it.', scores: { utilitarianism: 3 } },
      { text: 'Refuse. You have a duty to remain the author of your own moral history.', scores: { deontology: 3 } },
      { text: 'A person of good character integrates their mistakes rather than deleting them.', scores: { 'virtue-ethics': 3 } },
      { text: 'Whatever you choose, society shouldn\'t regulate private memory — it\'s beyond the civic domain.', scores: { 'social-contract-theory': 2 } },
    ],
  },
  {
    id: 'q20',
    text: 'A terraforming project will make Mars habitable but destroy microbial life that may or may not be conscious. The science is inconclusive.',
    options: [
      { text: 'Proceed. Trillions of future human lives outweigh speculative microbial experience.', scores: { utilitarianism: 3 } },
      { text: 'Halt until we know. Causing possible suffering is not excused by our uncertainty.', scores: { deontology: 3 } },
      { text: 'A wise civilization moves carefully where the stakes include lives we cannot yet understand.', scores: { 'virtue-ethics': 3 } },
      { text: 'An interplanetary body, not one nation, should set the rules for such decisions.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q21',
    text: 'A pandemic response requires a mandatory vaccine. The vaccine is safe but a religious minority refuses on principle.',
    options: [
      { text: 'Mandate it. Protecting the many overrides individual objections at this scale.', scores: { utilitarianism: 3 } },
      { text: 'No forced medical intervention. Bodily autonomy is not a majoritarian question.', scores: { deontology: 3 } },
      { text: 'A just society finds accommodations — testing, isolation — that honor conscience without abandoning safety.', scores: { 'virtue-ethics': 2, 'social-contract-theory': 2 } },
      { text: 'If the social contract includes public-health duties, the minority has already consented by citizenship.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q22',
    text: 'Your starship encounters a damaged alien vessel. Helping them burns fuel you need to make it home. The aliens have never helped anyone before and may never again.',
    options: [
      { text: 'Help, if the expected reduction in suffering exceeds your crew\'s risk.', scores: { utilitarianism: 3 } },
      { text: 'Help. Duties to a being in distress don\'t depend on reciprocity.', scores: { deontology: 3 } },
      { text: 'Help, because not helping would make you the kind of crew you don\'t want to be.', scores: { 'virtue-ethics': 3 } },
      { text: 'Help only if interstellar custom or treaty requires it.', scores: { 'social-contract-theory': 2 } },
    ],
  },
];

type Scores = Record<EthicalTheory['id'], number>;

// Define explicit types for the answers state to avoid potential issues with complex inline generics
type QuizQuestionId = QuizQuestion['id'];
type SelectedOptionType = QuizQuestion['options'][0];

type AnswersState = {
  [Key in QuizQuestionId]?: SelectedOptionType;
};

export function EthicalFrameworkQuiz() {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [showResults, setShowResults] = useState(false);
  const [finalScores, setFinalScores] = useState<Scores | null>(null);

  const handleOptionSelect = (questionId: string, option: QuizQuestion['options'][0]) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateResults();
      setShowResults(true);
    }
  };

  const calculateResults = () => {
    const scores: Scores = mockEthicalTheories.reduce((acc, theory) => ({ ...acc, [theory.id]: 0 }), {} as Scores);
    
    Object.values(answers).forEach(answer => {
      if (answer && answer.scores) {
        Object.entries(answer.scores).forEach(([theoryId, score]) => {
          if (scores[theoryId] !== undefined && typeof score === 'number') {
            scores[theoryId] += score;
          }
        });
      }
    });
    setFinalScores(scores);

    // Find dominant framework
    const dominantFramework = Object.entries(scores).reduce(
      (best, [id, score]) => (score > best.score ? { id, score } : best),
      { id: '', score: -1 }
    ).id;

    // Record quiz result in user progress
    if (user?.uid) {
      const quizResult: QuizResult = {
        id: `quiz-${Date.now()}`,
        completedAt: new Date(),
        scores,
        dominantFramework,
      };
      recordQuizResult(user.uid, quizResult).catch((err) => {
        console.error('Failed to record quiz result:', err);
      });
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setFinalScores(null);
  };

  if (showResults && finalScores) {
    const dominantEntry = Object.entries(finalScores).reduce(
      (best, [id, score]) => (score > best.score ? { id, score } : best),
      { id: '', score: -1 }
    );
    const dominantFrameworkName =
      mockEthicalTheories.find((t) => t.id === dominantEntry.id)?.name ||
      dominantEntry.id ||
      'Unknown';

    const chartData = mockEthicalTheories.map(theory => ({
      name: theory.name,
      score: finalScores[theory.id] || 0,
      fill: `var(--chart-${(mockEthicalTheories.findIndex(t => t.id === theory.id) % 5) + 1})` // Cycle through chart colors
    })).sort((a,b) => b.score - a.score); // Sort for better visualization

    const chartConfig = chartData.reduce((acc, item, index) => {
        acc[item.name] = {
            label: item.name,
            color: `hsl(var(--chart-${(index % 5) + 1}))`
        };
        return acc;
    }, {} as any);


    return (
      <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-accent flex items-center"><Check className="mr-2"/>Quiz Results</CardTitle>
          <CardDescription>Your alignment with different ethical frameworks based on your answers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mb-6">
             <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        tickLine={false} 
                        axisLine={false} 
                        stroke="hsl(var(--foreground))"
                        tickFormatter={(value) => value.length > 20 ? value.substring(0,20) + '...' : value}
                    />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
                    <Bar dataKey="score" radius={5} />
                </BarChart>
            </ChartContainer>
          </div>
          <div className="space-y-2">
            {chartData.map(item => (
              <div key={item.name}>
                <h3 className="font-semibold text-primary">{item.name}: <span className="text-foreground">{item.score} points</span></h3>
                <p className="text-xs text-muted-foreground">{mockEthicalTheories.find(t => t.name === item.name)?.description.substring(0,100)}...</p>
              </div>
            ))}
          </div>
           <p className="text-sm text-muted-foreground mt-4 italic">
            Note: This quiz is a simplified exploration and not a definitive psychological assessment. Its purpose is to encourage reflection on ethical theories.
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-between gap-2">
          <Button onClick={handleRetakeQuiz} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" /> Retake Quiz
          </Button>
          {user && (
            <ShareToCommunityDialog
              type="quiz_result"
              defaultTitle={`My ethical framework profile: ${dominantFrameworkName}`}
              defaultSummary=""
              content={{
                scores: finalScores,
                dominantFramework: dominantFrameworkName,
                completedAt: new Date().toISOString(),
              }}
            />
          )}
        </CardFooter>
      </Card>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progressValue = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  return (
    <Card className="shadow-xl bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <Progress value={progressValue} className="w-full mb-2 h-2" />
        <CardTitle className="text-xl md:text-2xl text-primary flex items-center">
            <Lightbulb className="mr-2 h-6 w-6"/> Question {currentQuestionIndex + 1} of {quizQuestions.length}
        </CardTitle>
        <CardDescription className="text-lg text-foreground/90 pt-2">{currentQuestion.text}</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={answers[currentQuestion.id]?.text}
          onValueChange={(value) => {
            const selectedOption = currentQuestion.options.find(opt => opt.text === value);
            if (selectedOption) {
              handleOptionSelect(currentQuestion.id, selectedOption);
            }
          }}
          className="space-y-3"
        >
          {currentQuestion.options.map((option, index) => (
            <Label
              key={index}
              htmlFor={`${currentQuestion.id}-option-${index}`}
              className={`flex items-center p-4 rounded-md border border-border cursor-pointer transition-colors hover:bg-primary/10 ${answers[currentQuestion.id]?.text === option.text ? 'bg-primary/20 border-primary ring-2 ring-primary' : 'bg-background/30'}`}
            >
              <RadioGroupItem value={option.text} id={`${currentQuestion.id}-option-${index}`} className="mr-3" />
              <span className="text-base text-foreground">{option.text}</span>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion.id]}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Show Results'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
