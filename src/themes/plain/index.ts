/**
 * Plain theme - Reference implementation for all themes
 * 
 * This theme serves as the example showing the required structure and patterns.
 * All themes must implement the same MessageCategory structure and ordering.
 */

import { BaseTheme, ThemeModule } from '../base';
import { MessageCategory, MessageCollection } from '../types';

/**
 * Theme module using standard message collection pattern
 * All themes should follow this module delegation approach
 */
const plainModule: ThemeModule = {
  get messages() { return PLAIN_MESSAGES; }
};

/**
 * Theme implementation extending BaseTheme
 * Uses module delegation for standard behavior
 */
export class PlainTheme extends BaseTheme {
  readonly name = 'plain';

  constructor() {
    super(plainModule);
  }
}

/**
 * Message collection - all themes must implement all categories in this exact order:
 * SUCCESS, ERROR, ROLE_ASSIGNMENT, ROLE_REMOVAL, ACKNOWLEDGMENT, WARNING, GREETING, FAREWELL
 * 
 * Context is optional snake_case identifier for message selection.
 * Variables array lists placeholder names for {variable} substitution.
 */
const PLAIN_MESSAGES: MessageCollection = {
  [MessageCategory.SUCCESS]: [
    { 
      text: 'Operation completed successfully.', 
      category: MessageCategory.SUCCESS,
      context: 'success_action'
    },
    { 
      text: 'Task finished.', 
      category: MessageCategory.SUCCESS,
      context: 'success_action'
    },
    { text: 'Done.', category: MessageCategory.SUCCESS },
    { text: 'Successfully completed.', category: MessageCategory.SUCCESS },
    { text: 'Operation successful.', category: MessageCategory.SUCCESS }
  ],

  [MessageCategory.ERROR]: [
    { text: 'An error occurred. Please try again.', category: MessageCategory.ERROR, context: 'operation_error' },
    { text: 'Something went wrong.', category: MessageCategory.ERROR, context: 'operation_error' },
    { text: 'Error: Operation failed.', category: MessageCategory.ERROR, context: 'operation_error' },
    { text: 'Unable to complete the request.', category: MessageCategory.ERROR, context: 'operation_error' },
    { text: 'System error encountered.', category: MessageCategory.ERROR, context: 'operation_error' }
  ],

  [MessageCategory.ROLE_ASSIGNMENT]: [
    { 
      text: 'Role assigned successfully to {username}.', 
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'role_assigned',
      variables: ['username']
    },
    { 
      text: '{username} has been added to the {roleName} role.', 
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'assignment_complete',
      variables: ['username', 'roleName']
    },
    { 
      text: 'Role granted to {username}.', 
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'user_role',
      variables: ['username']
    },
    { text: 'Access level updated.', category: MessageCategory.ROLE_ASSIGNMENT },
    { text: 'Role assignment complete.', category: MessageCategory.ROLE_ASSIGNMENT }
  ],

  [MessageCategory.ROLE_REMOVAL]: [
    { 
      text: 'Role removed successfully from {username}.', 
      category: MessageCategory.ROLE_REMOVAL,
      context: 'role_removed',
      variables: ['username']
    },
    { 
      text: '{username} has been removed from the {roleName} role.', 
      category: MessageCategory.ROLE_REMOVAL,
      context: 'removal_complete',
      variables: ['username', 'roleName']
    },
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
    { 
      text: 'Hello, {username}.', 
      category: MessageCategory.GREETING,
      context: 'greeting',
      variables: ['username']
    },
    { 
      text: 'Welcome to the frontier, {username}.', 
      category: MessageCategory.GREETING,
      context: 'welcome',
      variables: ['username']
    },
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

export const plainTheme = new PlainTheme();
