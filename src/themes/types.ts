/**
 * Unified theme message types for the bot messaging system
 * 
 * This module provides a common interface for messages across different themes
 * (Kuvakei and Triglav) while preserving their unique characteristics.
 */

import { MessageCategory as KuvakeiMessageCategory } from './kuvakei/types';

/**
 * Unified message category enum that both themes share
 * Using Kuvakei as the base since both enums are identical
 */
export const MessageCategory = KuvakeiMessageCategory;
export type MessageCategory = KuvakeiMessageCategory;

/**
 * Type for variable substitution data
 * Maps variable names to their replacement values
 */
export type MessageVariables = Record<string, string>;

/**
 * Common interface for themed messages
 * This represents the minimal structure that both KuvakeiMessage and TriglavMessage share
 * 
 * Context Protocol:
 * - Context should be simple snake_case words (e.g., 'task_completion', 'general_error')
 * - No spaces, no descriptive sentences
 * - Context is optional - system should work without it
 * - When context is not provided or doesn't match, system falls back to random message from category
 */
export interface ThemeMessage {
  /** The message text */
  text: string;
  /** Category of the message for organizational purposes */
  category: MessageCategory;
  /** Optional context for when this message should be used (snake_case words only) */
  context?: string;
  /** Optional list of variable names this message expects for substitution */
  variables?: string[];
}

/**
 * Substitutes variables in a message text
 * Replaces {variableName} placeholders with actual values
 * @param text - The message text containing variable placeholders
 * @param variables - Object mapping variable names to their values
 * @returns The text with variables substituted
 */
export const substituteMessageVariables = (text: string, variables: MessageVariables = {}): string => {
  return text.replace(/\{(\w+)\}/g, (match, variableName) => {
    return variables[variableName] || match; // Keep placeholder if variable not provided
  });
};

/**
 * Validates that all required variables are provided
 * @param requiredVariables - Array of variable names that are required
 * @param providedVariables - Object containing the provided variables
 * @returns Array of missing variable names (empty if all provided)
 */
export const validateMessageVariables = (
  requiredVariables: string[] = [],
  providedVariables: MessageVariables = {}
): string[] => {
  return requiredVariables.filter(variable => !(variable in providedVariables));
};
