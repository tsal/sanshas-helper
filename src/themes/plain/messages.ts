/**
 * Plain theme messages for riders in EVE Frontier
 * 
 * Simple, straightforward messages without dramatic flair or lore references.
 * Perfect for riders who prefer clear, direct communication.
 */

import { MessageCategory, PlainMessage, MessageCollection } from './types';

/**
 * Collection of plain messages organized by category
 */
export const PLAIN_MESSAGES: MessageCollection = {
  [MessageCategory.SUCCESS]: [
    { text: 'Operation completed successfully.', category: MessageCategory.SUCCESS },
    { text: 'Task finished.', category: MessageCategory.SUCCESS },
    { text: 'Done.', category: MessageCategory.SUCCESS },
    { text: 'Successfully completed.', category: MessageCategory.SUCCESS },
    { text: 'Operation successful.', category: MessageCategory.SUCCESS }
  ],

  [MessageCategory.ERROR]: [
    { text: 'An error occurred. Please try again.', category: MessageCategory.ERROR },
    { text: 'Something went wrong.', category: MessageCategory.ERROR },
    { text: 'Error: Operation failed.', category: MessageCategory.ERROR },
    { text: 'Unable to complete the request.', category: MessageCategory.ERROR },
    { text: 'System error encountered.', category: MessageCategory.ERROR }
  ],

  [MessageCategory.INITIALIZATION]: [
    { text: 'System online and ready.', category: MessageCategory.INITIALIZATION },
    { text: 'Bot initialized successfully.', category: MessageCategory.INITIALIZATION },
    { text: 'All systems operational.', category: MessageCategory.INITIALIZATION },
    { text: 'Ready for commands.', category: MessageCategory.INITIALIZATION },
    { text: 'System startup complete.', category: MessageCategory.INITIALIZATION }
  ],

  [MessageCategory.ROLE_ASSIGNMENT]: [
    { text: 'Role assigned successfully.', category: MessageCategory.ROLE_ASSIGNMENT },
    { text: 'You have been added to the role.', category: MessageCategory.ROLE_ASSIGNMENT },
    { text: 'Role granted.', category: MessageCategory.ROLE_ASSIGNMENT },
    { text: 'Access level updated.', category: MessageCategory.ROLE_ASSIGNMENT },
    { text: 'Role assignment complete.', category: MessageCategory.ROLE_ASSIGNMENT }
  ],

  [MessageCategory.ROLE_REMOVAL]: [
    { text: 'Role removed successfully.', category: MessageCategory.ROLE_REMOVAL },
    { text: 'You have been removed from the role.', category: MessageCategory.ROLE_REMOVAL },
    { text: 'Role revoked.', category: MessageCategory.ROLE_REMOVAL },
    { text: 'Access level updated.', category: MessageCategory.ROLE_REMOVAL },
    { text: 'Role removal complete.', category: MessageCategory.ROLE_REMOVAL }
  ],

  [MessageCategory.ACKNOWLEDGMENT]: [
    { text: 'Acknowledged.', category: MessageCategory.ACKNOWLEDGMENT },
    { text: 'Understood.', category: MessageCategory.ACKNOWLEDGMENT },
    { text: 'Roger that.', category: MessageCategory.ACKNOWLEDGMENT },
    { text: 'Confirmed.', category: MessageCategory.ACKNOWLEDGMENT },
    { text: 'Got it.', category: MessageCategory.ACKNOWLEDGMENT }
  ],

  [MessageCategory.WARNING]: [
    { text: 'Warning: Please check your input.', category: MessageCategory.WARNING },
    { text: 'Caution: Invalid operation attempted.', category: MessageCategory.WARNING },
    { text: 'Alert: System limitation encountered.', category: MessageCategory.WARNING },
    { text: 'Notice: Action requires verification.', category: MessageCategory.WARNING },
    { text: 'Warning: Proceed with caution.', category: MessageCategory.WARNING }
  ],

  [MessageCategory.GREETING]: [
    { text: 'Hello, rider.', category: MessageCategory.GREETING },
    { text: 'Welcome to the frontier.', category: MessageCategory.GREETING },
    { text: 'Greetings.', category: MessageCategory.GREETING },
    { text: 'Good to see you.', category: MessageCategory.GREETING },
    { text: 'Hello there.', category: MessageCategory.GREETING }
  ],

  [MessageCategory.FAREWELL]: [
    { text: 'Goodbye, rider.', category: MessageCategory.FAREWELL },
    { text: 'Safe travels.', category: MessageCategory.FAREWELL },
    { text: 'Until next time.', category: MessageCategory.FAREWELL },
    { text: 'Farewell.', category: MessageCategory.FAREWELL },
    { text: 'Take care out there.', category: MessageCategory.FAREWELL }
  ]
};

/**
 * Retrieves a random message from the specified category
 * @param category - The message category to select from
 * @returns A random PlainMessage from the category
 */
export const getRandomMessage = (category: MessageCategory): PlainMessage => {
  const messages = PLAIN_MESSAGES[category];
  if (!messages || messages.length === 0) {
    return {
      text: 'No message available.',
      category
    };
  }
  
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

/**
 * Retrieves a message by category and context
 * @param category - The message category to select from
 * @param context - The context to filter by
 * @returns A PlainMessage matching the criteria, or random from category if context not found
 */
export const getMessageByContext = (category: MessageCategory, context?: string): PlainMessage => {
  if (!context) {
    return getRandomMessage(category);
  }
  
  const messages = PLAIN_MESSAGES[category];
  if (!messages || messages.length === 0) {
    return getRandomMessage(category);
  }
  
  // Look for messages with matching context
  const contextMessages = messages.filter(msg => msg.context === context);
  if (contextMessages.length > 0) {
    const randomIndex = Math.floor(Math.random() * contextMessages.length);
    return contextMessages[randomIndex];
  }
  
  // If no context match found, return a random message from the category
  return getRandomMessage(category);
};

/**
 * Retrieves all messages from a specific category
 * @param category - The message category to retrieve
 * @returns Array of all PlainMessage objects in the category
 */
export const getMessagesByCategory = (category: MessageCategory): PlainMessage[] => {
  return PLAIN_MESSAGES[category] || [];
};
