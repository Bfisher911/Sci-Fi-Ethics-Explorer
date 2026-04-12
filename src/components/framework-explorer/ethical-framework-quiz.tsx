
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
    text: 'A new technology could greatly benefit humanity but might violate some individuals\' privacy. Your stance?',
    options: [
      { text: 'Proceed if benefits outweigh privacy harms significantly.', scores: { utilitarianism: 3, 'social-contract-theory': 1 } },
      { text: 'Prioritize individual privacy rights, even if it means slower progress.', scores: { deontology: 3 } },
      { text: 'Seek a balanced approach that respects privacy while pursuing benefits.', scores: { 'virtue-ethics': 2, 'social-contract-theory': 2 } },
      { text: 'The societal agreement on privacy should dictate the course of action.', scores: { 'social-contract-theory': 3 } },
    ],
  },
  {
    id: 'q3',
    text: 'Is it ever permissible to break a promise?',
    options: [
      { text: 'Yes, if breaking it leads to a much better overall outcome.', scores: { utilitarianism: 3 } },
      { text: 'No, promises are moral obligations that must be kept.', scores: { deontology: 3 } },
      { text: 'It depends on the character of the person and the nature of the promise.', scores: { 'virtue-ethics': 3 } },
      { text: 'Yes, if societal conditions or mutual understanding changes significantly.', scores: { 'social-contract-theory': 2 } },
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
          if (scores[theoryId] !== undefined) {
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
        <CardFooter>
          <Button onClick={handleRetakeQuiz} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" /> Retake Quiz
          </Button>
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
