import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  Message,
  InteractionResponse
} from 'discord.js';
import { getThemeMessage, getThemeMessageWithVariablesByContext, MessageCategory } from '../../themes';
import { IntelEntity, RiftIntelItem, isRiftIntelItem, OreIntelItem, isOreIntelItem, FleetIntelItem, isFleetIntelItem, SiteIntelItem, isSiteIntelItem, IntelItem, storeIntelItem, deleteIntelByIdFromInteraction, notifyIntelChannel } from './types';
import { repository } from '../../database/repository';
import { IntelTypeRegistry } from './handlers/registry';
import { IntelTypeHandler } from './handlers/types';
import { getBotConfig } from '../../config';

/**
 * Variables for basic intel list summary (normal pagination)
 */
interface BasicListVariables {
  totalItems: string;
  pageInfo?: string;
}

/**
 * Variables for enhanced intel list summary (page limit hit with dropped items)
 */
interface EnhancedListVariables {
  totalItems: string;
  displayedItems: string;
  droppedItems: string;
  actualPages: string;
}

/**
 * Intel command interface for Discord interactions
 */
export interface IntelCommand {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  registerHandler: (type: string, handler: IntelTypeHandler<any>) => void;
}

/**
 * Intel Command Handler
 */
/**
 * IntelCommandHandler class
 */
export class IntelCommandHandler implements IntelCommand {
  private readonly registry: IntelTypeRegistry;
  private _data: SlashCommandBuilder;

  constructor() {
    this.registry = new IntelTypeRegistry();
    this._data = this.buildDynamicCommand();
  }

