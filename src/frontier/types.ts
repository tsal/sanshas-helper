/**
 * Enum representing the available roles in EVE Frontier
 * These values are used as keys for mapping to Discord role identifiers
 */
export enum Role {
  /**
   * Exploration role for players focused on discovering and mapping new territories
   */
  Exploration = 'Exploration',
  /**
   * Industry role for players focused on manufacturing and production
   */
  Industry = 'Industry',
  /**
   * Mining role for players focused on resource extraction
   */
  Mining = 'Mining',
  /**
   * PVE role for players focused on player versus environment content
   */
  PVE = 'PVE',
  /**
   * PVP role for players focused on player versus player combat
   */
  PVP = 'PVP',
  /**
   * Nerd role for software engineers and technical players
   */
  Nerd = 'Nerd',
  /**
   * Hauling role for players focused on transportation and logistics
   */
  Hauling = 'Hauling',
  /**
   * Market role for players focused on trading and commerce
   */
  Market = 'Market'
}

/**
 * Type guard to check if a value is a valid Role enum value
 * @param value - The value to check
 * @returns True if the value is a valid Role
 */
export const isRole = (value: unknown): value is Role => {
  return typeof value === 'string' && Object.values(Role).includes(value as Role);
};

/**
 * Parse a string into a Role enum value
 * @param value - The string value to parse
 * @returns The Role enum value
 * @throws Error if the value is not a valid Role
 */
export const parseRole = (value: string): Role => {
  if (!isRole(value)) {
    throw new Error(`Invalid role value: ${value}. Valid roles are: ${Object.values(Role).join(', ')}`);
  }
  return value;
};

/**
 * Parse a Role from JSON data
 * @param json - The JSON data containing a role property
 * @returns The Role enum value
 * @throws Error if the JSON data does not contain a valid role
 */
export const parseRoleFromJson = (json: { role: unknown }): Role => {
  if (typeof json.role !== 'string') {
    throw new Error('Role must be a string');
  }
  return parseRole(json.role);
};
