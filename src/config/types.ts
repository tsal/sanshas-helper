import { Role as FrontierRole, isRole } from '../frontier/types';

/**
 * Environment variable key for configuring tribe roles
 */
const AVAILABLE_ROLES_ENV_KEY = 'TRIBE_ROLES';

/**
 * Interface for bot configuration
 */
export interface BotConfig {
  /**
   * Array of available frontier roles for the bot to manage
   */
  availableRoles: FrontierRole[];
}

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
  
  return {
    availableRoles
  };
};
