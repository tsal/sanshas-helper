/**
 * Triglav theme types and interfaces
 * 
 * This file defines the type system for the Triglav theme module,
 * based on the Triglavian Collective's three-fold nature and philosophy
 * of proving, adaptation, and the Flow of Vyraj.
 */

/**
 * Message categories for the Triglav consciousness collective
 * Reflects the three-part nature of Triglavian society and their proving trials
 */
export enum MessageCategory {
  SUCCESS = 'success',
  ERROR = 'error',
  ROLE_ASSIGNMENT = 'role_assignment',
  ROLE_REMOVAL = 'role_removal',
  ACKNOWLEDGMENT = 'acknowledgment',
  WARNING = 'warning',
  GREETING = 'greeting',
  FAREWELL = 'farewell'
}

/**
 * Interface for thematic message strings from the Triglav collective
 * Each message reflects Triglavian concepts of proving, adaptation, and communion
 */
export interface TriglavMessage {
  /** The message text */
  text: string;
  /** Category of the message for organizational purposes */
  category: MessageCategory;
  /** Optional context for when this message should be used */
  context?: string;
  /** Optional list of variable names this message expects for substitution */
  variables?: string[];
  /** Which aspect of the Troika this message represents */
  troikaAspect?: TroikaAspect;
}

/**
 * The three aspects of Triglavian Troikas
 */
export enum TroikaAspect {
  /** Physical-bodied beings, human in form */
  NARODNYA = 'Narodnya',
  /** Free infomorphs, separate from bodies */
  NAVKA = 'Navka', 
  /** Leadership aspect within Troikas */
  KOSCHOI = 'Koschoi'
}

/**
 * Collection of messages organized by category
 */
export interface MessageCollection {
  [MessageCategory.SUCCESS]: TriglavMessage[];
  [MessageCategory.ERROR]: TriglavMessage[];
  [MessageCategory.ROLE_ASSIGNMENT]: TriglavMessage[];
  [MessageCategory.ROLE_REMOVAL]: TriglavMessage[];
  [MessageCategory.ACKNOWLEDGMENT]: TriglavMessage[];
  [MessageCategory.WARNING]: TriglavMessage[];
  [MessageCategory.GREETING]: TriglavMessage[];
  [MessageCategory.FAREWELL]: TriglavMessage[];
}
