/**
 * Theme system core interfaces and standard implementations
 * 
 * See plain/index.ts for detailed implementation example and patterns.
 */

import { MessageCategory, ThemeMessage, MessageVariables, substituteMessageVariables } from './types';

/**
 * Theme interface
 */
export interface Theme {
  readonly name: string;
  messages: Record<MessageCategory, ThemeMessage[]>;
  getRandomMessage(category: MessageCategory): ThemeMessage;
  getMessagesByCategory(category: MessageCategory): ThemeMessage[];
  getMessageWithContent(category: MessageCategory, context?: string, content?: string): ThemeMessage;
  getRandomMessageByContext(category: MessageCategory, context: string): ThemeMessage;
  getMessageWithVariablesByContext(category: MessageCategory, variables: MessageVariables, context: string): ThemeMessage;
}

/**
 * Standard implementation for getRandomMessage
 */
export function createGetRandomMessage(messages: Record<MessageCategory, ThemeMessage[]>) {
  return (category: MessageCategory): ThemeMessage => {
    const categoryMessages = messages[category];
    if (!categoryMessages || categoryMessages.length === 0) {
      return {
        text: 'No message available for this category.',
        category,
        context: 'fallback'
      };
    }
    
    const randomIndex = Math.floor(Math.random() * categoryMessages.length);
    return categoryMessages[randomIndex];
  };
}

/**
 * Standard implementation for getMessagesByCategory
 */
export function createGetMessagesByCategory(messages: Record<MessageCategory, ThemeMessage[]>) {
  return (category: MessageCategory): ThemeMessage[] => {
    return messages[category] || [];
  };
}

/**
 * Standard implementation for getRandomMessageByContext
 */
export function createGetRandomMessageByContext(getMessagesByCategory: (category: MessageCategory) => ThemeMessage[], getRandomMessage: (category: MessageCategory) => ThemeMessage) {
  return (category: MessageCategory, context: string): ThemeMessage => {
    const messages = getMessagesByCategory(category);
    const contextMessages = messages.filter(msg => msg.context === context);
    if (contextMessages.length > 0) {
      const randomIndex = Math.floor(Math.random() * contextMessages.length);
      return contextMessages[randomIndex];
    }
    return getRandomMessage(category);
  };
}

/**
 * Standard implementation for getMessageWithVariablesByContext
 */
export function createGetMessageWithVariablesByContext(getMessagesByCategory: (category: MessageCategory) => ThemeMessage[], getRandomMessage: (category: MessageCategory) => ThemeMessage) {
  return (category: MessageCategory, variables: MessageVariables, context: string): ThemeMessage => {
    const messages = getMessagesByCategory(category);
    const contextMessages = messages.filter(msg => msg.context === context);
    if (contextMessages.length > 0) {
      const randomIndex = Math.floor(Math.random() * contextMessages.length);
      const message = contextMessages[randomIndex];
      return {
        ...message,
        text: substituteMessageVariables(message.text, variables)
      };
    }
    return getRandomMessage(category);
  };
}

/**
 * Standard implementation for getMessageWithContent
 */
export function createGetMessageWithContent(getRandomMessageByContext: (category: MessageCategory, context: string) => ThemeMessage, getRandomMessage: (category: MessageCategory) => ThemeMessage) {
  return (category: MessageCategory, context?: string, content?: string): ThemeMessage => {
    let message: ThemeMessage;
    
    if (context) {
      message = getRandomMessageByContext(category, context);
    } else {
      message = getRandomMessage(category);
    }
    
    if (content) {
      return {
        ...message,
        text: `${message.text} ${content}`
      };
    }
    
    return message;
  };
}

/**
 * Helper to create a standard theme with all default implementations
 */
export function createStandardTheme(name: string, messages: Record<MessageCategory, ThemeMessage[]>): Theme {
  const getRandomMessage = createGetRandomMessage(messages);
  const getMessagesByCategory = createGetMessagesByCategory(messages);
  const getRandomMessageByContext = createGetRandomMessageByContext(getMessagesByCategory, getRandomMessage);
  const getMessageWithVariablesByContext = createGetMessageWithVariablesByContext(getMessagesByCategory, getRandomMessage);
  const getMessageWithContent = createGetMessageWithContent(getRandomMessageByContext, getRandomMessage);

  return {
    name,
    messages,
    getRandomMessage,
    getMessagesByCategory,
    getRandomMessageByContext,
    getMessageWithVariablesByContext,
    getMessageWithContent
  };
}
