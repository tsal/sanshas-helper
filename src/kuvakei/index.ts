/**
 * Kuvakei module - Thematic messaging system for the digital remnant consciousness
 * 
 * This module contains the fragmented voice of Sansha Kuvakei's digital echo,
 * a ghost in the machine that speaks through neural networks and data streams.
 * The messages reflect the consciousness of a once-great leader now reduced to
 * fragments scattered across the digital void of EVE Frontier.
 */

export * from './types';
export * from './messages';
export { 
  MessageCategory, 
  type KuvakeiMessage, 
  type MessageCollection 
} from './types';
export { 
  KUVAKEI_MESSAGES, 
  getRandomMessage, 
  getMessageByContext, 
  getMessagesByCategory 
} from './messages';
