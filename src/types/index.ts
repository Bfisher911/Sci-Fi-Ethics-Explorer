
import type { User as FirebaseUser } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  avatarUrl?: string;
  favoriteGenre?: string;
  // Mock engagement stats
  storiesCompleted?: number;
  dilemmasAnalyzed?: number;
  communitySubmissions?: number;
  createdAt?: Date; // Store as Date object in the app
  lastUpdated?: Date; // Store as Date object in the app
}

export interface StoryChoice {
  text: string;
  nextSegmentId?: string; // Points to the next segment or indicates an ending
  reflectionTrigger?: boolean; // If this choice leads to a custom reflection
}

export interface StorySegment {
  id: string;
  type: 'linear' | 'interactive';
  image?: string;
  imageHint?: string;
  text: string;
  choices?: StoryChoice[];
  poll?: PollData; // Optional poll for this segment
}

export interface Story {
  id: string;
  title: string;
  description: string;
  genre: string; // e.g., "Cyberpunk", "Space Opera", "Post-Apocalyptic"
  theme: string; // e.g., "AI Sentience", "Resource Scarcity", "Transhumanism"
  author: string;
  imageUrl?: string;
  imageHint?: string;
  segments: StorySegment[]; // Array of story segments
  isInteractive: boolean;
  estimatedReadingTime: string; // e.g., "10 min read"
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
  id?: string; // Assigned by Firestore
  title: string;
  description: string;
  theme: string;
  authorName: string; // User's display name or anonymous
  authorId?: string; // Firebase UID if logged in
  imageUrl?: string;
  imageHint?: string;
  // Store as Date in app, will be Timestamp in Firestore
  submittedAt: Date | any; // Allow 'any' for serverTimestamp during creation
  status: 'pending' | 'approved' | 'rejected';
}

// For AI Chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}
