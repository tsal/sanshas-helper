/**
 * Theme system core interfaces and base implementation
 * 
 * See plain/index.ts for detailed implementation example and patterns.
 */

import { MessageCategory, ThemeMessage, MessageVariables, substituteMessageVariables } from './types';

/**
 * Standard message collection interface for module delegation pattern
 */
export interface ThemeModule {
  messages: Record<MessageCategory, ThemeMessage[]>;
}

/**
 * Theme interface - extend BaseTheme to get implementations for free
 */
export interface Theme {
  readonly name: string;
  getRandomMessage(category: MessageCategory): ThemeMessage;
  getMessagesByCategory(category: MessageCategory): ThemeMessage[];
  getMessageWithContent(category: MessageCategory, context?: string, content?: string): ThemeMessage;
  getRandomMessageByContext(category: MessageCategory, context: string): ThemeMessage;
  getMessageWithVariablesByContext(category: MessageCategory, variables: MessageVariables, context: string): ThemeMessage;
}

/**
 * Base implementation with module delegation support
 * Extend this class and provide a ThemeModule for standard behavior
 */
export abstract class BaseTheme implements Theme {
  abstract readonly name: string;
  protected module?: ThemeModule | undefined;

  constructor(module?: ThemeModule | undefined) {
    this.module = module;
  }

  getRandomMessage(category: MessageCategory): ThemeMessage {
    if (this.module) {
      const messages = this.module.messages[category];
      if (!messages || messages.length === 0) {
        return {
          text: 'No message available for this category.',
          category,
          context: 'fallback'
        };
      }
      
      const randomIndex = Math.floor(Math.random() * messages.length);
      return messages[randomIndex];
    }
    throw new Error(`Theme ${this.name} must implement getRandomMessage or provide a module`);
  }

  getMessagesByCategory(category: MessageCategory): ThemeMessage[] {
    if (this.module) {
      return this.module.messages[category] || [];
    }
    throw new Error(`Theme ${this.name} must implement getMessagesByCategory or provide a module`);
  }

  getRandomMessageByContext(category: MessageCategory, context: string): ThemeMessage {
    const messages = this.getMessagesByCategory(category);
    const contextMessages = messages.filter(msg => msg.context === context);
    if (contextMessages.length > 0) {
      const randomIndex = Math.floor(Math.random() * contextMessages.length);
      return contextMessages[randomIndex];
    }
    return this.getRandomMessage(category);
  }

  getMessageWithVariablesByContext(category: MessageCategory, variables: MessageVariables, context: string): ThemeMessage {
    const messages = this.getMessagesByCategory(category);
    const contextMessages = messages.filter(msg => msg.context === context);
    if (contextMessages.length > 0) {
      const randomIndex = Math.floor(Math.random() * contextMessages.length);
      const message = contextMessages[randomIndex];
      return {
        ...message,
        text: substituteMessageVariables(message.text, variables)
      };
    }
    return this.getRandomMessage(category);
  }

  getMessageWithContent(category: MessageCategory, context?: string, content?: string): ThemeMessage {
    let message: ThemeMessage;
    
    if (context) {
      message = this.getRandomMessageByContext(category, context);
    } else {
      message = this.getRandomMessage(category);
    }
    
    if (content) {
      return {
        ...message,
        text: `${message.text} ${content}`
      };
    }
    
    return message;
  }
}
