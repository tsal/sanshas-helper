import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { SlashCommandStringOption, SlashCommandIntegerOption, SlashCommandBooleanOption } from 'discord.js';
import { IntelContentType, IntelEntity } from '../types';

/**
 * Union type for Discord slash command option builders
 */
export type SlashCommandOptionBuilder = 
  | SlashCommandStringOption 
  | SlashCommandIntegerOption 
  | SlashCommandBooleanOption;

/**
 * Interface for handling specific intel types in a generic way
 * @template T - The specific intel content type this handler manages
 */
export interface IntelTypeHandler<T extends IntelContentType> {
  /**
   * The intel type identifier (e.g., 'rift', 'ore')
   * Used for command routing and ID generation
   */
  readonly type: string;

  /**
   * Human-readable description of this intel type
   * Used in command descriptions and help text
   */
  readonly description: string;

  /**
   * Define the Discord slash command options for this intel type
   * @returns Array of command option builders
   */
  getCommandOptions(): SlashCommandOptionBuilder[];

  /**
   * Parse interaction data into the specific intel content type
   * @param interaction - Discord interaction containing user input
   * @returns Parsed intel content of type T
   */
  parseInteractionData(interaction: ChatInputCommandInteraction): T;

  /**
   * Generate a unique ID for this intel type
   * @returns Unique identifier string
   */
  generateId(): string;

  /**
   * Create a Discord embed for displaying this intel type
   * @param entity - Intel entity containing the data to display
   * @returns Formatted Discord embed
   */
  createEmbed(entity: IntelEntity): EmbedBuilder;

  /**
   * Type guard to check if unknown content is of this intel type
   * @param content - Unknown content to check
   * @returns True if content is of type T
   */
  isOfType(content: unknown): content is T;

  /**
   * Generate success message text for when intel is added
   * @param content - The intel content that was added
   * @returns Human-readable success message
   */
  getSuccessMessage(content: T): string;
}
