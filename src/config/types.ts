import { Role as FrontierRole, isRole } from '../frontier/types';

/**
 * Available response themes for the bot
 */
export enum ResponseTheme {
  KUVAKEI = 'kuvakei',
  TRIGLAV = 'triglav',
  PLAIN = 'plain'
}

/**
 * Environment variable key for configuring tribe roles
 */
const AVAILABLE_ROLES_ENV_KEY = 'TRIBE_ROLES';

/**
 * Environment variable key for configuring response theme
 */
const RESPONSE_THEME_ENV_KEY = 'RESPONSE_THEME';

/**
 * Environment variable key for configuring roles command name
 */
const ROLES_COMMAND_NAME_ENV_KEY = 'ROLES_COMMAND_NAME';

/**
 * Environment variable key for configuring database path
 */
const DATABASE_PATH_ENV_KEY = 'DATABASE_PATH';

/**
 * Environment variable key for configuring default intel expiration hours
 */
const DEFAULT_INTEL_EXPIRATION_ENV_KEY = 'DEFAULT_INTEL_EXPIRATION';

/**
 * Interface for bot configuration
 */
export interface BotConfig {
  /**
   * Array of available frontier roles for the bot to manage
   */
  availableRoles: FrontierRole[];
  /**
   * The response theme to use for bot messages
   */
  responseTheme: ResponseTheme;
  /**
   * The name to use for the roles slash command
   */
  rolesCommandName: string;
  /**
   * The path to the database file, null if database is disabled
   */
  databasePath: string | null;
  /**
   * Default expiration time for intel items in hours
   */
  defaultIntelExpiration: number;
}

/**
 * Parses the RESPONSE_THEME environment variable
 * @returns A valid ResponseTheme value, defaulting to KUVAKEI
 */
const parseResponseTheme = (): ResponseTheme => {
  const envValue = process.env[RESPONSE_THEME_ENV_KEY];
  
  // If not set, default to kuvakei
  if (envValue === undefined) {
    return ResponseTheme.KUVAKEI;
  }
  
  // Check if it's a valid theme
  const normalizedValue = envValue.toLowerCase();
  if (Object.values(ResponseTheme).includes(normalizedValue as ResponseTheme)) {
    return normalizedValue as ResponseTheme;
  }
  
  // Invalid theme, fall back to kuvakei
  console.warn(`⚠️ Invalid response theme: "${envValue}". Valid themes are: ${Object.values(ResponseTheme).join(', ')}. Falling back to kuvakei.`);
  return ResponseTheme.KUVAKEI;
};

/**
 * Parses the ROLES_COMMAND_NAME environment variable
 * @returns A valid command name string, defaulting to 'eve-roles'
 */
const parseRolesCommandName = (): string => {
  const envValue = process.env[ROLES_COMMAND_NAME_ENV_KEY];
  
  // If not set, default to 'eve-roles'
  if (envValue === undefined) {
    return 'eve-roles';
  }
  
  // Basic validation - must be non-empty string
  const trimmedValue = envValue.trim();
  if (trimmedValue === '') {
    console.warn('⚠️ ROLES_COMMAND_NAME is empty, falling back to "eve-roles"');
    return 'eve-roles';
  }
  
  return trimmedValue;
};

/**
 * Parses the DATABASE_PATH environment variable
 * @returns Database path string or null if database is disabled
 */
const parseDatabasePath = (): string | null => {
  const envValue = process.env[DATABASE_PATH_ENV_KEY];
  
  // If not set, database is disabled
  if (envValue === undefined) {
    return null;
  }
  
  // If empty string, database is disabled
  const trimmedValue = envValue.trim();
  if (trimmedValue === '') {
    return null;
  }
  
  return trimmedValue;
};

/**
 * Parses the DEFAULT_INTEL_EXPIRATION environment variable
 * @returns Default intel expiration time in hours, defaulting to 24
 */
const parseDefaultIntelExpiration = (): number => {
  const envValue = process.env[DEFAULT_INTEL_EXPIRATION_ENV_KEY];
  
  // If not set, default to 24 hours
  if (envValue === undefined) {
    return 24;
  }
  
  // Parse as integer
  const parsedValue = parseInt(envValue.trim(), 10);
  
  // If not a valid number or negative, fall back to 24
  if (isNaN(parsedValue) || parsedValue < 0) {
    console.warn(`⚠️ Invalid DEFAULT_INTEL_EXPIRATION value: "${envValue}". Must be a non-negative number. Falling back to 24 hours.`);
    return 24;
  }
  
  return parsedValue;
};

/**
 * Parses the TRIBE_ROLES environment variable
 * @returns Array of valid FrontierRole values
 */
const parseAvailableRoles = (): FrontierRole[] => {
  const envValue = process.env[AVAILABLE_ROLES_ENV_KEY];
  
  // If not set, return all roles (no logging needed)
  if (envValue === undefined) {
    return Object.values(FrontierRole);
  }
  
  // If empty string, return all roles with log since it was explicitly set
  if (envValue === '') {
    return Object.values(FrontierRole);
  }
  
  // Split by comma and trim whitespace
  const roleStrings = envValue.split(',').map(role => role.trim());
  const validRoles: FrontierRole[] = [];
  
  roleStrings.forEach(roleString => {
    if (roleString === '') {
      return; // Skip empty strings
    }
    
    if (isRole(roleString)) {
      validRoles.push(roleString);
    } else {
      console.warn(`⚠️ Skipping invalid role: "${roleString}". Valid roles are: ${Object.values(FrontierRole).join(', ')}`);
    }
  });
  
  // If no valid roles found, fall back to all roles
  if (validRoles.length === 0) {
    console.warn('No valid roles found in TRIBE_ROLES, falling back to all roles');
    return Object.values(FrontierRole);
  }
  
  return validRoles;
};

/**
 * Gets the bot configuration from environment variables
 * @returns Bot configuration object
 */
export const getBotConfig = (): BotConfig => {
  const availableRoles = parseAvailableRoles();
  const responseTheme = parseResponseTheme();
  const rolesCommandName = parseRolesCommandName();
  const databasePath = parseDatabasePath();
  const defaultIntelExpiration = parseDefaultIntelExpiration();
  
  // Log configuration summary at startup
  const databaseStatus = databasePath ? `enabled (${databasePath})` : 'disabled';
  console.log(`Bot Configuration: Theme=${responseTheme}, Command=${rolesCommandName}, Database=${databaseStatus}, Intel Expiration=${defaultIntelExpiration}h, Roles=[${availableRoles.join(', ')}]`);
  
  return {
    availableRoles,
    responseTheme,
    rolesCommandName,
    databasePath,
    defaultIntelExpiration
  };
};
