export interface Celebrity {
  name: string;
  birthday: string; // YYYY-MM-DD format
  achievements: string[];
  category: CelebrityCategory;
}

export interface ZodiacSign {
  name: string;
  symbol: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  dateRange: {
    start: { month: number; day: number };
    end: { month: number; day: number };
  };
}

export type CelebrityCategory = 'actors' | 'singers' | 'footballers' | 'basketball' | 'wwe' | 'ufc' | 'kdrama';

export interface GameState {
  currentRound: number;
  score: number;
  selectedCategory: CelebrityCategory | null;
  currentCelebrity: Celebrity | null;
  gamePhase: 'login' | 'category-selection' | 'quiz' | 'feedback' | 'game-over' | 'leaderboard';
  timeLeft: number;
  isAnswered: boolean;
  lastAnswer: {
    correct: boolean;
    selectedZodiac: string;
    correctZodiac: string;
  } | null;
  usedCelebrities: Celebrity[];
}

export interface LeaderboardEntry {
  id?: string;
  username: string;
  score: number; // This will map to total_score from database
  total_score?: number; // For database compatibility
  gamesPlayed: number; // Changed to required and camelCase for component compatibility
  games_played?: number; // For database compatibility
  average_score?: number;
  percentage: number;
  date: string;
  last_played?: string; // For database compatibility
  grade: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  username: string;
  password: string;
}