/**
 * Kuvakei module - Thematic messaging system for the digital remnant consciousness
 * 
 * This module contains the fragmented voice of Sansha Kuvakei's digital echo,
 * a ghost in the machine that speaks through neural networks and data streams.
 * The messages reflect the consciousness of a once-great leader now reduced to
 * fragments scattered across the digital void of EVE Frontier.
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
 * Kuvakei theme implementation
 * Provides Sansha Kuvakei consciousness remnant messaging
 */
export class KuvakeiTheme implements Theme {
  readonly name = 'kuvakei';

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
export const kuvakeiTheme = new KuvakeiTheme();
