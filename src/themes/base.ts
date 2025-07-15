/**
 * Base theme interface and types for the messaging system
 * 
 * This module defines the contract that all themes must implement,
 * ensuring consistent behavior and easy extensibility.
 */

import { MessageCategory, ThemeMessage } from './types';

/**
 * Interface that all themes must implement
 * Provides a consistent API for retrieving themed messages
 */
export interface Theme {
  /**
   * The unique name/identifier of this theme
   */
  readonly name: string;

  /**
   * Retrieves a random message from the specified category
   * @param category - The message category to select from
   * @returns A ThemeMessage from the category
   */
  getRandomMessage(category: MessageCategory): ThemeMessage;

  /**
   * Retrieves a message by category and optional context
   * @param category - The message category to select from
   * @param context - Optional context to filter by
   * @returns A ThemeMessage matching the criteria, or random from category if context not found
   */
  getMessageByContext(category: MessageCategory, context?: string): ThemeMessage;

  /**
   * Retrieves all messages from a specific category
   * @param category - The message category to retrieve
   * @returns Array of all ThemeMessage objects in the category
   */
  getMessagesByCategory(category: MessageCategory): ThemeMessage[];
}

/**
 * Abstract base class that provides common theme functionality
 * Themes can extend this for convenience or implement Theme interface directly
 */
export abstract class BaseTheme implements Theme {
  abstract readonly name: string;
  abstract getRandomMessage(category: MessageCategory): ThemeMessage;
  abstract getMessageByContext(category: MessageCategory, context?: string): ThemeMessage;
  abstract getMessagesByCategory(category: MessageCategory): ThemeMessage[];

  /**
   * Helper method to convert theme-specific message objects to ThemeMessage
   * Useful for themes that have additional properties beyond the base interface
   */
  protected normalizeMessage(message: any): ThemeMessage {
    return {
      text: message.text,
      category: message.category,
      context: message.context
    };
  }
}
