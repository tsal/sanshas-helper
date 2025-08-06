/**
 * Base theme interface and types for the messaging system
 * 
 * This module defines the contract that all themes must implement,
 * ensuring consistent behavior and easy extensibility.
 */

import { MessageCategory, ThemeMessage, MessageVariables, substituteMessageVariables } from './types';

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
   * Retrieves all messages from a specific category
   * @param category - The message category to retrieve
   * @returns Array of all ThemeMessage objects in the category
   */
  getMessagesByCategory(category: MessageCategory): ThemeMessage[];

  /**
   * Retrieves a message with context and optional content
   * Uses getRandomMessageByContext when context is provided, getRandomMessage when no context
   * @param category - The message category to select from
   * @param context - Optional context to filter by (snake_case word)
   * @param content - Optional dynamic content to be displayed with the themed message
   * @returns A ThemeMessage with content applied
   */
  getMessageWithContent(category: MessageCategory, context?: string, content?: string): ThemeMessage;

  /**
   * Retrieves a random message from a specific context within a category
   * @param category - The message category to select from
   * @param context - The context to filter by (snake_case word)
   * @returns A random ThemeMessage from the specified context, or random from category if context not found
   */
  getRandomMessageByContext(category: MessageCategory, context: string): ThemeMessage;

  /**
   * Retrieves a message with variable substitution from a specific context within a category
   * Validates that variable lists are the same size, falls back to generic message if not
   * @param category - The message category to select from
   * @param variables - Variables to substitute in the message
   * @param context - The context to filter by (snake_case word)
   * @returns A ThemeMessage with variables substituted from the specified context, or from category if context not found
   */
  getMessageWithVariablesByContext(category: MessageCategory, variables: MessageVariables, context: string): ThemeMessage;
}

/**
 * Abstract base class that provides common theme functionality
 * Themes can extend this for convenience or implement Theme interface directly
 */
export abstract class BaseTheme implements Theme {
  abstract readonly name: string;
  abstract getRandomMessage(category: MessageCategory): ThemeMessage;
  abstract getMessagesByCategory(category: MessageCategory): ThemeMessage[];

  /**
   * Retrieves a random message from a specific context within a category
   * Common implementation shared by all themes
   */
  getRandomMessageByContext(category: MessageCategory, context: string): ThemeMessage {
    const messages = this.getMessagesByCategory(category);
    const contextMessages = messages.filter(msg => msg.context === context);
    if (contextMessages.length > 0) {
      const randomIndex = Math.floor(Math.random() * contextMessages.length);
      return contextMessages[randomIndex];
    }
    return this.getRandomMessage(category);
  }

  /**
   * Retrieves a message with variable substitution from a specific context within a category
   * Common implementation shared by all themes
   */
  getMessageWithVariablesByContext(category: MessageCategory, variables: MessageVariables, context: string): ThemeMessage {
    const messages = this.getMessagesByCategory(category);
    const contextMessages = messages.filter(msg => msg.context === context);
    if (contextMessages.length > 0) {
      const randomIndex = Math.floor(Math.random() * contextMessages.length);
      const message = contextMessages[randomIndex];
      return {
        ...message,
        text: substituteMessageVariables(message.text, variables)
      };
    }
    return this.getRandomMessage(category);
  }

  /**
   * Retrieves a message with context and optional content
   * Common implementation shared by all themes
   */
  getMessageWithContent(category: MessageCategory, context?: string, content?: string): ThemeMessage {
    let message: ThemeMessage;
    
    if (context) {
      message = this.getRandomMessageByContext(category, context);
    } else {
      message = this.getRandomMessage(category);
    }
    
    if (content) {
      return {
        ...message,
        text: `${message.text} ${content}`
      };
    }
    
    return message;
  }

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
