import type { DailyGameData, GameRound } from '../../shared/types/api';

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns A new shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Randomizes the order of game rounds
 * @param rounds - Array of game rounds to randomize
 * @returns A new array with rounds in random order
 */
export function randomizeRounds(rounds: GameRound[]): GameRound[] {
  return shuffleArray(rounds);
}

/**
 * Randomly determines whether the real image should be on the left or right
 * @returns 'left' or 'right' with equal probability
 */
export function randomizeImagePosition(): 'left' | 'right' {
  return Math.random() < 0.5 ? 'left' : 'right';
}

/**
 * Transforms DailyGameData array into GameRound format with randomized image positions
 * @param gameData - Array of daily game data from the server
 * @returns Array of GameRound objects with randomized real image positions
 */
export function transformGameData(gameData: DailyGameData[]): GameRound[] {
  return gameData.map((data) => ({
    id: data.id,
    realImageUrl: data.real,
    renderImageUrl: data.render,
    source: data.source,
    realImagePosition: randomizeImagePosition(),
  }));
}
