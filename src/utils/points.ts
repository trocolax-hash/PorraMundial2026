import { Match, ParticipantStats, PARTICIPANTS, ParticipantName } from '../types';

/**
 * Checks if a match is locked for betting (more than 10 minutes passed from scheduled date and time).
 */
export function isMatchLocked(matchDate: string, matchTime: string): boolean {
  if (!matchDate || !matchTime) return false;
  try {
    const matchDateTime = new Date(`${matchDate}T${matchTime}`);
    if (isNaN(matchDateTime.getTime())) return false;
    const now = new Date();
    const diffMs = now.getTime() - matchDateTime.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes > 10;
  } catch (e) {
    return false;
  }
}

/**
 * Calculates the score for a single bet given the actual result.
 * @returns points based on the new advanced system:
 * - 5 points for Pleno Exacto (exact match)
 * - 3 points for Diferencia exacta (correct outcome and exact goal difference)
 * - 1 point for Tendencia (correct outcome only)
 * - 0 points otherwise
 * Points are doubled if the match involves "España".
 */
export function calculateBetPoints(
  predictionA: number,
  predictionB: number,
  actualA: number | null,
  actualB: number | null,
  teamA?: string,
  teamB?: string
): number {
  if (actualA === null || actualB === null) return 0;

  let basePoints = 0;

  // 1. Pleno Exacto (5 points)
  if (predictionA === actualA && predictionB === actualB) {
    basePoints = 5;
  }
  // 2. Diferencia exacta (3 points)
  else if ((predictionA - predictionB) === (actualA - actualB)) {
    basePoints = 3;
  }
  // 3. Tendencia (1 point)
  else {
    const predOutcome = Math.sign(predictionA - predictionB);
    const actualOutcome = Math.sign(actualA - actualB);
    if (predOutcome === actualOutcome) {
      basePoints = 1;
    }
  }

  // x2 Multiplier if the match includes 'España' (case-insensitive)
  const isSpainMatch =
    (teamA || '').toLowerCase().includes('españa') ||
    (teamB || '').toLowerCase().includes('españa');

  if (isSpainMatch) {
    return basePoints * 2;
  }

  return basePoints;
}

/**
 * Compiles stats for all participants based on the list of matches.
 */
export function compileLeaderboard(matches: Match[]): ParticipantStats[] {
  const statsMap: Record<ParticipantName, ParticipantStats> = {} as any;

  // Initialize stats for each participant
  PARTICIPANTS.forEach((name) => {
    statsMap[name] = {
      name,
      score: 0,
      exactScores: 0,
      correctOutcomes: 0,
      missedGuesses: 0,
      totalBets: 0,
      matchHistory: []
    };
  });

  // Calculate points for completed matches
  matches.forEach((match) => {
    const isCompleted = match.isCompleted && match.scoreA !== null && match.scoreB !== null;
    if (!isCompleted) return;

    const actualA = match.scoreA!;
    const actualB = match.scoreB!;
    const actualStr = `${actualA}-${actualB}`;
    const opponentPair = `${match.teamA} vs ${match.teamB}`;

    PARTICIPANTS.forEach((name) => {
      const bet = match.bets[name];
      if (!bet) return; // No bet placed

      statsMap[name].totalBets += 1;
      const pts = calculateBetPoints(bet.scoreA, bet.scoreB, actualA, actualB, match.teamA, match.teamB);
      statsMap[name].score += pts;

      const isExact = bet.scoreA === actualA && bet.scoreB === actualB;
      const sameOutcome = Math.sign(bet.scoreA - bet.scoreB) === Math.sign(actualA - actualB);

      if (isExact) {
        statsMap[name].exactScores += 1;
      } else if (sameOutcome) {
        statsMap[name].correctOutcomes += 1;
      } else {
        statsMap[name].missedGuesses += 1;
      }

      statsMap[name].matchHistory.push({
        matchId: match.id,
        points: pts,
        prediction: `${bet.scoreA}-${bet.scoreB}`,
        actualResult: actualStr,
        opponentPair
      });
    });
  });

  // Convert map to sorted array (highest score first)
  return PARTICIPANTS.map((name) => statsMap[name]).sort((a, b) => {
    // Sort by score first
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Tie-breaker 1: Number of exact matches
    if (b.exactScores !== a.exactScores) {
      return b.exactScores - a.exactScores;
    }
    // Tie-breaker 2: Number of correct outcomes
    if (b.correctOutcomes !== a.correctOutcomes) {
      return b.correctOutcomes - a.correctOutcomes;
    }
    // Name alphabetical (standard deterministic fallback)
    return a.name.localeCompare(b.name);
  });
}

/**
 * Gets mock matches to initialize the app with if the user has no matches saved.
 * This makes the interface immediately beautiful and functional.
 */
export function getInitialMatches(): Match[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: 'match-1',
      date: '2026-06-11',
      time: '18:00',
      teamA: 'Estados Unidos',
      teamB: 'Canadá',
      scoreA: 2,
      scoreB: 1,
      isCompleted: true,
      manualWinner: null,
      createdAt: now - 3 * dayMs,
      bets: {
        'Raúl': { scoreA: 2, scoreB: 1 }, // Exact 3pt
        'Paco Padre': { scoreA: 1, scoreB: 1 }, // Wrong 0pt
        'David': { scoreA: 3, scoreB: 0 }, // Correct outcome 1pt
        'Samuel': { scoreA: 2, scoreB: 2 }, // Wrong 0pt
        'Héctor': { scoreA: 2, scoreB: 1 }, // Exact 3pt
        'PacBoy': { scoreA: 1, scoreB: 0 } // Correct outcome 1pt
      }
    },
    {
      id: 'match-2',
      date: '2026-06-12',
      time: '20:00',
      teamA: 'México',
      teamB: 'Brasil',
      scoreA: 1,
      scoreB: 1,
      isCompleted: true,
      manualWinner: null,
      createdAt: now - 2 * dayMs,
      bets: {
        'Raúl': { scoreA: 0, scoreB: 2 }, // Wrong
        'Paco Padre': { scoreA: 1, scoreB: 1 }, // Exact 3pt
        'David': { scoreA: 1, scoreB: 1 }, // Exact 3pt
        'Samuel': { scoreA: 1, scoreB: 2 }, // Wrong
        'Héctor': { scoreA: 0, scoreB: 0 }, // Correct outcome 1pt
        'PacBoy': { scoreA: 1, scoreB: 1 } // Exact 3pt
      }
    },
    {
      id: 'match-3',
      date: '2026-06-15',
      time: '17:00',
      teamA: 'España',
      teamB: 'Francia',
      scoreA: null,
      scoreB: null,
      isCompleted: false,
      manualWinner: null,
      createdAt: now - dayMs,
      bets: {
        'Raúl': { scoreA: 2, scoreB: 1 },
        'Paco Padre': { scoreA: 1, scoreB: 1 },
        'David': { scoreA: 2, scoreB: 0 },
        'Samuel': { scoreA: 1, scoreB: 2 },
        'Héctor': { scoreA: 3, scoreB: 2 },
        'PacBoy': { scoreA: 0, scoreB: 1 }
      }
    }
  ];
}
