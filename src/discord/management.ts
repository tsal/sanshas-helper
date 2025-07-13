import { Guild, Role } from 'discord.js';
import { RoleConfig, createRoleOptions, DEFAULT_ROLE_CONFIGS, MANAGEMENT_ROLE } from './types';
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
 * Checks if the bot's management role exists, creates it if not
 * This role must be positioned above all roles that the bot will manage
 * @param guild - The Discord guild to check/create the role in
 * @returns Promise that resolves to the management role
 */
export const checkManagementRole = async (guild: Guild): Promise<Role> => {
  try {
    // Check if the management role already exists
    const existingRole = await findRoleByName(guild, MANAGEMENT_ROLE_NAME);
    
    if (existingRole !== undefined) {
      console.log(`Management role "${MANAGEMENT_ROLE_NAME}" already exists in guild: ${guild.name}`);
      return existingRole;
    }
    
    // Create the management role
    console.log(`Creating management role "${MANAGEMENT_ROLE_NAME}" in guild: ${guild.name}`);
    
    const managementRoleConfig = DEFAULT_ROLE_CONFIGS[MANAGEMENT_ROLE];
    const managementRole = await createRole(guild, managementRoleConfig);
    
    // TODO: Position the role appropriately in the hierarchy
    // This might require additional logic to move it above frontier roles
    
    return managementRole;
    
  } catch (error) {
    console.error(`Failed to check/create management role in guild ${guild.name}:`, error);
    throw new Error(`Management role setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    
    // Always ensure the management role exists first
    const managementRole = await checkManagementRole(guild);
    roles.push(managementRole);
    
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
        console.log(`Frontier role "${roleConfig.name}" already exists in guild: ${guild.name}`);
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
    console.error(`Failed to ensure all roles in guild ${guild.name}:`, error);
    throw new Error(`Role setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
