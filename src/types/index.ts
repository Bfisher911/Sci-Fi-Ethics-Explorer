
import type { User as FirebaseUser } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  favoriteGenre?: string;
  storiesCompleted?: number;
  dilemmasAnalyzed?: number;
  communitySubmissions?: number;
  role?: string;
  isAdmin?: boolean;
  createdAt?: Date;
  lastUpdated?: Date;
}

export interface StoryChoice {
  text: string;
  nextSegmentId?: string;
  reflectionTrigger?: boolean;
}

export interface StorySegment {
  id: string;
  type: 'linear' | 'interactive';
  image?: string;
  imageHint?: string;
  text: string;
  choices?: StoryChoice[];
  poll?: PollData;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  genre: string;
  theme: string;
  author: string;
  imageUrl?: string;
  imageHint?: string;
  segments: StorySegment[];
  isInteractive: boolean;
  estimatedReadingTime: string;
}

export interface EthicalTheory {
  id: string;
  name: string;
  description: string;
  proponents?: string[];
  keyConcepts?: string[];
  exampleScenario?: string;
  imageUrl?: string;
  imageHint?: string;
}

export interface PollData {
  question: string;
  options: { text: string; votes: number }[];
}

export interface SubmittedDilemma {
  id?: string;
  title: string;
  description: string;
  theme: string;
  authorName: string;
  authorId?: string;
  imageUrl?: string;
  imageHint?: string;
  submittedAt: Date | any;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}
