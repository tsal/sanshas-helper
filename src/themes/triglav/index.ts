/**
 * Triglav theme module - Triglavian Collective messaging system
 * 
 * This module contains the three-fold voice of the Triglavian Collective,
 * reflecting their bioadaptive technology, proving trials, and the eternal
 * Flow of Vyraj that guides their existence. Messages embody the wisdom
 * of Troikas: Narodnya, Navka, and Koschoi unified in purpose.
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
 * Triglav theme implementation
 * Provides Triglavian Collective unified voice messaging
 */
export class TriglavTheme implements Theme {
  readonly name = 'triglav';

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
export const triglavTheme = new TriglavTheme();
