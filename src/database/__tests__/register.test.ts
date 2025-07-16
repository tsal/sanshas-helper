import { isDatabaseEnabled, registerObject, storeObject, storeCollection, resetDatabaseForTesting } from '../register';
import { DatabaseEntity } from '../types';

// Mock lowdb
jest.mock('lowdb/node', () => ({
  JSONFilePreset: jest.fn()
}));

// Mock repository
jest.mock('../repository', () => ({
  repository: {
    isInitialized: jest.fn()
  }
}));

// Get mocked functions after jest.mock calls
const { JSONFilePreset: mockJSONFilePreset } = jest.requireMock('lowdb/node');
const { repository: mockRepository } = jest.requireMock('../repository');

// Mock database instance
const mockWrite = jest.fn();
const mockDbInstance = {
  data: {} as Record<string, Record<string, any[]>>,
  write: mockWrite
};

// Test entities
class TestEntity extends DatabaseEntity {
  static readonly storageKey = 'test-entities';
  
  constructor(guildId: string, public value: string) {
    super(guildId);
  }
}

class NoStorageKeyEntity extends DatabaseEntity {
  constructor(guildId: string) {
    super(guildId);
  }
}

describe('Database Register Module', () => {
  const testGuildId = '123456789012345678';
  const testDatabasePath = '/test/database.json';

  beforeEach(() => {
    jest.clearAllMocks();
    resetDatabaseForTesting();
    
    // Reset mock database state
    mockDbInstance.data = {};
    mockJSONFilePreset.mockResolvedValue(mockDbInstance);
    
    // Default: repository is initialized
    mockRepository.isInitialized.mockReturnValue(true);
  });

  describe('isDatabaseEnabled', () => {
    it('should return false when databasePath is null', () => {
      mockRepository.isInitialized.mockReturnValue(true);
      
      const result = isDatabaseEnabled(null);
      
      expect(result).toBe(false);
    });

    it('should return false when databasePath exists but repository not initialized', () => {
      mockRepository.isInitialized.mockReturnValue(false);
      
      const result = isDatabaseEnabled('/some/path');
      
      expect(result).toBe(false);
    });

    it('should return true when databasePath exists and repository is initialized', () => {
      mockRepository.isInitialized.mockReturnValue(true);
      
      const result = isDatabaseEnabled('/some/path');
      
      expect(result).toBe(true);
    });

    it('should return true for empty string path when repository is initialized', () => {
      mockRepository.isInitialized.mockReturnValue(true);
      
      const result = isDatabaseEnabled('');
      
      expect(result).toBe(true);
    });
  });

  describe('registerObject', () => {
    it('should register an object type without error', () => {
      expect(() => registerObject(TestEntity)).not.toThrow();
    });

    it('should handle multiple registrations of the same type', () => {
      registerObject(TestEntity);
      
      expect(() => registerObject(TestEntity)).not.toThrow();
    });
  });

  describe('storeObject', () => {
    it('should store an object successfully', async () => {
      const entity = new TestEntity(testGuildId, 'test-data');
      
      await storeObject(testDatabasePath, entity);
      
      expect(mockJSONFilePreset).toHaveBeenCalledWith(testDatabasePath, {});
      expect(mockDbInstance.data[testGuildId]).toBeDefined();
      expect(mockDbInstance.data[testGuildId]['test-entities']).toContain(entity);
      expect(mockWrite).toHaveBeenCalled();
    });

    it('should create guild data structure if it does not exist', async () => {
      const entity = new TestEntity(testGuildId, 'test-data');
      
      await storeObject(testDatabasePath, entity);
      
      expect(mockDbInstance.data[testGuildId]).toBeDefined();
      expect(typeof mockDbInstance.data[testGuildId]).toBe('object');
    });

    it('should create storage array if it does not exist', async () => {
      const entity = new TestEntity(testGuildId, 'test-data');
      
      await storeObject(testDatabasePath, entity);
      
      expect(Array.isArray(mockDbInstance.data[testGuildId]['test-entities'])).toBe(true);
    });

    it('should append to existing storage array', async () => {
      const entity1 = new TestEntity(testGuildId, 'data1');
      const entity2 = new TestEntity(testGuildId, 'data2');
      
      await storeObject(testDatabasePath, entity1);
      await storeObject(testDatabasePath, entity2);
      
      const stored = mockDbInstance.data[testGuildId]['test-entities'];
      expect(stored).toHaveLength(2);
      expect(stored).toContain(entity1);
      expect(stored).toContain(entity2);
    });

    it('should handle multiple guilds', async () => {
      const guild1Entity = new TestEntity('111111111111111111', 'guild1-data');
      const guild2Entity = new TestEntity('222222222222222222', 'guild2-data');
      
      await storeObject(testDatabasePath, guild1Entity);
      await storeObject(testDatabasePath, guild2Entity);
      
      expect(mockDbInstance.data['111111111111111111']['test-entities']).toContain(guild1Entity);
      expect(mockDbInstance.data['222222222222222222']['test-entities']).toContain(guild2Entity);
    });

    it('should throw error when entity has no storageKey', async () => {
      const entity = new NoStorageKeyEntity(testGuildId);
      
      await expect(storeObject(testDatabasePath, entity)).rejects.toThrow(
        'Object class must have a static storageKey property'
      );
    });

    it('should propagate database initialization errors', async () => {
      const entity = new TestEntity(testGuildId, 'test-data');
      mockJSONFilePreset.mockRejectedValueOnce(new Error('Database init failed'));
      
      await expect(storeObject(testDatabasePath, entity)).rejects.toThrow('Database init failed');
    });
  });

  describe('storeCollection', () => {
    it('should store a collection successfully', async () => {
      const collection = { guildId: testGuildId, data: ['item1', 'item2'] };
      
      await storeCollection(testDatabasePath, 'test-collections', collection);
      
      expect(mockJSONFilePreset).toHaveBeenCalledWith(testDatabasePath, {});
      expect(mockDbInstance.data[testGuildId]['test-collections']).toContain(collection);
      expect(mockWrite).toHaveBeenCalled();
    });

    it('should append multiple collections', async () => {
      const collection1 = { guildId: testGuildId, data: ['item1'] };
      const collection2 = { guildId: testGuildId, data: ['item2'] };
      
      await storeCollection(testDatabasePath, 'test-collections', collection1);
      await storeCollection(testDatabasePath, 'test-collections', collection2);
      
      const stored = mockDbInstance.data[testGuildId]['test-collections'];
      expect(stored).toHaveLength(2);
      expect(stored).toContain(collection1);
      expect(stored).toContain(collection2);
    });

    it('should handle different collection types', async () => {
      const typeA = { guildId: testGuildId, data: ['dataA'] };
      const typeB = { guildId: testGuildId, data: ['dataB'] };
      
      await storeCollection(testDatabasePath, 'type-a', typeA);
      await storeCollection(testDatabasePath, 'type-b', typeB);
      
      expect(mockDbInstance.data[testGuildId]['type-a']).toContain(typeA);
      expect(mockDbInstance.data[testGuildId]['type-b']).toContain(typeB);
    });
  });

  describe('resetDatabaseForTesting', () => {
    it('should reset database state', () => {
      // Setup some state
      registerObject(TestEntity);
      
      // Reset should clear everything
      resetDatabaseForTesting();
      
      // Should be able to register again without issues
      expect(() => registerObject(TestEntity)).not.toThrow();
    });
  });
});
