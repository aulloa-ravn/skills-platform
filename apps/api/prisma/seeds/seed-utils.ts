import { faker } from '@faker-js/faker';

/**
 * Initialize Faker with a deterministic seed for reproducible data generation
 */
export function initializeFaker(seed: number = 12345): void {
  faker.seed(seed);
}

/**
 * Generate email in the format: firstname.lastname@ravn.com
 */
export function generateEmail(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@ravn.com`;
}

/**
 * Generate a unique Mission Board ID (UUID format)
 */
export function generateMissionBoardId(): string {
  return faker.string.uuid();
}

/**
 * Generate a random date within a range
 */
export function generateDateInRange(
  startDate: Date,
  endDate: Date = new Date(),
): Date {
  return faker.date.between({ from: startDate, to: endDate });
}

/**
 * Generate a date within the past N days
 */
export function generateRecentDate(days: number): Date {
  return faker.date.recent({ days });
}

/**
 * Generate a date in the past (months ago)
 */
export function generatePastDate(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return generateDateInRange(date, new Date());
}

/**
 * Distribute items into groups based on percentages
 * @param totalCount Total number of items to distribute
 * @param percentages Array of percentages that should sum to 100
 * @returns Array of counts for each group
 */
export function distributeByPercentages(
  totalCount: number,
  percentages: number[],
): number[] {
  const sum = percentages.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 100) > 0.01) {
    throw new Error(
      `Percentages must sum to 100, got ${sum}: ${percentages.join(', ')}`,
    );
  }

  const counts = percentages.map((p) => Math.floor((totalCount * p) / 100));

  // Distribute remainder to maintain exact total
  const remainder = totalCount - counts.reduce((a, b) => a + b, 0);
  for (let i = 0; i < remainder; i++) {
    counts[i % counts.length]++;
  }

  return counts;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Select N random items from an array without replacement
 */
export function selectRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Get a random integer between min and max (inclusive)
 */
export function getRandomInt(min: number, max: number): number {
  return faker.number.int({ min, max });
}

/**
 * Get a random item from an array
 */
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