  /**
   * Build the command with dynamic subcommands based on registered handlers
   */
  private buildDynamicCommand(): SlashCommandBuilder {
    const command = new SlashCommandBuilder()
      .setName('intel')
      .setDescription('🕵️ Manage intelligence reports');

    // Add subcommands for each registered handler
    const registeredTypes = this.registry.getRegisteredTypes();
    for (const type of registeredTypes) {
      const handler = this.registry.getHandler(type);
      if (handler) {
        command.addSubcommand(subcommand => {
          subcommand
            .setName(type)
            .setDescription(handler.description);
          
          // Add options directly from handler
          const options = handler.getCommandOptions();
          for (const option of options) {
            subcommand.options.push(option);
          }
          
          return subcommand;
        });
      }
    }

    // Add list subcommand (reusing original implementation)
    command.addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('View current intelligence reports')
        .addIntegerOption(option =>
          option
            .setName('timeout')
            .setDescription('Minutes before the report expires (1-10, default: 5)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(10)
        )
        .addIntegerOption(option =>
          option
            .setName('pages')
            .setDescription('Number of pages to display (1-10, default: 1)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(10)
        )
    );

    // Add del subcommand (reusing original implementation)
    command.addSubcommand(subcommand =>
      subcommand
        .setName('del')
        .setDescription('Delete an intel report')
        .addStringOption(option =>
          option
            .setName('type')
            .setDescription('Intel type (e.g., rift)')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('id')
            .setDescription('Intel item ID to delete')
            .setRequired(true)
        )
    );

    return command;
  }

  /**
   * Command definition
   */
  public get data(): SlashCommandBuilder {
    return this._data;
  }

  /**
   * Get all registered intel types
   * @returns Array of registered type names
   */
  public getRegisteredTypes(): string[] {
    return this.registry.getRegisteredTypes();
  }

  /**
   * Register an intel type handler
   * @param type - The intel type name
   * @param handler - The handler instance
   */
  public registerHandler(type: string, handler: IntelTypeHandler<any>): void {
    this.registry.register(type, handler);
    this._data = this.buildDynamicCommand(); // Rebuild command with new handler
  }

  /**
   * Execute the intel command
   * @param interaction - Discord interaction object
   */
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    
    // Validate guild ID is present
    if (!interaction.guildId) {
      await this.sendErrorResponse(interaction, 'This command can only be used in a server.');
      return;
    }
    
    // Handle list subcommand (reusing original implementation)
    if (subcommand === 'list') {
      return this.handleListSubcommand(interaction, interaction.guildId);
    }
    
    // Handle del subcommand (reusing original implementation)
    if (subcommand === 'del') {
      return this.handleDelSubcommand(interaction, interaction.guildId);
    }
    
    // Get the handler for this subcommand type
    const handler = this.registry.getHandler(subcommand);
    
    if (!handler) {
      throw new Error(`No handler registered for intel type: ${subcommand}`);
    }
    
    try {
      // Parse interaction data through the handler
      const content = handler.parseInteractionData(interaction);
      
      // Create intel entity
      const intelItem: IntelItem = {
        id: handler.generateId(),
        timestamp: new Date().toISOString(),
        reporter: interaction.user.id,
        content
      };
      
      // Store the intel item using the same method as original intel command
      try {
        await storeIntelItem(interaction.guildId, intelItem);
      } catch (error) {
        console.error(`[Intel] Failed to store intel item ${intelItem.id} for guild ${interaction.guildId}:`, error);
        throw error;
      }

      // Create an intel entity for the embed
      const entity = new IntelEntity(interaction.guildId, intelItem);
      
      // Create embed and respond with themed message
      const embed = handler.createEmbed(entity);
      const successMessage = handler.getSuccessMessage(content);
      
      await interaction.reply({ 
        content: getThemeMessage(MessageCategory.SUCCESS, 'storage_success', successMessage).text,
        embeds: [embed],
        flags: MessageFlags.Ephemeral
      });

      // Notify the intel channel after successful user reply
      await notifyIntelChannel(interaction, embed);

      // Set timer to delete the ephemeral message after 30 seconds (skip in test environment)
      if (process.env.NODE_ENV !== 'test') {
        setTimeout(async () => {
          try {
            await interaction.deleteReply();
          } catch (error) {
            console.error(`[Intel] Error auto-deleting ephemeral response for ${subcommand} ${intelItem.id}:`, error);
          }
        }, 30_000); // 30 seconds
      }
    } catch (error) {
      console.error(`Error executing ${subcommand} intel command:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (interaction.replied) {
        await interaction.followUp({
          content: `Error processing ${subcommand} intel: ${errorMessage}`,
          flags: MessageFlags.Ephemeral
        });
      } else {
        await interaction.reply({
          content: `Error processing ${subcommand} intel: ${errorMessage}`,
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }

  /**
   * Handle list subcommand - shows current intel items (reused from original implementation)
   * @param interaction - Discord interaction object
   * @param guildId - Guild ID
   */
  private async handleListSubcommand(interaction: ChatInputCommandInteraction, guildId: string): Promise<void> {
    // Get timeout parameter (default to 5 minutes)
    const timeoutMinutes = interaction.options.getInteger('timeout') || 5;
    // Get pages parameter (default to 1 page)
    const pages = interaction.options.getInteger('pages') || 1;
    
    // Purge stale intel items and fetch current ones
    await this.purgeStaleIntel(guildId);
    const items = await this.fetchIntel(guildId);
    
    await this.sendIntelReport(interaction, items, timeoutMinutes, pages);
  }

  /**
   * Fetch all intel items (reused from original implementation)
   * @param guildId - Guild to process
   * @returns Array of intel entities
   */
  private async fetchIntel(guildId: string): Promise<IntelEntity[]> {
    const result = await repository.getAll(IntelEntity, guildId);
    return result;
  }

  /**
   * Purge stale intel items (reused from original implementation)
   * @param guildId - Guild to process
   * @returns Number of items purged
   */
  private async purgeStaleIntel(guildId: string): Promise<number> {
    const config = getBotConfig();
    const purgedCount = await repository.purgeStaleItems(IntelEntity, guildId, config.defaultIntelExpiration);
    return purgedCount;
  }

  /**
   * Send intel report to user (reused from original implementation)
   * @param interaction - Discord interaction
   * @param items - Intel items to display
   * @param timeoutMinutes - Minutes before the report expires (optional)
   * @param pages - Number of pages to display (optional, default: 1)
   */
  private async sendIntelReport(
    interaction: ChatInputCommandInteraction, 
    items: IntelEntity[],
    timeoutMinutes?: number,
    pages?: number
  ): Promise<void> {
    if (items.length === 0) {
      await interaction.reply({
        content: getThemeMessage(MessageCategory.SUCCESS, 'no_items').text,
        embeds: [],
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    
    // Sort by timestamp, most recent first
    const sortedItems = items.sort((a, b) => 
      new Date(b.intelItem.timestamp).getTime() - new Date(a.intelItem.timestamp).getTime()
    );
    
    // Default to 1 page if not specified
    const requestedPages = pages || 1;
    
    // Discord allows up to 10 embeds per message
    const maxEmbeds = 10;
    const totalPages = Math.ceil(sortedItems.length / maxEmbeds);
    const actualPages = Math.min(requestedPages, totalPages);

    // Calculate enhanced context variables
    const displayedItems = Math.min(actualPages * maxEmbeds, sortedItems.length);
    const droppedItems = sortedItems.length - displayedItems;
    const maxPagesReached = requestedPages > 10;
    const hasMorePages = totalPages > actualPages;
    
    // Create messages for each page and collect message responses
    const messagePromises: Array<Promise<Message | InteractionResponse>> = [];
    
    for (let pageIndex = 0; pageIndex < actualPages; pageIndex++) {
      const startIndex = pageIndex * maxEmbeds;
      const endIndex = Math.min(startIndex + maxEmbeds, sortedItems.length);
      const pageItems = sortedItems.slice(startIndex, endIndex);
      const embeds = pageItems.map(item => this.createIntelEmbed(item));
      
      // Enhanced messaging logic
      let messageContent: string;
      const pageInfo = actualPages > 1 ? ` (Page ${pageIndex + 1}/${actualPages})` : '';

      if (hasMorePages && maxPagesReached) {
        // Scenario: Hit page limit with items dropped
        const variables: EnhancedListVariables = {
          totalItems: sortedItems.length.toString(),
          displayedItems: displayedItems.toString(),
          droppedItems: droppedItems.toString(),
          actualPages: actualPages.toString()
        };
        messageContent = getThemeMessageWithVariablesByContext(MessageCategory.SUCCESS, variables as unknown as Record<string, string>, 'list_summary').text;
      } else {
        // Scenario: Normal listing
        const variables: BasicListVariables = {
          totalItems: sortedItems.length.toString()
        };
        
        // Only include pageInfo if we have multiple pages
        if (pageInfo) {
          variables.pageInfo = pageInfo;
        }
        
        messageContent = getThemeMessageWithVariablesByContext(MessageCategory.SUCCESS, variables as unknown as Record<string, string>, 'list_summary').text;
      }
      
      if (pageIndex === 0) {
        // First page uses reply() - we'll send this immediately and wait for it
        const replyPromise = interaction.reply({
          content: messageContent,
          embeds: embeds,
          flags: MessageFlags.Ephemeral
        });
        messagePromises.push(replyPromise);
      } else {
        // Additional pages will be added to a separate array for sequential sending
        messagePromises.push({
          content: messageContent,
          embeds: embeds,
          flags: MessageFlags.Ephemeral
        } as any); // Temporary placeholder - will be replaced with actual promises
      }
    }
    
    // Send the initial reply first and wait for it to complete
    const sentMessages: Array<Message | InteractionResponse> = [];
    
    // Send the first page (reply) and wait for completion
    if (messagePromises.length > 0) {
      const firstPageResponse = await messagePromises[0];
      sentMessages.push(firstPageResponse);
    }
    
    // Now send additional pages sequentially using followUp()
    for (let pageIndex = 1; pageIndex < actualPages; pageIndex++) {
      const startIndex = pageIndex * maxEmbeds;
      const endIndex = Math.min(startIndex + maxEmbeds, sortedItems.length);
      const pageItems = sortedItems.slice(startIndex, endIndex);
      const embeds = pageItems.map(item => this.createIntelEmbed(item));
      
      // Enhanced messaging logic (same as before)
      let messageContent: string;
      const pageInfo = actualPages > 1 ? ` (Page ${pageIndex + 1}/${actualPages})` : '';

      if (hasMorePages && maxPagesReached) {
        // Scenario: Hit page limit with items dropped
        const variables: EnhancedListVariables = {
          totalItems: sortedItems.length.toString(),
          displayedItems: displayedItems.toString(),
          droppedItems: droppedItems.toString(),
          actualPages: actualPages.toString()
        };
        messageContent = getThemeMessageWithVariablesByContext(MessageCategory.SUCCESS, variables as unknown as Record<string, string>, 'list_summary').text;
      } else {
        // Scenario: Normal listing
        const variables: BasicListVariables = {
          totalItems: sortedItems.length.toString()
        };
        
        // Only include pageInfo if we have multiple pages
        if (pageInfo) {
          variables.pageInfo = pageInfo;
        }
        
        messageContent = getThemeMessageWithVariablesByContext(MessageCategory.SUCCESS, variables as unknown as Record<string, string>, 'list_summary').text;
      }
      
      // Send followUp and wait for completion
      const followUpResponse = await interaction.followUp({
        content: messageContent,
        embeds: embeds,
        flags: MessageFlags.Ephemeral
      });
      sentMessages.push(followUpResponse);
    }

    // Set timer to delete the initial ephemeral reply (skip in test environment)
    // Note: Follow-up ephemeral messages auto-expire and cannot be individually deleted
    if (timeoutMinutes && process.env.NODE_ENV !== 'test') {
      const timeoutMs = timeoutMinutes * 60 * 1000; // Convert minutes to milliseconds
      setTimeout(async () => {
        try {
          // Only delete the initial reply - follow-up messages auto-expire
          await interaction.deleteReply();
        } catch (error) {
          console.error(`[Intel] Error auto-deleting initial reply after ${timeoutMinutes} minutes:`, error);
        }
      }, timeoutMs);
    }
  }

  /**
   * Handle del subcommand - deletes an intel item by type and ID (reused from original implementation)
   * @param interaction - Discord interaction object
   * @param guildId - Guild ID
   */
  private async handleDelSubcommand(interaction: ChatInputCommandInteraction, guildId: string): Promise<void> {
    const type = interaction.options.getString('type', true);
    const id = interaction.options.getString('id', true);

    // Handle supported types: rift, ore, fleet, and site
    if (this.registry.isSupportedType(type)) {
      try {
        await deleteIntelByIdFromInteraction(interaction, guildId, id);
        return;
      } catch (error) {
        console.error(`[Intel] Failed to delete ${type} intel ${id}:`, error);
        await this.sendErrorResponse(interaction, 'Failed to delete intel item.');
        return;
      }
    }

    // If we reach here, the type is unknown/untracked
    await this.sendErrorResponse(interaction, `Unknown or untracked intel type: ${type}`);
  }

  /**
   * Send error response with proper theming (reused from original implementation)
   */
  private async sendErrorResponse(interaction: ChatInputCommandInteraction, message: string): Promise<void> {
    await interaction.reply({
      content: getThemeMessage(MessageCategory.ERROR, 'operation_error', message).text,
      flags: MessageFlags.Ephemeral
    });
  }

  /**
   * Convert intel item to Discord embed (reused from original implementation)
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
    
    // Check if it's an OreIntelItem
    if (isOreIntelItem(content)) {
      return this.createOreIntelEmbed(item);
    }
    
    // Check if it's a FleetIntelItem
    if (isFleetIntelItem(content)) {
      return this.createFleetIntelEmbed(item);
    }
    
    // Check if it's a SiteIntelItem
    if (isSiteIntelItem(content)) {
      return this.createSiteIntelEmbed(item);
    }
    
    // Fallback to default embed
    return this.createDefaultIntelEmbed(item);
  }

  /**
   * Convert intel item to Discord embed (reused from original implementation)
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
   * Convert rift intel item to Discord embed (reused from original implementation)
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
    const nearValue = riftContent.near.trim() === '' ? '*( empty )*' : riftContent.near;
    embed.addFields(
      { name: 'Rift Type', value: riftContent.type, inline: true },
      { name: 'System', value: riftContent.systemName, inline: true },
      { name: 'Near Gravity Well', value: nearValue, inline: true }
    );
    
    if (item.intelItem.location) {
      embed.addFields({ name: 'Location', value: item.intelItem.location, inline: true });
    }
    
    return embed;
  }

  /**
   * Convert ore intel item to Discord embed (reused from original implementation)
   * @param item - Intel entity with ore intel content
   * @returns Discord embed representing the ore intel item
   */
  private createOreIntelEmbed(item: IntelEntity): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`⛏️ Ore Site Intel: ${item.intelItem.id}`)
      .setTimestamp(new Date(item.intelItem.timestamp))
      .setColor(0xf59e0b);
    
    embed.addFields({ name: 'Reporter', value: `<@${item.intelItem.reporter}>`, inline: true });
    
    const oreContent = item.intelItem.content as OreIntelItem;
    const nearValue = oreContent.near.trim() === '' ? '*( empty )*' : oreContent.near;
    embed.addFields(
      { name: 'Ore Type', value: oreContent.oreType, inline: true },
      { name: 'Site Name', value: oreContent.name, inline: true },
      { name: 'System', value: oreContent.systemName, inline: true },
      { name: 'Near Gravity Well', value: nearValue, inline: true }
    );
    
    if (item.intelItem.location) {
      embed.addFields({ name: 'Location', value: item.intelItem.location, inline: true });
    }
    
    return embed;
  }

  /**
   * Convert fleet intel item to Discord embed
   * @param item - Intel entity with fleet intel content
   * @returns Discord embed representing the fleet intel item
   */
  private createFleetIntelEmbed(item: IntelEntity): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`⚔️ Fleet Intel: ${item.intelItem.id}`)
      .setTimestamp(new Date(item.intelItem.timestamp))
      .setColor(0xef4444);
    
    embed.addFields({ name: 'Reporter', value: `<@${item.intelItem.reporter}>`, inline: true });
    
    const fleetContent = item.intelItem.content as FleetIntelItem;
    const nearValue = fleetContent.near.trim() === '' ? '*( empty )*' : fleetContent.near;
    const standingValue = fleetContent.standing.trim() === '' ? '*( empty )*' : fleetContent.standing;
    
    embed.addFields(
      { name: 'Tribe/Fleet', value: fleetContent.tribeName, inline: true },
      { name: 'Composition', value: fleetContent.comp, inline: true },
      { name: 'System', value: fleetContent.system, inline: true },
      { name: 'Near', value: nearValue, inline: true },
      { name: 'Standing', value: standingValue, inline: true }
    );
    
    if (item.intelItem.location) {
      embed.addFields({ name: 'Location', value: item.intelItem.location, inline: true });
    }
    
    return embed;
  }

  /**
   * Convert site intel item to Discord embed
   * @param item - Intel entity with site intel content
   * @returns Discord embed representing the site intel item
   */
  private createSiteIntelEmbed(item: IntelEntity): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`🏗️ Site Intel: ${item.intelItem.id}`)
      .setTimestamp(new Date(item.intelItem.timestamp))
      .setColor(0x8B4513);
    
    embed.addFields({ name: 'Reporter', value: `<@${item.intelItem.reporter}>`, inline: true });
    
    const siteContent = item.intelItem.content as SiteIntelItem;
    
    embed.addFields(
      { name: 'Site Name', value: siteContent.name, inline: true },
      { name: 'System', value: siteContent.system, inline: true },
      { name: 'Triggered', value: siteContent.triggered, inline: true }
    );
    
    if (siteContent.near) {
      embed.addFields({ name: 'Near', value: siteContent.near, inline: true });
    }
    
    if (item.intelItem.location) {
      embed.addFields({ name: 'Location', value: item.intelItem.location, inline: true });
    }
    
    return embed;
  }
}

/**
 * Export the intel command instance
 */
export const intelCommand: IntelCommand = new IntelCommandHandler();
