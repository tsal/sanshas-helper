import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Role as FrontierRole } from '../frontier/types';
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
  const buttons: ButtonBuilder[] = [];
  
  // Create a button for each frontier role
  Object.values(FrontierRole).forEach((role) => {
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
 * Role selection slash command
 * Presents an ephemeral message with buttons for each available role
 */
export const roleCommand: RoleCommand = {
  data: new SlashCommandBuilder()
    .setName('roles')
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
