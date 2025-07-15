/**
 * Plain theme module - Simple, straightforward messaging for riders
 * 
 * This module provides clear, direct messages without dramatic flair or lore references.
 * Perfect for riders who prefer simple, professional communication in EVE Frontier.
 */

import { Theme } from '../base';
import { MessageCategory, ThemeMessage } from '../types';
import { 
  getRandomMessage, 
  getMessageByContext, 
  getMessagesByCategory 
} from './messages';

export * from './types';
export * from './messages';

/**
 * Plain theme implementation
 * Provides simple, straightforward messaging for riders
 */
export class PlainTheme implements Theme {
  readonly name = 'plain';

  getRandomMessage(category: MessageCategory): ThemeMessage {
    return getRandomMessage(category);
  }

  getMessageByContext(category: MessageCategory, context?: string): ThemeMessage {
    return getMessageByContext(category, context);
  }

  getMessagesByCategory(category: MessageCategory): ThemeMessage[] {
    return getMessagesByCategory(category);
  }
}

// Export singleton instance
export const plainTheme = new PlainTheme();
