import { Guild, Role } from 'discord.js';
import { RoleConfig, createRoleOptions, DEFAULT_ROLE_CONFIGS } from './types';
import { getBotConfig } from '../config';

/**
 * Name of the bot's management role
 */
const MANAGEMENT_ROLE_NAME = 'Sansha\'s Helper';

/**
 * Checks if a role with the given name exists in the guild
 * @param guild - The Discord guild to check
 * @param roleName - The name of the role to search for
 * @returns Promise that resolves to the role if found, undefined otherwise
 */
export const findRoleByName = async (guild: Guild, roleName: string): Promise<Role | undefined> => {
  // Ensure the guild's roles are fully loaded
  await guild.roles.fetch();
  
  return guild.roles.cache.find(role => role.name === roleName);
};

/**
 * Creates a new Discord role using the provided configuration
 * @param guild - The Discord guild to create the role in
 * @param config - The role configuration to use
 * @returns Promise that resolves to the created role
 */
export const createRole = async (guild: Guild, config: RoleConfig): Promise<Role> => {
  try {
    console.log(`Creating role "${config.name}" in guild: ${guild.name}`);
    
    const role = await guild.roles.create(createRoleOptions(config));
    
    console.log(`Successfully created role "${config.name}" with ID: ${role.id}`);
    
    return role;
    
  } catch (error) {
    console.error(`Failed to create role "${config.name}" in guild ${guild.name}:`, error);
    throw new Error(`Role creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Checks if the bot's management role exists and gathers indexing information
 * This role is automatically created by Discord when the bot is added with appropriate permissions
 * @param guild - The Discord guild to check
 * @returns Promise that resolves to the management role if found
 * @throws Error if the management role is not found
 */
export const checkManagementRole = async (guild: Guild): Promise<Role> => {
  try {
    // Check if the management role exists (should be auto-created by Discord)
    const existingRole = await findRoleByName(guild, MANAGEMENT_ROLE_NAME);
    
    if (existingRole !== undefined) {
      console.log(`Management role "${MANAGEMENT_ROLE_NAME}" found in guild: ${guild.name}`);
      console.log(`  Role ID: ${existingRole.id}`);
      console.log(`  Role position: ${existingRole.position}`);
      console.log(`  Role color: 0x${existingRole.color.toString(16).toUpperCase()}`);
      console.log(`  Role permissions: ${existingRole.permissions.bitfield.toString()}`);
      
      // TODO: Check role hierarchy position relative to frontier roles
      // TODO: Alert server owner if role position needs adjustment
      
      return existingRole;
    }
    
    // Management role not found - this indicates a setup issue
    console.error(`Management role "${MANAGEMENT_ROLE_NAME}" not found in guild: ${guild.name}`);
    console.error('This role should be automatically created by Discord when the bot is added with proper permissions.');
    console.error('Please ensure the bot was invited with "Manage Roles" permission.');
    
    throw new Error(`Management role "${MANAGEMENT_ROLE_NAME}" not found. Bot may not have been properly invited with required permissions.`);
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      // Re-throw our custom error
      throw error;
    }
    
    console.error(`Failed to check management role in guild ${guild.name}:`, error);
    throw new Error(`Management role check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Ensures all enabled roles exist in the guild, creating them if necessary
 * @param guild - The Discord guild to check/create roles in
 * @param config - The bot configuration object (optional, will fetch if not provided)
 * @returns Promise that resolves to an array of all managed roles
 */
export const ensureAllRoles = async (guild: Guild, config = getBotConfig()): Promise<Role[]> => {
  try {
    const roles: Role[] = [];
    
    // Always check that the management role exists first (auto-created by Discord)
    try {
      const managementRole = await checkManagementRole(guild);
      roles.push(managementRole);
    } catch (error) {
      console.error(`Management role check failed in guild ${guild.name}, continuing with frontier roles:`, error);
      // Continue with frontier role setup even if management role is missing
    }
    
    // Check and create frontier roles based on configuration
    for (const frontierRole of config.availableRoles) {
      const roleConfig = DEFAULT_ROLE_CONFIGS[frontierRole];
      
      if (!roleConfig) {
        console.warn(`No default configuration found for role: ${frontierRole}`);
        continue;
      }
      
      // Check if the role already exists
      const existingRole = await findRoleByName(guild, roleConfig.name);
      
      if (existingRole) {
        roles.push(existingRole);
      } else {
        // Create the frontier role
        const newRole = await createRole(guild, roleConfig);
        roles.push(newRole);
      }
    }
    
    console.log(`Successfully ensured ${roles.length} roles exist in guild: ${guild.name}`);
    return roles;
    
  } catch (error) {
    console.error(`Failed to ensure roles in guild ${guild.name}:`, error);
    throw new Error(`Role setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
