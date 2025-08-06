/**
 * Tests for base theme functionality and fallback logic
 */

import { createStandardTheme, createGetRandomMessage, createGetMessagesByCategory } from '../base';
import { MessageCategory } from '../types';
import { plainTheme } from '../plain';

describe('Base Theme Functions', () => {
  describe('createGetRandomMessage', () => {
    test('returns random message from category', () => {
      const messages = {
        [MessageCategory.SUCCESS]: [
          { text: 'Success 1', category: MessageCategory.SUCCESS },
          { text: 'Success 2', category: MessageCategory.SUCCESS }
        ]
      } as any;
      
      const getRandomMessage = createGetRandomMessage(messages);
      const result = getRandomMessage(MessageCategory.SUCCESS);
      
      expect(result.category).toBe(MessageCategory.SUCCESS);
      expect(['Success 1', 'Success 2']).toContain(result.text);
    });

    test('returns fallback message for empty category', () => {
      const messages = { [MessageCategory.SUCCESS]: [] } as any;
      const getRandomMessage = createGetRandomMessage(messages);
      const result = getRandomMessage(MessageCategory.SUCCESS);
      
      expect(result.text).toBe('No message available for this category.');
      expect(result.context).toBe('fallback');
    });
  });

  describe('createGetMessagesByCategory', () => {
    test('returns all messages for category', () => {
      const messages = {
        [MessageCategory.SUCCESS]: [
          { text: 'Success 1', category: MessageCategory.SUCCESS },
          { text: 'Success 2', category: MessageCategory.SUCCESS }
        ]
      } as any;
      
      const getMessagesByCategory = createGetMessagesByCategory(messages);
      const result = getMessagesByCategory(MessageCategory.SUCCESS);
      
      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Success 1');
    });

    test('returns empty array for nonexistent category', () => {
      const messages = {} as any;
      const getMessagesByCategory = createGetMessagesByCategory(messages);
      const result = getMessagesByCategory(MessageCategory.SUCCESS);
      
      expect(result).toEqual([]);
    });
  });

  describe('getMessageWithVariablesByContext fallback logic', () => {
    test('uses message with matching variables', () => {
      const result = plainTheme.getMessageWithVariablesByContext(
        MessageCategory.SUCCESS,
        { itemCount: '5', itemType: 'ore', location: 'bay' },
        'storage_success'
      );
      
      expect(result.text).toBe('Stored 5 ore items to bay successfully.');
    });

    test('falls back to non-variable message in same context when variables do not match', () => {
      const result = plainTheme.getMessageWithVariablesByContext(
        MessageCategory.SUCCESS,
        { wrongVar: 'value' },
        'success_action'
      );
      
      expect(result.text).toMatch(/Operation completed successfully|Task finished/);
      expect(result.context).toBe('success_action');
    });

    test('falls back to category random when context has only variable messages and variables do not match', () => {
      const result = plainTheme.getMessageWithVariablesByContext(
        MessageCategory.SUCCESS,
        { wrongVar: 'value' },
        'storage_success'
      );
      
      // Should fall back to any message in SUCCESS category since storage_success only has variable messages
      expect(result.category).toBe(MessageCategory.SUCCESS);
      expect(result.text).not.toContain('{'); // Should not contain placeholders
    });

    test('falls back to category random when context does not exist', () => {
      const result = plainTheme.getMessageWithVariablesByContext(
        MessageCategory.SUCCESS,
        { username: 'test' },
        'nonexistent_context'
      );
      
      expect(result.category).toBe(MessageCategory.SUCCESS);
      expect(result.text).not.toContain('{'); // Should not contain placeholders
    });

    test('handles missing variables gracefully', () => {
      const result = plainTheme.getMessageWithVariablesByContext(
        MessageCategory.SUCCESS,
        { itemCount: '5' }, // Missing itemType and location
        'storage_success'
      );
      
      // Should fall back since not all variables provided
      expect(result.category).toBe(MessageCategory.SUCCESS);
      expect(result.text).not.toContain('{'); // Should not contain placeholders
    });

    test('handles empty variables gracefully', () => {
      const result = plainTheme.getMessageWithVariablesByContext(
        MessageCategory.SUCCESS,
        { itemCount: '', itemType: 'ore', location: 'bay' }, // Empty variable
        'storage_success'
      );
      
      // Should fall back since itemCount is empty
      expect(result.category).toBe(MessageCategory.SUCCESS);
      expect(result.text).not.toContain('{'); // Should not contain placeholders
    });

    test('falls back when variables are completely different from what context expects', () => {
      const result = plainTheme.getMessageWithVariablesByContext(
        MessageCategory.ACKNOWLEDGMENT,
        { itemCount: '5', location: 'bay', wrongVar: 'test' }, // Completely different variables
        'user_ack' // This context only expects 'username'
      );
      
      // Should fall back to category random since no message in user_ack context can work with these variables
      expect(result.category).toBe(MessageCategory.ACKNOWLEDGMENT);
      expect(result.text).not.toContain('{'); // Should not contain placeholders
    });
  });

  describe('createStandardTheme integration', () => {
    test('creates working theme with all methods', () => {
      const messages = {
        [MessageCategory.SUCCESS]: [
          { text: 'Success', category: MessageCategory.SUCCESS }
        ],
        [MessageCategory.ERROR]: [
          { text: 'Error', category: MessageCategory.ERROR }
        ]
      } as any;
      
      const theme = createStandardTheme('test', messages);
      
      expect(theme.name).toBe('test');
      expect(theme.messages).toBe(messages);
      expect(typeof theme.getRandomMessage).toBe('function');
      expect(typeof theme.getMessagesByCategory).toBe('function');
      expect(typeof theme.getRandomMessageByContext).toBe('function');
      expect(typeof theme.getMessageWithVariablesByContext).toBe('function');
      expect(typeof theme.getMessageWithContent).toBe('function');
    });
  });
});
