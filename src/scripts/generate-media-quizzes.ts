import { scifiMediaData } from '../data/scifi-media';
import * as fs from 'fs';
import * as path from 'path';

// Read API key from .env
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY not found.");
  process.exit(1);
}

const OUT_FILE = path.join(process.cwd(), 'src/data/scifi-media-quizzes.ts');

const PROMPT_TEMPLATE = `
You are an expert ethics curriculum designer specializing in science fiction. 
Generate a 5-question multiple choice quiz for the following sci-fi media artifact. 
Focus on the ethical themes it raises (e.g. technology ethics, personhood, systemic oppression, bioethics).

Artifact Name: {title}
Creator: {creator}
Plot Summary: {plot}
Ethics Explored: {ethics}

Return ONLY valid JSON with exactly the following structure, no markdown formatting, no comments:
{
  "title": "{title}: Ethics and Themes",
  "description": "Five questions on the ethical themes of {title}.",
  "questions": [
    {
      "prompt": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Explanation of why the correct answer is right.",
      "difficulty": "recall" // must be 'recall', 'conceptual', or 'applied'
    }
  ]
}
`;

async function generateQuiz(mediaItem: any) {
  const prompt = PROMPT_TEMPLATE
    .replace(/{title}/g, mediaItem.title)
    .replace(/{creator}/g, mediaItem.creator)
    .replace(/{plot}/g, mediaItem.plot)
    .replace(/{ethics}/g, mediaItem.ethicsExplored.join(', '));

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      console.error(`Failed to generate for ${mediaItem.title}: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error(`No text returned for ${mediaItem.title}`);
      return null;
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error(`Failed to parse JSON for ${mediaItem.title}`, text);
      return null;
    }
    
    return parsed;

  } catch (error) {
    console.error(`Error generating for ${mediaItem.title}:`, error);
    return null;
  }
}

async function main() {
  const quizzes = [];
  
  console.log(`Found ${scifiMediaData.length} media items. Generating quizzes...`);
  
  for (let i = 0; i < scifiMediaData.length; i++) {
    const media = scifiMediaData[i];
    console.log(`[${i+1}/${scifiMediaData.length}] Generating quiz for ${media.title}...`);
    
    const quizData = await generateQuiz(media);
    if (quizData) {
      quizzes.push({
        id: media.id,
        ...quizData
      });
    } else {
      console.log(`Skipping ${media.title} due to generation failure.`);
    }
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Write the file
  let fileContent = `import type { Quiz } from '@/types';

function buildQuiz(
  mediaId: string,
  subjectName: string,
  title: string,
  description: string,
  questions: Array<{
    prompt: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    difficulty: 'recall' | 'conceptual' | 'applied';
  }>
): Quiz {
  const quizId = \`scifi-media-\${mediaId}\`;
  return {
    id: quizId,
    subjectType: 'scifi-media',
    subjectId: mediaId,
    subjectName,
    title,
    description,
    questions: questions.map((q, i) => ({
      id: \`\${quizId}-q\${i + 1}\`,
      prompt: q.prompt,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: q.explanation,
      difficulty: q.difficulty,
    })),
    estimatedMinutes: 7,
    passingScorePercent: 70,
    createdAt: new Date(0),
  };
}

export const scifiMediaQuizzes: Quiz[] = [
`;

  for (const q of quizzes) {
    const questionsStr = JSON.stringify(q.questions, null, 6).replace(/"([^"]+)":/g, '$1:');
    
    fileContent += `  buildQuiz(
    '${q.id}',
    ${JSON.stringify(q.title.split(':')[0])},
    ${JSON.stringify(q.title)},
    ${JSON.stringify(q.description)},
    ${questionsStr}
  ),

`;
  }

  fileContent += `];

export function getStaticScifiMediaQuiz(mediaId: string): Quiz | null {
  return scifiMediaQuizzes.find((q) => q.subjectId === mediaId) || null;
}
`;

  fs.writeFileSync(OUT_FILE, fileContent, 'utf8');
  console.log(`Successfully wrote ${quizzes.length} quizzes to ${OUT_FILE}`);
}

main().catch(console.error);
