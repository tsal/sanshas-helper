/**
 * Message categories for the plain rider theme
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
 * Interface for plain message strings for riders
 */
export interface PlainMessage {
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
  [MessageCategory.SUCCESS]: PlainMessage[];
  [MessageCategory.ERROR]: PlainMessage[];
  [MessageCategory.INITIALIZATION]: PlainMessage[];
  [MessageCategory.ROLE_ASSIGNMENT]: PlainMessage[];
  [MessageCategory.ROLE_REMOVAL]: PlainMessage[];
  [MessageCategory.ACKNOWLEDGMENT]: PlainMessage[];
  [MessageCategory.WARNING]: PlainMessage[];
  [MessageCategory.GREETING]: PlainMessage[];
  [MessageCategory.FAREWELL]: PlainMessage[];
}
