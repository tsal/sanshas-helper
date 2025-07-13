import { Guild, Role } from 'discord.js';

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
const findRoleByName = async (guild: Guild, roleName: string): Promise<Role | undefined> => {
  // Ensure the guild's roles are fully loaded
  await guild.roles.fetch();
  
  return guild.roles.cache.find(role => role.name === roleName);
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
    
    const managementRole = await guild.roles.create({
      name: MANAGEMENT_ROLE_NAME,
      color: 0x8B0000, // Dark red color for Sansha's Nation theme
      reason: 'Bot management role for role assignment functionality',
      permissions: [], // No special permissions needed, just for hierarchy
      hoist: false, // Don't display separately in member list
      mentionable: false // Don't allow mentioning this role
    });
    
    console.log(`Successfully created management role "${MANAGEMENT_ROLE_NAME}" with ID: ${managementRole.id}`);
    
    // TODO: Position the role appropriately in the hierarchy
    // This might require additional logic to move it above frontier roles
    
    return managementRole;
    
  } catch (error) {
    console.error(`Failed to check/create management role in guild ${guild.name}:`, error);
    throw new Error(`Management role setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
