import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, MessageFlags, ComponentType } from 'discord.js';
import { getThemeMessage, MessageCategory } from '../themes';

/**
 * Fleet command interface
 */
export interface FleetCommand {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * Creates placeholder button components for fleet management
 * @returns Array of action rows containing fleet buttons
 */
export const createFleetButtons = (): ActionRowBuilder<ButtonBuilder>[] => {
  const buttons: ButtonBuilder[] = [];
  
  // TODO: Add actual fleet management buttons
  const placeholderButton = new ButtonBuilder()
    .setCustomId('fleet_placeholder')
    .setLabel('🚀 Fleet Management (Coming Soon)')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true);
  
  buttons.push(placeholderButton);
  
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
 * Fleet management slash command
 * Presents an ephemeral message with buttons for fleet operations
 * Uses InteractionCollector for proper scoped button handling
 */
export const fleetCommand: FleetCommand = {
  data: new SlashCommandBuilder()
    .setName('fleets')
    .setDescription('Manage EVE Frontier fleet operations'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const fleetButtons = createFleetButtons();
      
      // Send initial reply with fleet buttons
      await interaction.reply({
        content: 'TODO: Fleet management functionality coming soon!',
        components: fleetButtons,
        flags: MessageFlags.Ephemeral
      });
      
      // Create collector for button interactions on this specific message
      const collector = interaction.channel?.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (buttonInteraction) => {
          // Only collect interactions from the original user and fleet buttons
          return buttonInteraction.user.id === interaction.user.id && 
                 buttonInteraction.customId.startsWith('fleet_');
        },
        time: 60_000 // 60 seconds timeout
      });
      
      if (!collector) {
        console.error('Failed to create interaction collector - channel not available');
        return;
      }
      
      // Handle button interactions
      collector.on('collect', async (buttonInteraction: ButtonInteraction) => {
        try {
          // TODO: Implement actual fleet button handling
          await buttonInteraction.reply({
            content: 'TODO: Fleet functionality not yet implemented.',
            flags: MessageFlags.Ephemeral
          });
          
        } catch (error) {
          console.error('Error handling fleet button interaction:', error);
          
          try {
            await buttonInteraction.reply({
              content: getThemeMessage(MessageCategory.ERROR).text,
              flags: MessageFlags.Ephemeral
            });
          } catch (replyError) {
            console.error('Failed to reply to button interaction after error:', replyError);
          }
        }
      });
      
      // Handle collector end
      collector.on('end', async () => {
        try {
          // Delete the ephemeral message when collector ends
          await interaction.deleteReply();
        } catch (error) {
          console.error('Error deleting message when collector ended:', error);
        }
      });
      
    } catch (error) {
      console.error('Error executing fleet command:', error);
      
      if (!interaction.replied) {
        await interaction.reply({
          content: getThemeMessage(MessageCategory.ERROR).text,
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
};
