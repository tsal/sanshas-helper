/**
 * Themes module - Unified messaging system for bot themes
 * 
 * This module provides a bridge between different theme message systems
 * (Kuvakei and Triglav) based on the RESPONSE_THEME configuration.
 */

import { ResponseTheme, getBotConfig } from '../config';
import { ThemeMessage, MessageCategory } from './types';
import { getRandomMessage as getKuvakeiMessage, getMessageByContext as getKuvakeiByContext } from '../kuvakei';
import { getRandomMessage as getTriglavMessage, getMessageByContext as getTriglavByContext } from '../triglav';

// Re-export types
export { ThemeMessage, MessageCategory } from './types';

/**
 * Retrieves a themed message based on the current RESPONSE_THEME configuration
 * @param category - The message category to select from
 * @param context - Optional context to filter by
 * @returns A ThemeMessage matching the criteria from the configured theme
 */
export const getThemeMessage = (category: MessageCategory, context?: string): ThemeMessage => {
  const config = getBotConfig();
  
  if (config.responseTheme === ResponseTheme.TRIGLAV) {
    const triglavMessage = context 
      ? getTriglavByContext(category, context)
      : getTriglavMessage(category);
    
    // Convert TriglavMessage to ThemeMessage (removes troikaAspect field)
    const result: ThemeMessage = {
      text: triglavMessage.text,
      category: triglavMessage.category
    };
    
    if (triglavMessage.context !== undefined) {
      result.context = triglavMessage.context;
    }
    
    return result;
  } else {
    // Default to Kuvakei theme
    const kuvakeiMessage = context 
      ? getKuvakeiByContext(category, context)
      : getKuvakeiMessage(category);
    
    // KuvakeiMessage already matches ThemeMessage interface
    return kuvakeiMessage;
  }
};

/**
 * Retrieves a random themed message from the specified category
 * @param category - The message category to select from
 * @returns A random ThemeMessage from the category using the configured theme
 */
export const getRandomThemeMessage = (category: MessageCategory): ThemeMessage => {
  return getThemeMessage(category);
};

/**
 * Retrieves a themed message by category and context
 * @param category - The message category to select from
 * @param context - The context to filter by
 * @returns A ThemeMessage matching the criteria, or random from category if context not found
 */
export const getThemeMessageByContext = (category: MessageCategory, context: string): ThemeMessage => {
  return getThemeMessage(category, context);
};
