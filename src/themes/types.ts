/**
 * Unified theme message types for the bot messaging system
 * 
 * This module provides a common interface for messages across different themes
 * (Kuvakei and Triglav) while preserving their unique characteristics.
 */

import { MessageCategory as KuvakeiMessageCategory } from '../kuvakei/types';

/**
 * Unified message category enum that both themes share
 * Using Kuvakei as the base since both enums are identical
 */
export const MessageCategory = KuvakeiMessageCategory;
export type MessageCategory = KuvakeiMessageCategory;

/**
 * Common interface for themed messages
 * This represents the minimal structure that both KuvakeiMessage and TriglavMessage share
 */
export interface ThemeMessage {
  /** The message text */
  text: string;
  /** Category of the message for organizational purposes */
  category: MessageCategory;
  /** Optional context for when this message should be used */
  context?: string;
}
