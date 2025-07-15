/**
 * Themes module - Unified messaging system for bot themes
 * 
 * This module provides a bridge between different theme message systems
 * (Kuvakei and Triglav) based on the RESPONSE_THEME configuration.
 */

import { ResponseTheme, getBotConfig } from '../config';
import { ThemeMessage, MessageCategory } from './types';
import { Theme } from './base';
import { kuvakeiTheme } from './kuvakei';
import { triglavTheme } from './triglav';
import { plainTheme } from './plain';

// Re-export types
export { ThemeMessage, MessageCategory } from './types';
export { Theme } from './base';

/**
 * Theme registry - maps theme names to their implementations
 */
const themes: Record<ResponseTheme, Theme> = {
  [ResponseTheme.KUVAKEI]: kuvakeiTheme,
  [ResponseTheme.TRIGLAV]: triglavTheme,
  [ResponseTheme.PLAIN]: plainTheme
};

/**
 * Gets the currently active theme based on configuration
 * @returns The active Theme instance
 */
const getActiveTheme = (): Theme => {
  const config = getBotConfig();
  return themes[config.responseTheme] || themes[ResponseTheme.KUVAKEI];
};

/**
 * Retrieves a themed message based on the current RESPONSE_THEME configuration
 * @param category - The message category to select from
 * @param context - Optional context to filter by
 * @returns A ThemeMessage matching the criteria from the configured theme
 */
export const getThemeMessage = (category: MessageCategory, context?: string): ThemeMessage => {
  const theme = getActiveTheme();
  return context 
    ? theme.getMessageByContext(category, context)
    : theme.getRandomMessage(category);
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
