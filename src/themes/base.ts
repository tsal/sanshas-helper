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
 * Helper function to find the best message when variables may not align
 * Handles robust fallback logic for variable matching
 */
function findBestMessageWithVariables(
  contextMessages: ThemeMessage[],
  providedVariables: MessageVariables,
  allCategoryMessages: ThemeMessage[]
): ThemeMessage {
  // 1. Try to find a message in context with matching variables
  const viableVariableMessages = contextMessages.filter(msg => 
    msg.variables && msg.variables.every(varName => 
      providedVariables[varName] !== undefined && providedVariables[varName] !== ''
    )
  );
  
  if (viableVariableMessages.length > 0) {
    const randomIndex = Math.floor(Math.random() * viableVariableMessages.length);
    return viableVariableMessages[randomIndex];
  }
  
  // 2. Try to find a message without variables in same context
  const noVariableMessages = contextMessages.filter(msg => !msg.variables || msg.variables.length === 0);
  
  if (noVariableMessages.length > 0) {
    const randomIndex = Math.floor(Math.random() * noVariableMessages.length);
    return noVariableMessages[randomIndex];
  }
  
  // 3. Fall back to any message in the category
  const randomIndex = Math.floor(Math.random() * allCategoryMessages.length);
  return allCategoryMessages[randomIndex];
}

/**
 * Standard implementation for getMessageWithVariablesByContext
 */
export function createGetMessageWithVariablesByContext(getMessagesByCategory: (category: MessageCategory) => ThemeMessage[], getRandomMessage: (category: MessageCategory) => ThemeMessage) {
  return (category: MessageCategory, variables: MessageVariables, context: string): ThemeMessage => {
    const allCategoryMessages = getMessagesByCategory(category);
    const contextMessages = allCategoryMessages.filter(msg => msg.context === context);
    
    if (contextMessages.length > 0) {
      const selectedMessage = findBestMessageWithVariables(contextMessages, variables, allCategoryMessages);
      
      // Only apply variable substitution if the message actually has variables and they match
      if (selectedMessage.variables && selectedMessage.variables.every(varName => 
        variables[varName] !== undefined && variables[varName] !== ''
      )) {
        return {
          ...selectedMessage,
          text: substituteMessageVariables(selectedMessage.text, variables)
        };
      }
      
      // Return message as-is if no variables needed or variables don't match
      return selectedMessage;
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
