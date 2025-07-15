import { Role as FrontierRole, isRole } from '../frontier/types';

/**
 * Available response themes for the bot
 */
export enum ResponseTheme {
  KUVAKEI = 'kuvakei',
  TRIGLAV = 'triglav'
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
  
  console.log(`Parsing RESPONSE_THEME: "${envValue}"`);
  
  // Check if it's a valid theme
  const normalizedValue = envValue.toLowerCase();
  if (Object.values(ResponseTheme).includes(normalizedValue as ResponseTheme)) {
    console.log(`✓ Using response theme: ${normalizedValue}`);
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
    console.log('TRIBE_ROLES set to empty string, using all roles');
    return Object.values(FrontierRole);
  }
  
  console.log(`Parsing TRIBE_ROLES: "${envValue}"`);
  
  // Split by comma and trim whitespace
  const roleStrings = envValue.split(',').map(role => role.trim());
  const validRoles: FrontierRole[] = [];
  
  roleStrings.forEach(roleString => {
    if (roleString === '') {
      return; // Skip empty strings
    }
    
    if (isRole(roleString)) {
      validRoles.push(roleString);
      console.log(`✓ Added role: ${roleString}`);
    } else {
      console.warn(`⚠️ Skipping invalid role: "${roleString}". Valid roles are: ${Object.values(FrontierRole).join(', ')}`);
    }
  });
  
  // If no valid roles found, fall back to all roles
  if (validRoles.length === 0) {
    console.warn('No valid roles found in TRIBE_ROLES, falling back to all roles');
    return Object.values(FrontierRole);
  }
  
  console.log(`Configured ${validRoles.length} tribe roles: ${validRoles.join(', ')}`);
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
  
  return {
    availableRoles,
    responseTheme,
    rolesCommandName
  };
};
