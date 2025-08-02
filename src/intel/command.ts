import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder 
} from 'discord.js';
import { getThemeMessage, MessageCategory } from '../themes';
import { IntelEntity, RiftIntelItem, isRiftIntelItem } from './types';
import { repository } from '../database/repository';

/**
 * Intel command interface for Discord interactions
 */
export interface IntelCommand {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * Intel Command Handler
 */
class IntelCommandHandler implements IntelCommand {
  /**
   * Command definition
   * TODO: Future iterations will add subcommands
   */
  public readonly data = new SlashCommandBuilder()
    .setName('intel')
    .setDescription('🕵️ View current intelligence reports');

  /**
   * Execute the command
   * @param interaction - Discord interaction object
   */
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const guildId = interaction.guildId;
      if (!guildId) {
        await this.sendErrorResponse(interaction, 'This command can only be used in a server.');
        return;
      }

      // Purge stale intel items and fetch current ones
      await this.purgeStaleIntel(guildId);
      const items = await this.fetchIntel(guildId);
      
      await this.sendIntelReport(interaction, items);
    } catch (error) {
      console.error('Intel command execution failed:', error);
      await this.sendErrorResponse(interaction, 'Command execution failed.');
    }
  }

  /**
   * Fetch all intel items
   * @param guildId - Guild to process
   * @returns Array of intel entities
   */
  private async fetchIntel(guildId: string): Promise<IntelEntity[]> {
    return await repository.getAll(IntelEntity, guildId);
  }

  /**
   * Purge stale intel items
   * @param guildId - Guild to process
   * @returns Number of items purged
   */
  private async purgeStaleIntel(guildId: string): Promise<number> {
    return await repository.purgeStaleItems(IntelEntity, guildId, 24);
  }

  /**
   * Convert intel item to Discord embed
   * @param item - Intel entity to convert
   * @returns Discord embed representing the intel item
   */
  private createIntelEmbed(item: IntelEntity): EmbedBuilder {
    // Type-check content and route to appropriate embed method
    const content = item.intelItem.content;
    
    // Check if it's a RiftIntelItem
    if (isRiftIntelItem(content)) {
      return this.createRiftIntelEmbed(item);
    }
    
    // TODO: Add checks for other intel types here
    
    // Fallback to default embed
    return this.createDefaultIntelEmbed(item);
  }

  /**
   * Convert intel item to Discord embed
   * @param item - Intel entity to convert
   * @returns Discord embed representing the intel item
   */
  private createDefaultIntelEmbed(item: IntelEntity): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`Intel: ${item.intelItem.id}`)
      .setTimestamp(new Date(item.intelItem.timestamp))
      .setColor(0x1e40af);
    
    embed.addFields({ name: 'Reporter', value: `<@${item.intelItem.reporter}>`, inline: true });
    
    if (item.intelItem.location) {
      embed.addFields({ name: 'Location', value: item.intelItem.location, inline: true });
    }
    
    return embed;
  }

  /**
   * Convert rift intel item to Discord embed
   * @param item - Intel entity with rift intel content
   * @returns Discord embed representing the rift intel item
   */
  private createRiftIntelEmbed(item: IntelEntity): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`🌌 Rift Intel: ${item.intelItem.id}`)
      .setTimestamp(new Date(item.intelItem.timestamp))
      .setColor(0x8b5cf6);
    
    embed.addFields({ name: 'Reporter', value: `<@${item.intelItem.reporter}>`, inline: true });
    
    const riftContent = item.intelItem.content as RiftIntelItem;
    embed.addFields(
      { name: 'Rift Type', value: riftContent.type, inline: true },
      { name: 'System', value: riftContent.systemName, inline: true },
      { name: 'Lagrange Point', value: riftContent.near, inline: true }
    );
    
    if (item.intelItem.location) {
      embed.addFields({ name: 'Location', value: item.intelItem.location, inline: true });
    }
    
    return embed;
  }

  /**
   * Send intel report to user
   * @param interaction - Discord interaction
   * @param items - Intel items to display
   */
  private async sendIntelReport(
    interaction: ChatInputCommandInteraction, 
    items: IntelEntity[]
  ): Promise<void> {
    if (items.length === 0) {
      await this.sendSuccessResponse(interaction, 'No intel items found.');
      return;
    }
    
    // Sort by timestamp, most recent first
    const sortedItems = items.sort((a, b) => 
      new Date(b.intelItem.timestamp).getTime() - new Date(a.intelItem.timestamp).getTime()
    );
    
    // Discord allows up to 10 embeds per message
    const maxEmbeds = 10;
    const embeds = sortedItems.slice(0, maxEmbeds).map(item => this.createIntelEmbed(item));
    
    const summary = `Found ${items.length} intel item${items.length === 1 ? '' : 's'}${items.length > maxEmbeds ? ` (showing first ${maxEmbeds})` : ''}.`;
    
    await interaction.reply({
      content: getThemeMessage(MessageCategory.SUCCESS, summary).text,
      embeds: embeds,
      flags: MessageFlags.Ephemeral
    });
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
 * Export the command instance
 */
export const intelCommand: IntelCommand = new IntelCommandHandler();
