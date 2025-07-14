import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, GuildMember } from 'discord.js';
import { getBotConfig } from '../config';
import { findRoleByName } from './management';
// import { RoleMap } from './types';

// TODO: Replace with real Discord role IDs
// const ROLE_MAP: RoleMap = {
//   [FrontierRole.Exploration]: '123456789012345678',
//   [FrontierRole.Industry]: '234567890123456789',
//   [FrontierRole.Mining]: '345678901234567890',
//   [FrontierRole.PVE]: '456789012345678901',
//   [FrontierRole.PVP]: '567890123456789012'
// };

/**
 * Role selection command interface
 */
export interface RoleCommand {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * Creates button components for role selection
 * @returns Array of action rows containing role buttons
 */
export const createRoleButtons = (): ActionRowBuilder<ButtonBuilder>[] => {
  const config = getBotConfig();
  const buttons: ButtonBuilder[] = [];
  
  // Create a button for each configured available role
  config.availableRoles.forEach((role) => {
    const button = new ButtonBuilder()
      .setCustomId(`role_${role}`)
      .setLabel(role)
      .setStyle(ButtonStyle.Secondary);
    
    buttons.push(button);
  });
  
  // Discord allows max 5 buttons per row, so we might need multiple rows
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < buttons.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(buttons.slice(i, i + 5));
    rows.push(row);
  }
  
  return rows;
};

/**
 * Checks if a guild member has a specific role
 * @param member - The guild member to check
 * @param roleName - The name of the role to check for
 * @returns Promise that resolves to true if member has the role, false otherwise
 */
export const hasRole = async (member: GuildMember, roleName: string): Promise<boolean> => {
  if (!member.guild) {
    console.log(`hasRole: Member ${member.user.tag} is not in a guild`);
    return false;
  }
  
  const role = await findRoleByName(member.guild, roleName);
  if (!role) {
    console.log(`hasRole: Role "${roleName}" not found in guild ${member.guild.name}`);
    return false;
  }
  
  const hasTheRole = member.roles.cache.has(role.id);
  console.log(`hasRole: ${member.user.tag} ${hasTheRole ? 'has' : 'does not have'} role "${roleName}" (ID: ${role.id})`);
  
  return hasTheRole;
};

/**
 * Toggles a role for a guild member (adds if they don't have it, removes if they do)
 * @param member - The guild member to toggle the role for
 * @param roleName - The name of the role to toggle
 * @returns Promise that resolves to 'added' or 'removed' based on the action taken
 * @throws Error if the role doesn't exist or the operation fails
 */
export const toggleRole = async (member: GuildMember, roleName: string): Promise<'added' | 'removed'> => {
  if (!member.guild) {
    throw new Error('Member is not in a guild');
  }
  
  const role = await findRoleByName(member.guild, roleName);
  if (!role) {
    throw new Error(`Role "${roleName}" not found in guild`);
  }
  
  const hasTheRole = await hasRole(member, roleName);
  
  if (hasTheRole) {
    // Remove the role
    await member.roles.remove(role, `Role removal requested by ${member.user.tag}`);
    console.log(`Removed role "${roleName}" from ${member.user.tag}`);
    return 'removed';
  } else {
    // Add the role
    await member.roles.add(role, `Role assignment requested by ${member.user.tag}`);
    console.log(`Added role "${roleName}" to ${member.user.tag}`);
    return 'added';
  }
};

/**
 * Handles button interactions for role selection
 * Currently hardcoded to handle only Exploration role
 * @param interaction - The button interaction to handle
 */
export const handleRoleButtonInteraction = async (interaction: ButtonInteraction): Promise<void> => {
  try {
    // For now, hardcode to only handle Exploration role
    if (!interaction.customId.startsWith('role_')) {
      return;
    }
    
    // Extract role from custom ID (e.g., 'role_Exploration' -> 'Exploration')
    const roleName = interaction.customId.replace('role_', '');
    
    // For now, only handle Exploration
    if (roleName !== 'Exploration') {
      await interaction.update({
        content: `Role "${roleName}" is not yet supported. Only Exploration role is currently available.`,
        components: []
      });
      return;
    }
    
    if (!interaction.guild || !interaction.member) {
      await interaction.update({
        content: 'This command can only be used in a server.',
        components: []
      });
      return;
    }
    
    const member = interaction.member as GuildMember;
    
    // Toggle the Exploration role
    const action = await toggleRole(member, 'Exploration');
    
    let message: string;
    if (action === 'added') {
      message = `✅ You have joined the **Exploration** role! Welcome to the frontier scouts.`;
    } else {
      message = `❌ You have left the **Exploration** role. Safe travels, capsuleer.`;
    }
    
    // Update the ephemeral message with the result
    await interaction.update({
      content: message,
      components: [] // Remove the buttons since action is complete
    });
    
    console.log(`Role button interaction: ${member.user.tag} ${action} Exploration role`);
    
  } catch (error) {
    console.error('Error handling role button interaction:', error);
    
    try {
      await interaction.update({
        content: 'An error occurred while updating your role. Please try again or contact an administrator.',
        components: []
      });
    } catch (updateError) {
      console.error('Failed to update interaction after error:', updateError);
    }
  }
};

/**
 * Role selection slash command
 * Presents an ephemeral message with buttons for each available role
 */
export const roleCommand: RoleCommand = {
  data: new SlashCommandBuilder()
    .setName('eve-roles')
    .setDescription('Select your EVE Frontier roles'),
  
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const roleButtons = createRoleButtons();
      
      await interaction.reply({
        content: 'Select your EVE Frontier roles by clicking the buttons below:',
        components: roleButtons,
        ephemeral: true
      });
      
      console.log(`Role selection command executed by ${interaction.user.tag}`);
    } catch (error) {
      console.error('Error executing role command:', error);
      
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An error occurred while processing your request.',
          ephemeral: true
        });
      }
    }
  }
};
