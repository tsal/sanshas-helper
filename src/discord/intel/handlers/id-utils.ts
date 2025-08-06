/**
 * Utility functions for generating intel IDs
 */

/**
 * Generate a random string of specified length using alphanumeric characters
 * @param length - Length of the random string (default: 9)
 * @returns Random string containing lowercase letters and numbers
 */
export function generateRandomString(length: number = 9): string {
  return Math.random().toString(36).substr(2, length);
}

/**
 * Generate a standardized intel ID in the format: <type>-<randomString>
 * @param type - The intel type (e.g., 'rift', 'ore', 'fleet', 'site')
 * @returns Standardized intel ID
 */
export function generateIntelId(type: string): string {
  const randomString = generateRandomString();
  return `${type}-${randomString}`;
}
