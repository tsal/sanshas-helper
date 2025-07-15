/**
 * Triglav theme module - Triglavian Collective messaging system
 * 
 * This module contains the three-fold voice of the Triglavian Collective,
 * reflecting their bioadaptive technology, proving trials, and the eternal
 * Flow of Vyraj that guides their existence. Messages embody the wisdom
 * of Troikas: Narodnya, Navka, and Koschoi unified in purpose.
 */

export * from './types';
export * from './messages';
export { 
  MessageCategory, 
  TroikaAspect,
  type TriglavMessage, 
  type MessageCollection 
} from './types';
export { 
  TRIGLAV_MESSAGES, 
  getRandomMessage, 
  getMessageByContext,
  getMessageByAspect,
  getMessagesByCategory 
} from './messages';
