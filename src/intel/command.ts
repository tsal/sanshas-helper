import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  Message,
  InteractionResponse
} from 'discord.js';
import { getThemeMessage, MessageCategory } from '../themes';
import { IntelEntity, RiftIntelItem, isRiftIntelItem, OreIntelItem, isOreIntelItem, IntelItem, storeIntelItem, deleteIntelByIdFromInteraction } from './types';
import { repository } from '../database/repository';
import { IntelTypeRegistry } from './handlers/registry';
import { IntelTypeHandler } from './handlers/types';

/**
 * Intel command interface for Discord interactions
 */
export interface IntelCommand {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  registerHandler?: (type: string, handler: IntelTypeHandler<any>) => void;
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
    )
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
        .setName('ore')
        .setDescription('Add an ore site intel report')
        .addStringOption(option =>
          option
            .setName('oretype')
            .setDescription('Type of ore resource (e.g., carbon, metal, common)')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Name of the ore site (e.g., Carbon Debris Cluster)')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('system')
            .setDescription('System name where the ore site is located')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('near')
            .setDescription('What the ore site is near (e.g., P1L4)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
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
        case 'list':
          await this.handleListSubcommand(interaction, guildId);
          break;
        case 'rift':
          await this.handleRiftSubcommand(interaction, guildId);
          break;
        case 'ore':
          await this.handleOreSubcommand(interaction, guildId);
          break;
        case 'del':
          await this.handleDelSubcommand(interaction, guildId);
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
   * Handle del subcommand - deletes an intel item by type and ID
   * @param interaction - Discord interaction object
   * @param guildId - Guild ID
   */
  private async handleDelSubcommand(interaction: ChatInputCommandInteraction, guildId: string): Promise<void> {
    const type = interaction.options.getString('type', true);
    const id = interaction.options.getString('id', true);

    // Handle supported types: rift and ore
    if (type === 'rift' || type === 'ore') {
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
    
    try {
      await storeIntelItem(guildId, intelItem);
    } catch (error) {
      console.error(`[Intel] Failed to store intel item ${id} for guild ${guildId}:`, error);
      throw error;
    }

    // Create an intel entity for the embed
    const intelEntity = new IntelEntity(guildId, intelItem);

    // Create embed for the newly added rift
    const riftEmbed = this.createRiftIntelEmbed(intelEntity);

    await interaction.reply({
      content: getThemeMessage(MessageCategory.SUCCESS, `Rift intel added: ${type} in ${system}${near ? ` near ${near}` : ''}`).text,
      embeds: [riftEmbed],
      flags: MessageFlags.Ephemeral
    });

    // Set timer to delete the ephemeral message after 30 seconds (skip in test environment)
    if (process.env.NODE_ENV !== 'test') {
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (error) {
          console.error(`[Intel] Error auto-deleting ephemeral response for rift ${id}:`, error);
        }
      }, 30_000); // 30 seconds
    }
  }

  /**
   * Handle ore subcommand - adds a new ore site intel item
   * @param interaction - Discord interaction object
   * @param guildId - Guild ID
   */
  private async handleOreSubcommand(interaction: ChatInputCommandInteraction, guildId: string): Promise<void> {
    const oreType = interaction.options.getString('oretype', true);
    const name = interaction.options.getString('name', true);
    const system = interaction.options.getString('system', true);
    const near = interaction.options.getString('near') || ''; // Default to empty string if not provided
    
    // Generate unique ID for the intel item
    const id = `ore-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const oreIntel: OreIntelItem = {
      oreType,
      name,
      systemName: system,
      near
    };
    
    const intelItem: IntelItem = {
      id,
      timestamp: new Date().toISOString(),
      reporter: interaction.user.id,
      content: oreIntel
    };
    
    try {
      await storeIntelItem(guildId, intelItem);
    } catch (error) {
      console.error(`[Intel] Failed to store intel item ${id} for guild ${guildId}:`, error);
      throw error;
    }

    // Create an intel entity for the embed
    const intelEntity = new IntelEntity(guildId, intelItem);

    // Create embed for the newly added ore site
    const oreEmbed = this.createOreIntelEmbed(intelEntity);

    await interaction.reply({
      content: getThemeMessage(MessageCategory.SUCCESS, `Ore site intel added: ${name} (${oreType}) in ${system}${near ? ` near ${near}` : ''}`).text,
      embeds: [oreEmbed],
      flags: MessageFlags.Ephemeral
    });

    // Set timer to delete the ephemeral message after 30 seconds (skip in test environment)
    if (process.env.NODE_ENV !== 'test') {
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (error) {
          console.error(`[Intel] Error auto-deleting ephemeral response for ore ${id}:`, error);
        }
      }, 30_000); // 30 seconds
    }
  }

  /**
   * Handle list subcommand - shows current intel items
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
   * Fetch all intel items
   * @param guildId - Guild to process
   * @returns Array of intel entities
   */
  private async fetchIntel(guildId: string): Promise<IntelEntity[]> {
    const result = await repository.getAll(IntelEntity, guildId);
    return result;
  }

  /**
   * Purge stale intel items
   * @param guildId - Guild to process
   * @returns Number of items purged
   */
  private async purgeStaleIntel(guildId: string): Promise<number> {
    const purgedCount = await repository.purgeStaleItems(IntelEntity, guildId, 24);
    return purgedCount;
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
    
    // Check if it's an OreIntelItem
    if (isOreIntelItem(content)) {
      return this.createOreIntelEmbed(item);
    }
    
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
   * Convert ore intel item to Discord embed
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
   * Send intel report to user
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
    
    // Default to 1 page if not specified
    const requestedPages = pages || 1;
    
    // Discord allows up to 10 embeds per message
    const maxEmbeds = 10;
    const totalPages = Math.ceil(sortedItems.length / maxEmbeds);
    const actualPages = Math.min(requestedPages, totalPages);
    
    // Create messages for each page and collect message responses
    const messagePromises: Array<Promise<Message | InteractionResponse>> = [];
    
    for (let pageIndex = 0; pageIndex < actualPages; pageIndex++) {
      const startIndex = pageIndex * maxEmbeds;
      const endIndex = Math.min(startIndex + maxEmbeds, sortedItems.length);
      const pageItems = sortedItems.slice(startIndex, endIndex);
      const embeds = pageItems.map(item => this.createIntelEmbed(item));
      
      const pageInfo = actualPages > 1 ? ` (Page ${pageIndex + 1}/${actualPages})` : '';
      const summary = `Found ${sortedItems.length} intel item${sortedItems.length === 1 ? '' : 's'}${pageInfo}.`;
      
      if (pageIndex === 0) {
        // First page uses reply()
        messagePromises.push(
          interaction.reply({
            content: getThemeMessage(MessageCategory.SUCCESS, summary).text,
            embeds: embeds,
            flags: MessageFlags.Ephemeral
          })
        );
      } else {
        // Additional pages use followUp()
        messagePromises.push(
          interaction.followUp({
            content: getThemeMessage(MessageCategory.SUCCESS, summary).text,
            embeds: embeds,
            flags: MessageFlags.Ephemeral
          })
        );
      }
    }
    
    // Wait for all messages to be sent and collect message objects
    const sentMessages = await Promise.all(messagePromises);

    // Set timer to delete all ephemeral messages (skip in test environment)
    if (timeoutMinutes && process.env.NODE_ENV !== 'test') {
      const timeoutMs = timeoutMinutes * 60 * 1000; // Convert minutes to milliseconds
      setTimeout(async () => {
        // Delete each message individually with graceful error handling
        for (let i = 0; i < sentMessages.length; i++) {
          try {
            const message = sentMessages[i];
            if ('delete' in message) {
              // This is a Message from followUp()
              await message.delete();
            } else {
              // This is an InteractionResponse from reply() - use interaction.deleteReply()
              if (i === 0) {
                await interaction.deleteReply();
              }
            }
          } catch (error) {
            console.error(`[Intel] Error auto-deleting message ${i + 1}/${sentMessages.length} after ${timeoutMinutes} minutes:`, error);
            // Continue to next message even if this one fails
          }
        }
      }, timeoutMs);
    }
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

/**
 * Intel2 Command Handler - New plugin-based architecture
 */
class Intel2CommandHandler implements IntelCommand {
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
      .setName('intel2')
      .setDescription('Manage intelligence reports using new plugin architecture');

    // Add subcommands for each registered handler
    const registeredTypes = this.registry.getRegisteredTypes();
    for (const type of registeredTypes) {
      const handler = this.registry.getHandler(type);
      if (handler) {
        command.addSubcommand(subcommand => {
          subcommand
            .setName(type)
            .setDescription(handler.description);
          
          // Add options from handler (simplified for now)
          // TODO: Properly map SlashCommandOptionBuilder to specific option types
          // For now, we'll skip adding individual options and focus on subcommand structure
          
          return subcommand;
        });
      }
    }

    return command;
  }

  /**
   * Command definition using plugin architecture
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
   * Execute the intel2 command
   * @param interaction - Discord interaction object
   */
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    
    // Get the handler for this subcommand type
    const handler = this.registry.getHandler(subcommand);
    
    if (!handler) {
      throw new Error(`No handler registered for intel type: ${subcommand}`);
    }
    
    try {
      // Parse interaction data through the handler
      const content = handler.parseInteractionData(interaction);
      
      // Validate the content
      if (!handler.validate(content)) {
        await interaction.reply({ 
          content: `Invalid ${subcommand} intel provided.`, 
          ephemeral: true 
        });
        return;
      }
      
      // Create intel entity
      const intelItem: IntelItem = {
        id: handler.generateId(),
        timestamp: new Date().toISOString(),
        reporter: interaction.user.id,
        content
      };
      
      const entity = new IntelEntity(interaction.guildId!, intelItem);
      
      // Store the entity
      await repository.store(entity);
      
      // Create embed and respond
      const embed = handler.createEmbed(entity);
      const successMessage = handler.getSuccessMessage(content);
      
      await interaction.reply({ 
        content: successMessage,
        embeds: [embed] 
      });
    } catch (error) {
      console.error(`Error executing ${subcommand} intel command:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (interaction.replied) {
        await interaction.followUp({
          content: `Error processing ${subcommand} intel: ${errorMessage}`,
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: `Error processing ${subcommand} intel: ${errorMessage}`,
          ephemeral: true
        });
      }
    }
  }
}

/**
 * Export the intel2 command instance
 */
export const intel2Command: IntelCommand = new Intel2CommandHandler();
