import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { SlashCommandStringOption, SlashCommandIntegerOption, SlashCommandBooleanOption } from 'discord.js';
import { IntelContentType, IntelEntity } from '../types';
import { generateIntelId } from './id-utils';

/**
 * Union type for Discord slash command option builders
 */
export type SlashCommandOptionBuilder = 
  | SlashCommandStringOption 
  | SlashCommandIntegerOption 
  | SlashCommandBooleanOption;

/**
 * Abstract base class for handling specific intel types in a generic way
 * @template T - The specific intel content type this handler manages
 */
export abstract class IntelTypeHandler<T extends IntelContentType> {
  /**
   * The intel type identifier (e.g., 'rift', 'ore')
   * Used for command routing and ID generation
   */
  abstract readonly type: string;

  /**
   * Description of this intel type for command help
   */
  abstract readonly description: string;

  /**
   * Define the Discord slash command options for this intel type
   * @returns Array of command option builders
   */
  abstract getCommandOptions(): SlashCommandOptionBuilder[];

  /**
   * Parse interaction data into the specific intel content type
   * @param interaction - Discord interaction containing user input
   * @returns Parsed intel content of type T
   */
  abstract parseInteractionData(interaction: ChatInputCommandInteraction): T;

  /**
   * Generate a unique ID for this intel type
   * @returns Unique identifier string
   */
  generateId(): string {
    return generateIntelId(this.type);
  }

  /**
   * Create a Discord embed for displaying this intel type
   * @param entity - Intel entity containing the data to display
   * @returns Formatted Discord embed
   */
  abstract createEmbed(entity: IntelEntity): EmbedBuilder;

  /**
   * Type guard to check if unknown content is of this intel type
   * @param content - Unknown content to check
   * @returns True if content is of type T
   */
  abstract isOfType(content: unknown): content is T;

  /**
   * Generate success message text for when intel is added
   * @param content - The intel content that was added
   * @returns Human-readable success message
   */
  abstract getSuccessMessage(content: T): string;
}
