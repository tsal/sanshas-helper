import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  Message,
  InteractionResponse,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  ComponentType
} from 'discord.js';
import { getThemeMessage, getThemeMessageWithVariablesByContext, MessageCategory } from '../../themes';
import { IntelEntity, RiftIntelItem, isRiftIntelItem, OreIntelItem, isOreIntelItem, FleetIntelItem, isFleetIntelItem, SiteIntelItem, isSiteIntelItem, IntelItem, storeIntelItem, deleteIntelByIdFromInteraction, notifyIntelChannel } from './types';
import { repository } from '../../database/repository';
import { IntelTypeRegistry } from './handlers/registry';
import { IntelTypeHandler } from './handlers/types';
import { getTypeFromIntelId, isValidIntelId } from './handlers/id-utils';
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

    // Add add subcommand
    command.addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add an intelligence report')
    );

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
    
    // Handle add subcommand (intel creation)
    if (subcommand === 'add') {
      return this.handleAddSubcommand(interaction, interaction.guildId);
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
        content: getThemeMessage(MessageCategory.SUCCESS, undefined, successMessage).text,
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
    const id = interaction.options.getString('id', true);

    // Validate ID format using helper function
    if (!isValidIntelId(id)) {
      await this.sendErrorResponse(interaction, 'Invalid ID format. Expected format: <type>-<id>');
      return;
    }

    // Extract type from ID using helper function
    const type = getTypeFromIntelId(id);
    if (!type) {
      await this.sendErrorResponse(interaction, 'Could not extract type from ID');
      return;
    }

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
   * Handle add subcommand - presents intel type selection
   * @param interaction - Discord interaction object
   * @param guildId - Guild ID
   */
  private async handleAddSubcommand(interaction: ChatInputCommandInteraction, guildId: string): Promise<void> {
    try {
      // Create buttons for the 3 supported intel types
      const typeRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('intel_add_rift')
            .setLabel('🌌 Rift')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('intel_add_ore')
            .setLabel('⛏️ Ore')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('intel_add_site')
            .setLabel('⚔️ Site')
            .setStyle(ButtonStyle.Secondary)
        );

      // Send non-ephemeral reply with type selection buttons
      await interaction.reply({
        content: getThemeMessage(MessageCategory.GREETING, 'wizard_start', 'Select intel type to report:').text,
        components: [typeRow]
      });

      // Create collector for button interactions
      const collector = interaction.channel?.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (buttonInteraction) => {
          return buttonInteraction.user.id === interaction.user.id && 
                 buttonInteraction.customId.startsWith('intel_add_');
        },
        time: 300_000 // 5 minutes timeout
      });

      if (!collector) {
        await interaction.editReply({
          content: getThemeMessage(MessageCategory.ERROR, 'operation_error', 'Unable to create intel interface. Please try again.').text,
          components: []
        });
        return;
      }

      // Handle button interactions
      collector.on('collect', async (buttonInteraction: ButtonInteraction) => {
        try {
          // Extract intel type from button ID
          const selectedType = buttonInteraction.customId.replace('intel_add_', '');
          
          // Route to type-specific handler
          await this.handleTypeSpecificCollection(buttonInteraction, selectedType, guildId);
          
        } catch (error) {
          console.error('[Intel] Error handling type selection:', error);
          
          if (!buttonInteraction.replied && !buttonInteraction.deferred) {
            await buttonInteraction.reply({
              content: getThemeMessage(MessageCategory.ERROR, 'operation_error', 'Error processing your selection. Please try again.').text,
              flags: MessageFlags.Ephemeral
            });
          }
        }
      });

      // Handle collector timeout
      collector.on('end', async (_collected: any, reason: string) => {
        if (reason === 'time') {
          try {
            await interaction.deleteReply();
            await interaction.followUp({
              content: getThemeMessage(MessageCategory.WARNING, 'timeout_warning', 'Intel selection timed out. Please run `/intel add` again to start over.').text,
              flags: MessageFlags.Ephemeral
            });
          } catch (error) {
            // Ignore cleanup errors on timeout - not critical
          }
        }
      });

    } catch (error) {
      console.error('[Intel] Error in add subcommand:', error);
      
      if (!interaction.replied) {
        await interaction.reply({
          content: getThemeMessage(MessageCategory.ERROR, 'operation_error', 'Error starting intel interface. Please try again.').text,
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }

  /**
   * Handle type-specific information collection
   * @param buttonInteraction - Button interaction from type selection
   * @param selectedType - The selected intel type
   * @param guildId - Guild ID
   */
  private async handleTypeSpecificCollection(
    buttonInteraction: ButtonInteraction, 
    selectedType: string, 
    guildId: string
  ): Promise<void> {
    if (selectedType === 'rift') {
      await this.handleRiftCollection(buttonInteraction, guildId);
    } else if (selectedType === 'ore') {
      await this.handleOreCollection(buttonInteraction, guildId);
    } else if (selectedType === 'site') {
      await this.handleSiteCollection(buttonInteraction, guildId);
    }
  }

  /**
   * Handle rift-specific information collection
   * @param buttonInteraction - Button interaction from type selection
   * @param guildId - Guild ID
   */
  private async handleRiftCollection(buttonInteraction: ButtonInteraction, guildId: string): Promise<void> {
    try {
      // Create buttons for the 3 known rift types
      const riftTypeButtons: ButtonBuilder[] = [
        new ButtonBuilder()
          .setCustomId('rift_type_0633')
          .setLabel('0633')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('rift_type_f8da')
          .setLabel('f8da')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('rift_type_0020')
          .setLabel('0020')
          .setStyle(ButtonStyle.Secondary)
      ];

      const riftTypeRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(riftTypeButtons);

      // Update message with rift type selection
      await buttonInteraction.update({
        content: getThemeMessage(MessageCategory.ACKNOWLEDGMENT, 'input_request', '🌌 **Rift Intel Collection**\n\nSelect the rift type:').text,
        components: [riftTypeRow]
      });

      // Create collector for rift type selection
      const riftTypeCollector = buttonInteraction.channel?.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (riftButtonInteraction) => {
          return riftButtonInteraction.user.id === buttonInteraction.user.id && 
                 riftButtonInteraction.customId.startsWith('rift_type_');
        },
        time: 60_000 // 1 minute timeout
      });

      if (!riftTypeCollector) {
        await buttonInteraction.editReply({
          content: getThemeMessage(MessageCategory.ERROR, 'collection_error', 'Unable to collect rift type. Please try again.').text,
          components: []
        });
        return;
      }

      riftTypeCollector.on('collect', async (riftButtonInteraction: ButtonInteraction) => {
        try {
          // Extract rift type from button ID
          const riftType = riftButtonInteraction.customId.replace('rift_type_', '');

          // Update the message to show selected type and ask for system
          await riftButtonInteraction.update({
            content: getThemeMessage(MessageCategory.ACKNOWLEDGMENT, 'input_request', `🌌 **Rift Intel Collection**\n\n✅ Rift type: **${riftType}**\n\nPlease provide the **system name** where this rift is located:`).text,
            components: []
          });

          // Wait for system name message  
          const systemMessage = await this.awaitUserMessage(riftButtonInteraction, 'system name');
          if (!systemMessage) return;

          const systemName = systemMessage.content.trim();

          // Create the rift intel item
          const riftHandler = this.registry.getHandler('rift');
          if (!riftHandler) {
            throw new Error('Rift handler not found');
          }

          const riftContent = {
            type: riftType,
            systemName: systemName,
            near: '' // Skip optional field for now
          };

          const intelItem = {
            id: riftHandler.generateId(),
            timestamp: new Date().toISOString(),
            reporter: buttonInteraction.user.id,
            content: riftContent
          };

          // Store the intel item
          await storeIntelItem(guildId, intelItem);

          // Create and send success embed
          const entity = new IntelEntity(guildId, intelItem);
          const embed = riftHandler.createEmbed(entity);

          // Update message with success
          await buttonInteraction.editReply({
            content: getThemeMessage(MessageCategory.SUCCESS, undefined, '✅ **Rift intel successfully recorded!**').text,
            embeds: [embed],
            components: []
          });

          // Notify intel channel
          await notifyIntelChannel(riftButtonInteraction as any, embed);

          // Clean up messages after brief delay
          setTimeout(async () => {
            try {
              await buttonInteraction.deleteReply();
            } catch (error) {
              // Ignore cleanup errors - not critical
            }
          }, 3000); // 3 second delay

        } catch (error) {
          console.error('[Intel] Error in rift type collection:', error);
          
          try {
            await buttonInteraction.editReply({
              content: getThemeMessage(MessageCategory.ERROR, 'operation_error', 'Error recording rift intel. Please try again.').text,
              components: []
            });
          } catch (editError) {
            console.error('[Intel] Error sending error message:', editError);
          }
        }
      });

      riftTypeCollector.on('end', async (_collected: any, reason: string) => {
        if (reason === 'time') {
          try {
            await buttonInteraction.deleteReply();
          } catch (error) {
            // Ignore cleanup errors on timeout - not critical
          }
        }
      });

    } catch (error) {
      console.error('[Intel] Error in rift collection:', error);
      
      try {
        await buttonInteraction.followUp({
          content: getThemeMessage(MessageCategory.ERROR, 'operation_error', 'Error setting up rift intel collection. Please try again.').text,
          flags: MessageFlags.Ephemeral
        });
      } catch (followUpError) {
        console.error('[Intel] Error sending error message:', followUpError);
      }
    }
  }

  /**
   * Handle ore-specific information collection
   * @param buttonInteraction - Button interaction from type selection  
   * @param guildId - Guild ID
   */
  private async handleOreCollection(buttonInteraction: ButtonInteraction, guildId: string): Promise<void> {
    try {
      // Present ore type selection buttons
      const oreTypeRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('ore_type_common')
            .setLabel('Common')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⛏️'),
          new ButtonBuilder()
            .setCustomId('ore_type_carbon')
            .setLabel('Carbon')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⚫'),
          new ButtonBuilder()
            .setCustomId('ore_type_metal')
            .setLabel('Metal')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔩')
        );

      const deepcoreRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('ore_type_deepcore_common')
            .setLabel('Deepcore Common')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('💎'),
          new ButtonBuilder()
            .setCustomId('ore_type_deepcore_carbon')
            .setLabel('Deepcore Carbon')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⚫'),
          new ButtonBuilder()
            .setCustomId('ore_type_deepcore_metal')
            .setLabel('Deepcore Metal')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🔩')
        );

      const specialRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('ore_type_murky')
            .setLabel('Murky')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🌫️')
        );

      await buttonInteraction.update({
        content: getThemeMessage(MessageCategory.ACKNOWLEDGMENT, 'input_request', 'Please select the ore type:').text,
        components: [oreTypeRow, deepcoreRow, specialRow]
      });

      // Create collector for ore type selection
      const oreTypeCollector = buttonInteraction.channel?.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) => i.user.id === buttonInteraction.user.id && i.customId.startsWith('ore_type_'),
        time: 60_000, // 1 minute timeout
        max: 1
      });

      oreTypeCollector?.on('collect', async (oreTypeInteraction) => {
        try {
          const selectedOreType = oreTypeInteraction.customId.replace('ore_type_', '').replace('_', ' ');
          
          // Update message to ask for system name
          await oreTypeInteraction.update({
            content: getThemeMessage(MessageCategory.ACKNOWLEDGMENT, 'input_request', 'Please enter the system name:').text,
            components: []
          });

          // Wait for system name input
          const systemMessage = await this.awaitUserMessage(oreTypeInteraction, 'system name');
          if (!systemMessage) {
            return; // Timeout or error handled in awaitUserMessage
          }

          const systemName = systemMessage.content.trim();

          // Create the ore intel item
          const oreHandler = this.registry.getHandler('ore');
          if (!oreHandler) {
            throw new Error('Ore handler not found');
          }

          const oreContent = {
            oreType: selectedOreType,
            name: `${selectedOreType} ore in ${systemName}`,
            systemName: systemName,
            near: 'TBD' // Will be enhanced later
          };

          const intelItem = {
            id: oreHandler.generateId(),
            timestamp: new Date().toISOString(),
            reporter: oreTypeInteraction.user.id,
            content: oreContent
          };

          // Store the intel
          await storeIntelItem(guildId, intelItem);

          // Create and send success embed
          const entity = new IntelEntity(guildId, intelItem);
          const embed = oreHandler.createEmbed(entity);

          // Update message with success
          await buttonInteraction.editReply({
            content: getThemeMessage(MessageCategory.SUCCESS, undefined, 
              `✅ Ore intel stored successfully!\n**Type:** ${selectedOreType}\n**System:** ${systemName}`).text,
            embeds: [embed],
            components: []
          });

          // Notify intel channel
          await notifyIntelChannel(oreTypeInteraction as any, embed);

          // Clean up messages after brief delay
          setTimeout(async () => {
            try {
              await buttonInteraction.deleteReply();
            } catch (error) {
              // Ignore cleanup errors - not critical
            }
          }, 3000); // 3 second delay

          // Clean up user's system name message
          try {
            await systemMessage.delete();
          } catch (error) {
            // Ignore deletion errors - not critical
          }

        } catch (error) {
          console.error('[Intel] Error processing ore type selection:', error);
          
          try {
            await buttonInteraction.editReply({
              content: getThemeMessage(MessageCategory.ERROR, 'operation_error', 'Error processing ore type selection. Please try again.').text,
              components: []
            });
          } catch (editError) {
            console.error('[Intel] Error sending error message:', editError);
          }
        }
      });

      // Handle ore type collector timeout
      oreTypeCollector?.on('end', async (_collected: any, reason: string) => {
        if (reason === 'time') {
          try {
            await buttonInteraction.deleteReply();
          } catch (error) {
            // Ignore cleanup errors on timeout - not critical
          }
        }
      });

    } catch (error) {
      console.error('[Intel] Error in ore collection:', error);
      
      try {
        await buttonInteraction.followUp({
          content: getThemeMessage(MessageCategory.ERROR, 'operation_error', 'Error setting up ore intel collection. Please try again.').text,
          flags: MessageFlags.Ephemeral
        });
      } catch (followUpError) {
        console.error('[Intel] Error sending error message:', followUpError);
      }
    }
  }

  /**
   * Handle site-specific information collection
   * @param buttonInteraction - Button interaction from type selection  
   * @param guildId - Guild ID
   */
  private async handleSiteCollection(buttonInteraction: ButtonInteraction, guildId: string): Promise<void> {
    try {
      // Present site type selection buttons
      const siteTypeRow1 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('site_type_enclave')
            .setLabel('Enclave')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🏛️'),
          new ButtonBuilder()
            .setCustomId('site_type_termit')
            .setLabel('Termit')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🐛'),
          new ButtonBuilder()
            .setCustomId('site_type_domination')
            .setLabel('Domination')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⚔️')
        );

      const siteTypeRow2 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('site_type_inculcator')
            .setLabel('Inculcator')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔬'),
          new ButtonBuilder()
            .setCustomId('site_type_other')
            .setLabel('Other')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('❓')
        );

      await buttonInteraction.reply({
        content: getThemeMessage(MessageCategory.ACKNOWLEDGMENT, 'input_request', 'Please select the site type:').text,
        components: [siteTypeRow1, siteTypeRow2]
      });

      // Create collector for site type selection
      const siteTypeCollector = buttonInteraction.channel?.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) => i.user.id === buttonInteraction.user.id && i.customId.startsWith('site_type_'),
        time: 60_000, // 1 minute timeout
        max: 1
      });

      siteTypeCollector?.on('collect', async (siteTypeInteraction) => {
        try {
          const selectedSiteType = siteTypeInteraction.customId.replace('site_type_', '');
          let siteName: string;

          // Handle site name based on type
          if (selectedSiteType === 'other') {
            // Ask for custom site name
            await siteTypeInteraction.reply({
              content: getThemeMessage(MessageCategory.ACKNOWLEDGMENT, 'input_request', 'Please enter the custom site name:').text
            });

            // Wait for custom site name input
            const siteNameMessage = await this.awaitUserMessage(siteTypeInteraction, 'site name');
            if (!siteNameMessage) {
              return; // Timeout or error handled in awaitUserMessage
            }

            siteName = siteNameMessage.content.trim();

            // Clean up the custom name message
            try {
              await siteNameMessage.delete();
            } catch (error) {
              // Ignore deletion errors - not critical
            }
          } else {
            // Use predefined site name
            siteName = `${selectedSiteType.charAt(0).toUpperCase() + selectedSiteType.slice(1)} site`;
            
            await siteTypeInteraction.reply({
              content: getThemeMessage(MessageCategory.ACKNOWLEDGMENT, 'input_request', 
                `Site: **${siteName}**\n\nPlease select the triggered status:`).text
            });
          }

          // Present triggered status selection buttons
          const triggeredRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('site_triggered_yes')
                .setLabel('Yes')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔴'),
              new ButtonBuilder()
                .setCustomId('site_triggered_no')
                .setLabel('No')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🟢'),
              new ButtonBuilder()
                .setCustomId('site_triggered_unknown')
                .setLabel('Unknown')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('❓')
            );

          const triggeredMessage = await siteTypeInteraction.followUp({
            content: selectedSiteType === 'other' ? 
              getThemeMessage(MessageCategory.ACKNOWLEDGMENT, 'input_request', 
                `Site: **${siteName}**\n\nPlease select the triggered status:`).text :
              getThemeMessage(MessageCategory.ACKNOWLEDGMENT, 'input_request', 'Please select the triggered status:').text,
            components: [triggeredRow]
          });

          // Create collector for triggered status selection
          const triggeredCollector = buttonInteraction.channel?.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) => i.user.id === buttonInteraction.user.id && i.customId.startsWith('site_triggered_'),
            time: 60_000, // 1 minute timeout
            max: 1
          });

          triggeredCollector?.on('collect', async (triggeredInteraction) => {
            try {
              const selectedTriggered = triggeredInteraction.customId.replace('site_triggered_', '');
              
              // Ask for system name
              await triggeredInteraction.reply({
                content: getThemeMessage(MessageCategory.ACKNOWLEDGMENT, 'input_request', 'Please enter the system name:').text
              });

              // Wait for system name input
              const systemMessage = await this.awaitUserMessage(triggeredInteraction, 'system name');
              if (!systemMessage) {
                return; // Timeout or error handled in awaitUserMessage
              }

              const systemName = systemMessage.content.trim();

              // Get site handler and create intel item
              const siteHandler = this.registry.getHandler('site');
              if (!siteHandler) {
                throw new Error('Site handler not found');
              }

              const siteContent = {
                name: siteName,
                system: systemName,
                triggered: selectedTriggered
              };

              const intelItem = {
                id: siteHandler.generateId(),
                timestamp: new Date().toISOString(),
                reporter: buttonInteraction.user.id,
                content: siteContent
              };

              // Store the intel item
              await storeIntelItem(guildId, intelItem);

              // Create and send success embed
              const entity = new IntelEntity(guildId, intelItem);
              const embed = siteHandler.createEmbed(entity);

              await triggeredInteraction.followUp({
                content: getThemeMessage(MessageCategory.SUCCESS, undefined, 
                  `✅ Site intel stored successfully!\n**Site:** ${siteName}\n**Triggered:** ${selectedTriggered}\n**System:** ${systemName}`).text,
                embeds: [embed]
              });

              // Notify intel channel
              await notifyIntelChannel(triggeredInteraction as any, embed);

              // Clean up messages
              await this.cleanupMessages(triggeredInteraction);

              // Clean up user's system name message
              try {
                await systemMessage.delete();
              } catch (error) {
                // Ignore deletion errors - not critical
              }

            } catch (error) {
              console.error('[Intel] Error processing triggered status selection:', error);
              
              if (!triggeredInteraction.replied && !triggeredInteraction.deferred) {
                await triggeredInteraction.reply({
                  content: getThemeMessage(MessageCategory.ERROR, 'operation_error', 'Error processing triggered status selection. Please try again.').text,
                  flags: MessageFlags.Ephemeral
                });
              }
            }
          });

          // Handle triggered collector timeout
          triggeredCollector?.on('end', async (_collected: any, reason: string) => {
            if (reason === 'time') {
              try {
                await triggeredMessage.delete();
                await siteTypeInteraction.followUp({
                  content: getThemeMessage(MessageCategory.WARNING, 'timeout_warning', 'Triggered status selection timed out. Please run `/intel add` again to start over.').text,
                  flags: MessageFlags.Ephemeral
                });
              } catch (error) {
                // Ignore cleanup errors on timeout - not critical
              }
            }
          });

        } catch (error) {
          console.error('[Intel] Error processing site type selection:', error);
          
          if (!siteTypeInteraction.replied && !siteTypeInteraction.deferred) {
            await siteTypeInteraction.reply({
              content: getThemeMessage(MessageCategory.ERROR, 'operation_error', 'Error processing site type selection. Please try again.').text,
              flags: MessageFlags.Ephemeral
            });
          }
        }
      });

      // Handle site type collector timeout
      siteTypeCollector?.on('end', async (_collected: any, reason: string) => {
        if (reason === 'time') {
          try {
            await buttonInteraction.deleteReply();
            await buttonInteraction.followUp({
              content: getThemeMessage(MessageCategory.WARNING, 'timeout_warning', 'Site type selection timed out. Please run `/intel add` again to start over.').text,
              flags: MessageFlags.Ephemeral
            });
          } catch (error) {
            // Ignore cleanup errors on timeout - not critical
          }
        }
      });

    } catch (error) {
      console.error('[Intel] Error in site collection:', error);
      
      try {
        await buttonInteraction.followUp({
          content: getThemeMessage(MessageCategory.ERROR, 'operation_error', 'Error setting up site intel collection. Please try again.').text,
          flags: MessageFlags.Ephemeral
        });
      } catch (followUpError) {
        console.error('[Intel] Error sending error message:', followUpError);
      }
    }
  }

  /**
   * Wait for a user message in the same channel
   * @param interaction - Original interaction for context
   * @param fieldName - Name of the field being collected (for error messages)
   * @returns Promise resolving to the user's message or null if timeout/error
   */
  private async awaitUserMessage(interaction: ButtonInteraction, fieldName: string): Promise<Message | null> {
    if (!interaction.channel) {
      return null;
    }

    // Check if the channel supports awaitMessages
    if (!('awaitMessages' in interaction.channel)) {
      await interaction.followUp({
        content: getThemeMessage(MessageCategory.ERROR, 'operation_error', 'Unable to collect messages in this channel type.').text,
        flags: MessageFlags.Ephemeral
      });
      return null;
    }

    try {
      const collected = await interaction.channel.awaitMessages({
        filter: (msg: Message) => msg.author.id === interaction.user.id,
        max: 1,
        time: 60_000, // 1 minute timeout
        errors: ['time']
      });

      const message = collected.first();
      return message || null;
    } catch (error) {
      try {
        await interaction.followUp({
          content: getThemeMessage(MessageCategory.WARNING, 'timeout_warning', `Timeout waiting for ${fieldName}. Please run \`/intel add\` again to start over.`).text,
          flags: MessageFlags.Ephemeral
        });
      } catch (followUpError) {
        // Ignore timeout message errors - not critical
      }
      
      return null;
    }
  }

  /**
   * Clean up messages by deleting the original interaction message
   * @param interaction - Button interaction to clean up
   */
  private async cleanupMessages(interaction: ButtonInteraction): Promise<void> {
    try {
      // Get the original message (the one with the type selection buttons)
      const originalMessage = interaction.message;
      if (originalMessage && 'delete' in originalMessage) {
        await originalMessage.delete();
      }
    } catch (error) {
      // Not critical, so we continue silently
    }
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
