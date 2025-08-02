import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  MessageFlags 
} from 'discord.js';
import { IntelCommand } from './types';
import { getThemeMessage, MessageCategory } from '../../themes';

/**
 * Intel Command Handler
 * "In the digital streets, intelligence is everything. 
 *  This command keeps the community one step ahead of the game."
 */
class IntelCommandHandler implements IntelCommand {
  /**
   * Command definition - the badge that gives us authority
   * TODO: Future iterations will add subcommands
   */
  public readonly data = new SlashCommandBuilder()
    .setName('intel')
    .setDescription('🕵️ Manage intelligence reports for the community (coming soon)');

  /**
   * Execute the command - where the real police work happens
   * @param interaction - Discord interaction object
   */
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // Extract guild information - know your jurisdiction
      const guildId = interaction.guildId;
      if (!guildId) {
        await this.sendErrorResponse(interaction, 'This command can only be used in a server.');
        return;
      }

      // TODO: Implement actual intel functionality in future iterations
      // For now, just acknowledge the command exists
      await this.sendSuccessResponse(
        interaction,
        '🕵️ **INTEL COMMAND OPERATIONAL** 🕵️\n\nThe intelligence division is being established.\n\n*"Soon, detective. Soon we\'ll have the tools to track every lead."*'
      );
    } catch (error) {
      console.error('Intel command execution failed:', error);
      await this.sendErrorResponse(interaction, 'Internal investigation error. The case files are corrupted.');
    }
  }

  /**
   * Send success response with proper theming
   */
  private async sendSuccessResponse(interaction: ChatInputCommandInteraction, message: string): Promise<void> {
    await interaction.reply({
      content: getThemeMessage(MessageCategory.SUCCESS, message).text,
      flags: MessageFlags.Ephemeral
    });
  }

  /**
   * Send error response with proper theming
   */
  private async sendErrorResponse(interaction: ChatInputCommandInteraction, message: string): Promise<void> {
    await interaction.reply({
      content: getThemeMessage(MessageCategory.ERROR, message).text,
      flags: MessageFlags.Ephemeral
    });
  }
}

/**
 * Export the command instance - our badge of authority
 */
export const intelCommand: IntelCommand = new IntelCommandHandler();
