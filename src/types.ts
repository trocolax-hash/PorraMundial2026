export type ParticipantName = 'Raúl' | 'Paco Padre' | 'David' | 'Samuel' | 'Héctor' | 'PacBoy';

export const PARTICIPANTS: ParticipantName[] = [
  'Raúl',
  'Paco Padre',
  'David',
  'Samuel',
  'Héctor',
  'PacBoy'
];

export interface ParticipantBet {
  scoreA: number;
  scoreB: number;
}

export interface Match {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  teamA: string;
  teamB: string;
  scoreA: number | null; // Real result team A
  scoreB: number | null; // Real result team B
  bets: Record<string, ParticipantBet | null>; // Bets of participants by name
  isCompleted: boolean;
  manualWinner: ParticipantName | 'Draw' | null; // Custom manual tie-breaker option
  createdAt: number;
}

export interface ParticipantStats {
  name: ParticipantName;
  score: number; // Cumulative score
  exactScores: number; // Number of exact guesses (3 points each)
  correctOutcomes: number; // Number of correct outcomes (1 point each)
  missedGuesses: number; // Number of wrong guesses
  totalBets: number;
  matchHistory: {
    matchId: string;
    points: number;
    prediction: string;
    actualResult: string;
    opponentPair: string;
  }[];
}

export type FoodReward = 'Burger King' | 'McDonalds' | 'Telepizza';
