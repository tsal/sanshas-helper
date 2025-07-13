/**
 * Message categories for the Kuvakei consciousness remnant
 */
export enum MessageCategory {
  SUCCESS = 'success',
  ERROR = 'error',
  INITIALIZATION = 'initialization',
  ROLE_ASSIGNMENT = 'role_assignment',
  ROLE_REMOVAL = 'role_removal',
  ACKNOWLEDGMENT = 'acknowledgment',
  WARNING = 'warning',
  GREETING = 'greeting',
  FAREWELL = 'farewell'
}

/**
 * Interface for thematic message strings from the Kuvakei consciousness
 */
export interface KuvakeiMessage {
  /** The message text */
  text: string;
  /** Category of the message for organizational purposes */
  category: MessageCategory;
  /** Optional context for when this message should be used */
  context?: string;
}

/**
 * Collection of messages organized by category
 */
export interface MessageCollection {
  [MessageCategory.SUCCESS]: KuvakeiMessage[];
  [MessageCategory.ERROR]: KuvakeiMessage[];
  [MessageCategory.INITIALIZATION]: KuvakeiMessage[];
  [MessageCategory.ROLE_ASSIGNMENT]: KuvakeiMessage[];
  [MessageCategory.ROLE_REMOVAL]: KuvakeiMessage[];
  [MessageCategory.ACKNOWLEDGMENT]: KuvakeiMessage[];
  [MessageCategory.WARNING]: KuvakeiMessage[];
  [MessageCategory.GREETING]: KuvakeiMessage[];
  [MessageCategory.FAREWELL]: KuvakeiMessage[];
}
