import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
  SlashCommandSubcommandsOnlyBuilder 
} from 'discord.js';
import { getThemeMessage, MessageCategory } from '../themes';
import { IntelEntity, RiftIntelItem, isRiftIntelItem, IntelItem, storeIntelItem } from './types';
import { repository } from '../database/repository';

/**
 * Intel command interface for Discord interactions
 */
export interface IntelCommand {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * Intel Command Handler
 */
class IntelCommandHandler implements IntelCommand {
  /**
   * Command definition with subcommands
   */
  public readonly data = new SlashCommandBuilder()
    .setName('intel')
    .setDescription('🕵️ Manage intelligence reports')
    .addSubcommand(subcommand =>
      subcommand
        .setName('rift')
        .setDescription('Add a rift intel report')
        .addStringOption(option =>
          option
            .setName('type')
            .setDescription('Rift type code')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('system')
            .setDescription('System name where the rift is located')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('near')
            .setDescription('What the rift is near (e.g., P1L4)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('View current intelligence reports')
    );

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

      const subcommand = interaction.options.getSubcommand();
      
      switch (subcommand) {
        case 'rift':
          await this.handleRiftSubcommand(interaction, guildId);
          break;
        case 'list':
          await this.handleListSubcommand(interaction, guildId);
          break;
        default:
          await this.sendErrorResponse(interaction, 'Unknown subcommand.');
      }
    } catch (error) {
      console.error('Intel command execution failed:', error);
      await this.sendErrorResponse(interaction, 'Command execution failed.');
    }
  }

  /**
   * Handle rift subcommand - adds a new rift intel item
   * @param interaction - Discord interaction object
   * @param guildId - Guild ID
   */
  private async handleRiftSubcommand(interaction: ChatInputCommandInteraction, guildId: string): Promise<void> {
    const type = interaction.options.getString('type', true);
    const system = interaction.options.getString('system', true);
    const near = interaction.options.getString('near') || ''; // Default to empty string if not provided
    
    // Generate unique ID for the intel item
    const id = `rift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const riftIntel: RiftIntelItem = {
      type,
      systemName: system,
      near
    };
    
    const intelItem: IntelItem = {
      id,
      timestamp: new Date().toISOString(),
      reporter: interaction.user.id,
      content: riftIntel
    };
    
    await storeIntelItem(guildId, intelItem);
    
    await this.sendSuccessResponse(
      interaction, 
      `Rift intel added: ${type} in ${system}${near ? ` near ${near}` : ''}`
    );
  }

  /**
   * Handle list subcommand - shows current intel items
   * @param interaction - Discord interaction object
   * @param guildId - Guild ID
   */
  private async handleListSubcommand(interaction: ChatInputCommandInteraction, guildId: string): Promise<void> {
    // Purge stale intel items and fetch current ones
    await this.purgeStaleIntel(guildId);
    const items = await this.fetchIntel(guildId);
    
    await this.sendIntelReport(interaction, items);
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
      await interaction.reply({
        content: getThemeMessage(MessageCategory.SUCCESS, 'No intel items found.').text,
        embeds: [],
        flags: MessageFlags.Ephemeral
      });
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
