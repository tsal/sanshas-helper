import { IntelItem, isIntelItem } from '../types';

describe('Intel Types Module', () => {
  describe('IntelItem interface', () => {
    const validIntelItem: IntelItem = {
      id: 'intel-123',
      timestamp: '2025-08-02T10:30:00.000Z',
      reporter: '123456789012345678',
      content: 'Enemy fleet spotted in Jita system',
      location: 'Jita'
    };

    it('should create a valid intel item with all fields', () => {
      expect(validIntelItem.id).toBe('intel-123');
      expect(validIntelItem.timestamp).toBe('2025-08-02T10:30:00.000Z');
      expect(validIntelItem.reporter).toBe('123456789012345678');
      expect(validIntelItem.content).toBe('Enemy fleet spotted in Jita system');
      expect(validIntelItem.location).toBe('Jita');
    });

    it('should create a valid intel item without optional location', () => {
      const intelWithoutLocation: IntelItem = {
        id: 'intel-456',
        timestamp: '2025-08-02T11:00:00.000Z',
        reporter: '987654321098765432',
        content: { type: 'general', message: 'General intel report' }
      };

      expect(intelWithoutLocation.id).toBe('intel-456');
      expect(intelWithoutLocation.timestamp).toBe('2025-08-02T11:00:00.000Z');
      expect(intelWithoutLocation.reporter).toBe('987654321098765432');
      expect(intelWithoutLocation.content).toEqual({ type: 'general', message: 'General intel report' });
      expect(intelWithoutLocation.location).toBeUndefined();
    });
  });

  describe('isIntelItem type guard', () => {
    const validIntelItem: IntelItem = {
      id: 'intel-123',
      timestamp: '2025-08-02T10:30:00.000Z',
      reporter: '123456789012345678',
      content: 'Enemy fleet spotted in Jita system',
      location: 'Jita'
    };

    it('should return true for valid intel item with all fields', () => {
      expect(isIntelItem(validIntelItem)).toBe(true);
    });

    it('should return true for valid intel item without optional location', () => {
      const intelWithoutLocation = {
        id: 'intel-456',
        timestamp: '2025-08-02T11:00:00.000Z',
        reporter: '987654321098765432',
        content: { type: 'alert', data: ['enemy', 'spotted'] }
      };

      expect(isIntelItem(intelWithoutLocation)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isIntelItem(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isIntelItem(undefined)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(isIntelItem('string')).toBe(false);
      expect(isIntelItem(123)).toBe(false);
      expect(isIntelItem(true)).toBe(false);
      expect(isIntelItem([])).toBe(false);
    });

    it('should return false when id is missing', () => {
      const invalidItem = {
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: 'Enemy fleet spotted'
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when id is not a string', () => {
      const invalidItem = {
        id: 123,
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: 'Enemy fleet spotted'
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when id is empty string', () => {
      const invalidItem = {
        id: '',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: 'Enemy fleet spotted'
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when id is only whitespace', () => {
      const invalidItem = {
        id: '   ',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: 'Enemy fleet spotted'
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when timestamp is missing', () => {
      const invalidItem = {
        id: 'intel-123',
        reporter: '123456789012345678',
        content: 'Enemy fleet spotted'
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when timestamp is not a string', () => {
      const invalidItem = {
        id: 'intel-123',
        timestamp: 1659441000000,
        reporter: '123456789012345678',
        content: 'Enemy fleet spotted'
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when timestamp is empty string', () => {
      const invalidItem = {
        id: 'intel-123',
        timestamp: '',
        reporter: '123456789012345678',
        content: 'Enemy fleet spotted'
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when reporter is missing', () => {
      const invalidItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        content: 'Enemy fleet spotted'
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when reporter is not a string', () => {
      const invalidItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: 123456789012345678,
        content: 'Enemy fleet spotted'
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when reporter is empty string', () => {
      const invalidItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '',
        content: 'Enemy fleet spotted'
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when content is missing', () => {
      const invalidItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678'
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return true when content is an array', () => {
      const validItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: ['Enemy', 'fleet', 'spotted']
      };

      expect(isIntelItem(validItem)).toBe(true);
    });

    it('should return true when content is empty string', () => {
      const validItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: ''
      };

      expect(isIntelItem(validItem)).toBe(true);
    });

    it('should return false when content is null', () => {
      const invalidItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: null
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when content is undefined', () => {
      const invalidItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: undefined
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when location is not a string', () => {
      const invalidItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: 'Enemy fleet spotted',
        location: 123
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return true when location is undefined', () => {
      const validItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: 'Enemy fleet spotted',
        location: undefined
      };

      expect(isIntelItem(validItem)).toBe(true);
    });

    it('should return true when location is an empty string', () => {
      const validItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: 'Enemy fleet spotted',
        location: ''
      };

      expect(isIntelItem(validItem)).toBe(true);
    });

    it('should handle extra properties gracefully', () => {
      const itemWithExtraProps = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: 'Enemy fleet spotted',
        location: 'Jita',
        extraField: 'should not affect validation'
      };

      expect(isIntelItem(itemWithExtraProps)).toBe(true);
    });
  });
});
