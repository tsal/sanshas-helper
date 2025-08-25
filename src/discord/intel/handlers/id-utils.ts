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

/**
 * Parse an intel ID into its components
 * @param id - Intel ID in format <type>-<randomString>
 * @returns Object with type and identifier, or null if invalid format
 */
export function parseIntelId(id: string): { type: string; identifier: string } | null {
  if (typeof id !== 'string' || id.trim() === '') {
    return null;
  }

  const dashIndex = id.indexOf('-');
  if (dashIndex === -1 || dashIndex === 0) {
    return null;
  }

  const type = id.substring(0, dashIndex);
  const identifier = id.substring(dashIndex + 1);

  if (type.trim() === '' || identifier.trim() === '') {
    return null;
  }

  return { type, identifier };
}

/**
 * Validate if an ID follows the correct intel ID format
 * @param id - ID to validate
 * @returns True if valid format, false otherwise
 */
export function isValidIntelId(id: string): boolean {
  return parseIntelId(id) !== null;
}

/**
 * Extract the type from an intel ID
 * @param id - Intel ID in format <type>-<randomString>
 * @returns Type string or null if invalid format
 */
export function getTypeFromIntelId(id: string): string | null {
  const parsed = parseIntelId(id);
  return parsed ? parsed.type : null;
}
