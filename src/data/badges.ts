import type { Badge } from '@/types';

export const allBadges: Badge[] = [
  { id: 'first_story', name: 'First Steps', description: 'Complete your first story', icon: 'BookOpen', criteria: 'Complete 1 story', category: 'stories' },
  { id: 'five_stories', name: 'Avid Reader', description: 'Complete 5 stories', icon: 'Library', criteria: 'Complete 5 stories', category: 'stories' },
  { id: 'ten_stories', name: 'Story Master', description: 'Complete 10 stories', icon: 'Award', criteria: 'Complete 10 stories', category: 'stories' },
  { id: 'first_debate', name: 'Debater', description: 'Participate in your first debate', icon: 'Scale', criteria: 'Join 1 debate', category: 'debates' },
  { id: 'debate_champion', name: 'Champion Debater', description: 'Participate in 10 debates', icon: 'Trophy', criteria: 'Join 10 debates', category: 'debates' },
  { id: 'quiz_master', name: 'Quiz Master', description: 'Complete the ethical framework quiz 3 times', icon: 'Brain', criteria: 'Complete 3 quizzes', category: 'learning' },
  { id: 'first_submission', name: 'Contributor', description: 'Submit your first dilemma', icon: 'PenTool', criteria: 'Submit 1 dilemma', category: 'community' },
  { id: 'ten_analyses', name: 'Deep Thinker', description: 'Analyze 10 scenarios', icon: 'Microscope', criteria: 'Analyze 10 scenarios', category: 'analysis' },
  { id: 'community_star', name: 'Community Star', description: 'Submit 5 dilemmas', icon: 'Star', criteria: 'Submit 5 dilemmas', category: 'community' },
  { id: 'devil_advocate', name: "Devil's Advocate", description: 'Use the Devil\'s Advocate feature 5 times', icon: 'Flame', criteria: 'Use Devil\'s Advocate 5 times', category: 'analysis' },
  // Curriculum tier badges
  { id: 'novice_navigator', name: 'Novice Navigator', description: 'Complete your first curriculum', icon: 'Compass', criteria: 'Complete 1 curriculum', category: 'learning' },
  { id: 'path_finder', name: 'Path Finder', description: 'Complete 3 curricula', icon: 'GraduationCap', criteria: 'Complete 3 curricula', category: 'learning' },
  { id: 'moral_architect', name: 'Moral Architect', description: 'Complete 5 curricula', icon: 'Award', criteria: 'Complete 5 curricula', category: 'learning' },
  { id: 'grand_philosopher', name: 'Grand Philosopher', description: 'Complete 10 curricula', icon: 'Crown', criteria: 'Complete 10 curricula', category: 'learning' },
  // Quiz tier badges
  { id: 'quiz_apprentice', name: 'Quiz Apprentice', description: 'Pass 3 subject quizzes', icon: 'Brain', criteria: 'Pass 3 quizzes', category: 'learning' },
  { id: 'quiz_master_v2', name: 'Quiz Virtuoso', description: 'Pass 10 subject quizzes', icon: 'Trophy', criteria: 'Pass 10 quizzes', category: 'learning' },
  // Certificate badge
  { id: 'certified', name: 'Certified Explorer', description: 'Earn your first completion certificate', icon: 'BadgeCheck', criteria: 'Earn 1 certificate', category: 'learning' },
];
