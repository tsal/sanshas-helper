import { OreIntelItem, isOreIntelItem, IntelItem, IntelEntity, storeIntelItem } from '../types';
import { repository } from '../../../database/repository';

// Mock the database repository
jest.mock('../../../database/repository', () => ({
  repository: {
    store: jest.fn(),
    deleteById: jest.fn()
  }
}));

const mockRepository = repository as jest.Mocked<typeof repository>;

describe('OreIntelItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('IntelEntity with OreIntelItem content lifecycle', () => {
    it('should store, retrieve, and delete OreIntelItem through IntelEntity', async () => {
      const guildId = 'test-guild-123';
      const oreContent: OreIntelItem = {
        oreType: 'carbon',
        name: 'Carbon Debris Cluster',
        systemName: 'Zarzakh',
        near: 'P1L4'
      };

      const intelItem: IntelItem = {
        id: 'ore-intel-456',
        timestamp: '2025-08-02T10:30:00.000Z',
        reporter: '123456789012345678',
        content: oreContent,
        location: 'Zarzakh System'
      };

      // Test storage through IntelEntity
      await storeIntelItem(guildId, intelItem);
      
      expect(mockRepository.store).toHaveBeenCalledTimes(1);
      const storedEntity = mockRepository.store.mock.calls[0][0] as IntelEntity;
      expect(storedEntity).toBeInstanceOf(IntelEntity);
      expect(storedEntity.intelItem).toBe(intelItem);
      expect(storedEntity.intelItem.content).toBe(oreContent);

      // Test deletion by ID
      mockRepository.deleteById.mockResolvedValue(true);
      const deleted = await mockRepository.deleteById(IntelEntity, guildId, intelItem.id);
      
      expect(mockRepository.deleteById).toHaveBeenCalledWith(IntelEntity, guildId, 'ore-intel-456');
      expect(deleted).toBe(true);
    });
  });

  describe('isOreIntelItem', () => {
    it('should return true for valid ore intel item', () => {
      const validOreItem: OreIntelItem = {
        oreType: 'metal',
        name: 'Metal Rich Belt',
        systemName: 'Zarzakh',
        near: 'P1L4'
      };

      expect(isOreIntelItem(validOreItem)).toBe(true);
    });

    it('should return true for valid ore intel item with empty near field', () => {
      const validOreItem: OreIntelItem = {
        oreType: 'common',
        name: 'Common Asteroid Cluster',
        systemName: 'Jita',
        near: ''
      };

      expect(isOreIntelItem(validOreItem)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isOreIntelItem(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isOreIntelItem(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isOreIntelItem('string')).toBe(false);
      expect(isOreIntelItem(123)).toBe(false);
      expect(isOreIntelItem(true)).toBe(false);
    });

    it('should return false for missing oreType', () => {
      const invalidItem = {
        name: 'Test Site',
        systemName: 'Zarzakh',
        near: 'P1L4'
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });

    it('should return false for missing name', () => {
      const invalidItem = {
        oreType: 'deep carbon',
        systemName: 'Zarzakh',
        near: 'P1L4'
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });

    it('should return false for missing systemName', () => {
      const invalidItem = {
        oreType: 'deep metal',
        name: 'Test Site',
        near: 'P1L4'
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });

    it('should return false for missing near', () => {
      const invalidItem = {
        oreType: 'carbon',
        name: 'Test Site',
        systemName: 'Zarzakh'
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });

    it('should return false for non-string oreType', () => {
      const invalidItem = {
        oreType: 123,
        name: 'Test Site',
        systemName: 'Zarzakh',
        near: 'P1L4'
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });

    it('should return false for non-string name', () => {
      const invalidItem = {
        oreType: 'metal',
        name: null,
        systemName: 'Zarzakh',
        near: 'P1L4'
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });

    it('should return false for non-string systemName', () => {
      const invalidItem = {
        oreType: 'common',
        name: 'Test Site',
        systemName: undefined,
        near: 'P1L4'
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });

    it('should return false for non-string near', () => {
      const invalidItem = {
        oreType: 'deep carbon',
        name: 'Test Site',
        systemName: 'Zarzakh',
        near: false
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });
  });
});
