export type InitResponse = {
  type: 'init';
  username: string;
} & (
    | {
      // Daily game format
      gameData: unknown;
      date: string;
    }
    | {
      // Legacy level format
      levelName: string;
      levelData: string;
    }
  );

export type RoRenderBackendData = {
  id: number;
  imageKey: string;
  isAI: boolean;
  pairId: string;
  gameDate: string;
  source: string;
};

export type DailyGameData = {
  id: string;
  real: string;
  render: string;
  source: string;
};

// API Request/Response Types

export interface SaveScoreRequest {
  userId: string;
  score: number;
  date: string; // YYYY-MM-DD
  correctGuesses: number;
  timeMs: number;
}

export interface SaveScoreResponse {
  success: boolean;
  saved: boolean; // false if already played today
  rank?: number;
  totalPlayers?: number;
  originalScore?: {
    correct: number;
    timeMs: number;
  };
  message?: string;
}

export interface LeaderboardRequest {
  date: string; // YYYY-MM-DD
  userId?: string; // optional, for user-specific rank
}

export interface LeaderboardResponse {
  date: string;
  totalPlayers: number;
  userRank?: number;
  userScore?: number;
  topPlayers: TopPlayer[];
  userData?: {
    correct: number;
    timeMs: number;
    snoovatar: string;
  };
}

export interface CheckPlayedRequest {
  userId: string;
  date: string; // YYYY-MM-DD
}

export interface CheckPlayedResponse {
  played: boolean;
  totalPlayersToday: number;
  score?: {
    correct: number;
    incorrect: number;
    timeMs: number;
    rank: number;
  };
}

// Game State Interfaces

export interface GameRound {
  id: string;
  realImageUrl: string;
  renderImageUrl: string;
  source: string;
  realImagePosition: 'left' | 'right'; // randomized
}

export interface GameState {
  rounds: GameRound[];
  currentRoundIndex: number;
  correctCount: number;
  incorrectCount: number;
  startTime: number;
  elapsedTime: number; // milliseconds
  userAnswers: boolean[]; // true = correct, false = incorrect
}

export interface TitleScreenState {
  totalPlayersToday: number;
  userPlayedToday: boolean;
  previousScore?: {
    correct: number;
    incorrect: number;
    time: number;
    rank: number;
  };
}

export interface LoadingState {
  status: 'loading' | 'success' | 'error';
  progress: number; // 0-100
  errorMessage?: string;
}

export interface ResultsState {
  correct: number;
  incorrect: number;
  totalTime: number; // milliseconds
  score: number;
  rank: number;
  totalPlayers: number;
  date: string; // YYYY-MM-DD
  sources: string[];
  scoreSaved: boolean;
  showSources: boolean;
}

export interface PostCommentRequest {
  comment: string;
  score: number;
  time: string; // MM:SS:mmm format
  rank?: number;
  totalPlayers?: number;
}

export interface PostCommentResponse {
  success: boolean;
  commentId?: string;
  message?: string;
}


export interface TopPlayer {
  rank: number;
  username: string;
  score: number;
  correct: number;
  timeMs: number;
  snoovatar: string;
}