import { IntelItem, IntelContentType, RiftIntelItem, IntelEntity, isIntelItem, storeIntelItem } from '../types';

// Mock the database repository
jest.mock('../../database/repository', () => ({
  repository: {
    store: jest.fn()
  }
}));

const { repository: mockRepository } = jest.requireMock('../../database/repository');

describe('Intel Types Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('IntelContentType interface', () => {
    it('should allow empty object as basic content type', () => {
      const basicContent: IntelContentType = {};
      expect(typeof basicContent).toBe('object');
    });
  });

  describe('RiftIntelItem interface', () => {
    it('should create a valid rift intel item', () => {
      const riftIntel: RiftIntelItem = {
        name: 'Unstable Wormhole',
        systemName: 'Jita',
        lPointName: 'P1L4'
      };

      expect(riftIntel.name).toBe('Unstable Wormhole');
      expect(riftIntel.systemName).toBe('Jita');
      expect(riftIntel.lPointName).toBe('P1L4');
    });

    it('should work with different lagrange point formats', () => {
      const riftIntel: RiftIntelItem = {
        name: 'Quantum Anomaly',
        systemName: 'Amarr',
        lPointName: 'P1M2'
      };

      expect(riftIntel.lPointName).toBe('P1M2');
    });
  });

  describe('IntelItem interface', () => {
    const validIntelItem: IntelItem = {
      id: 'intel-123',
      timestamp: '2025-08-02T10:30:00.000Z',
      reporter: '123456789012345678',
      content: {
        name: 'Enemy Fleet Spotted',
        systemName: 'Jita',
        lPointName: 'P1L4'
      } as RiftIntelItem,
      location: 'Jita'
    };

    it('should create a valid intel item with rift content', () => {
      expect(validIntelItem.id).toBe('intel-123');
      expect(validIntelItem.timestamp).toBe('2025-08-02T10:30:00.000Z');
      expect(validIntelItem.reporter).toBe('123456789012345678');
      expect((validIntelItem.content as RiftIntelItem).name).toBe('Enemy Fleet Spotted');
      expect(validIntelItem.location).toBe('Jita');
    });

    it('should create a valid intel item without optional location', () => {
      const intelWithoutLocation: IntelItem = {
        id: 'intel-456',
        timestamp: '2025-08-02T11:00:00.000Z',
        reporter: '987654321098765432',
        content: {} as IntelContentType
      };

      expect(intelWithoutLocation.id).toBe('intel-456');
      expect(intelWithoutLocation.timestamp).toBe('2025-08-02T11:00:00.000Z');
      expect(intelWithoutLocation.reporter).toBe('987654321098765432');
      expect(typeof intelWithoutLocation.content).toBe('object');
      expect(intelWithoutLocation.location).toBeUndefined();
    });
  });

  describe('isIntelItem type guard', () => {
    const validIntelItem: IntelItem = {
      id: 'intel-123',
      timestamp: '2025-08-02T10:30:00.000Z',
      reporter: '123456789012345678',
      content: {
        name: 'Enemy Fleet',
        systemName: 'Jita',
        lPointName: 'P1L4'
      } as RiftIntelItem,
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
        content: {} as IntelContentType
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
        content: {} as IntelContentType
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when id is not a string', () => {
      const invalidItem = {
        id: 123,
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: {} as IntelContentType
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when id is empty string', () => {
      const invalidItem = {
        id: '',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: {} as IntelContentType
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when id is only whitespace', () => {
      const invalidItem = {
        id: '   ',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: {} as IntelContentType
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when timestamp is missing', () => {
      const invalidItem = {
        id: 'intel-123',
        reporter: '123456789012345678',
        content: {} as IntelContentType
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when timestamp is not a string', () => {
      const invalidItem = {
        id: 'intel-123',
        timestamp: 1659441000000,
        reporter: '123456789012345678',
        content: {} as IntelContentType
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when timestamp is empty string', () => {
      const invalidItem = {
        id: 'intel-123',
        timestamp: '',
        reporter: '123456789012345678',
        content: {} as IntelContentType
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when reporter is missing', () => {
      const invalidItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        content: {} as IntelContentType
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when reporter is not a string', () => {
      const invalidItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: 123456789012345678,
        content: {} as IntelContentType
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return false when reporter is empty string', () => {
      const invalidItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '',
        content: {} as IntelContentType
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

    it('should return true when content is an object', () => {
      const validItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: { someField: 'someValue' } as IntelContentType
      };

      expect(isIntelItem(validItem)).toBe(true);
    });

    it('should return true when content is empty object', () => {
      const validItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: {} as IntelContentType
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
        content: {} as IntelContentType,
        location: 123
      };

      expect(isIntelItem(invalidItem)).toBe(false);
    });

    it('should return true when location is undefined', () => {
      const validItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: {} as IntelContentType,
        location: undefined
      };

      expect(isIntelItem(validItem)).toBe(true);
    });

    it('should return true when location is an empty string', () => {
      const validItem = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: {} as IntelContentType,
        location: ''
      };

      expect(isIntelItem(validItem)).toBe(true);
    });

    it('should handle extra properties gracefully', () => {
      const itemWithExtraProps = {
        id: 'intel-123',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: {} as IntelContentType,
        location: 'Jita',
        extraField: 'should not affect validation'
      };

      expect(isIntelItem(itemWithExtraProps)).toBe(true);
    });
  });

  describe('IntelEntity database wrapper', () => {
    const testGuildId = '123456789012345678';
    const testIntelItem: IntelItem = {
      id: 'test-intel-001',
      timestamp: '2025-08-02T12:00:00.000Z',
      reporter: '987654321098765432',
      content: {
        name: 'Test Rift',
        systemName: 'Test System',
        lPointName: 'P1L1'
      } as RiftIntelItem,
      location: 'Test Location'
    };

    it('should create IntelEntity with correct properties', () => {
      const entity = new IntelEntity(testGuildId, testIntelItem);
      
      expect(entity.guildId).toBe(testGuildId);
      expect(entity.intelItem).toBe(testIntelItem);
      expect(IntelEntity.storageKey).toBe('intel-items');
    });

    it('should wrap any valid intel item', () => {
      const simpleIntel: IntelItem = {
        id: 'simple-001',
        timestamp: '2025-08-02T12:30:00.000Z',
        reporter: '111111111111111111',
        content: {} as IntelContentType
      };

      const entity = new IntelEntity(testGuildId, simpleIntel);
      
      expect(entity.intelItem.id).toBe('simple-001');
      expect(entity.intelItem.content).toEqual({});
    });
  });

  describe('storeIntelItem utility', () => {
    const testGuildId = '123456789012345678';
    const testIntelItem: IntelItem = {
      id: 'store-test-001',
      timestamp: '2025-08-02T13:00:00.000Z',
      reporter: '555555555555555555',
      content: {
        name: 'Storage Test Rift',
        systemName: 'Storage System',
        lPointName: 'P2L3'
      } as RiftIntelItem
    };

    it('should store intel item through repository', async () => {
      await storeIntelItem(testGuildId, testIntelItem);
      
      expect(mockRepository.store).toHaveBeenCalledTimes(1);
      
      const storedEntity = mockRepository.store.mock.calls[0][0];
      expect(storedEntity).toBeInstanceOf(IntelEntity);
      expect(storedEntity.guildId).toBe(testGuildId);
      expect(storedEntity.intelItem).toBe(testIntelItem);
    });

    it('should handle storage errors gracefully', async () => {
      const error = new Error('Database storage failed');
      mockRepository.store.mockRejectedValueOnce(error);
      
      await expect(storeIntelItem(testGuildId, testIntelItem)).rejects.toThrow('Database storage failed');
    });
  });
});
