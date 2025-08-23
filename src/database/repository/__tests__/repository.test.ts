import { repository } from '../repository';
import { IntelEntity } from '../../../discord/intel/types';
import { DatabaseEntity, Purgeable } from '../../types';
import { tmpdir } from 'os';
import { join } from 'path';
import { JSONFilePreset } from 'lowdb/node';

// Mock lowdb
jest.mock('lowdb/node', () => ({
  JSONFilePreset: jest.fn()
}));

const mockJSONFilePreset = JSONFilePreset as jest.MockedFunction<typeof JSONFilePreset>;

// Mock database instance
const mockWrite = jest.fn();
const mockRead = jest.fn();
const mockUpdate = jest.fn();
const mockDbInstance = {
  data: {} as Record<string, any>,
  write: mockWrite,
  read: mockRead,
  update: mockUpdate,
  adapter: {} as any
};

// Mock the register module to use our mocked database
jest.mock('../../register', () => {
  const originalModule = jest.requireActual('../../register');
  return {
    ...originalModule,
    resetDatabaseForTesting: originalModule.resetDatabaseForTesting
  };
});

const { resetDatabaseForTesting } = jest.requireMock('../../register');

describe('Repository Integration Tests', () => {
  const testGuildId = '123456789012345678';
  const testDatabasePath = join(tmpdir(), `test-${Date.now()}.json`);

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset repository state
    (repository as any).config = null;
    (repository as any).initialized = false;
    (repository as any).dbInstance = null; // Reset database instance for fresh tests
    
    // Reset database instance in register module
    resetDatabaseForTesting();
    
    // Reset mock database
    mockDbInstance.data = {};
    mockWrite.mockResolvedValue(undefined);
    mockRead.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue(undefined);
    mockJSONFilePreset.mockResolvedValue(mockDbInstance);
  });

  describe('Repository Lifecycle', () => {
    it('should initialize with valid config', async () => {
      expect(repository.isInitialized()).toBe(false);
      
      await repository.initialize({ databasePath: testDatabasePath });
      
      expect(repository.isInitialized()).toBe(true);
    });

    it('should handle multiple initializations', async () => {
      await repository.initialize({ databasePath: testDatabasePath });
      expect(repository.isInitialized()).toBe(true);
      
      await repository.initialize({ databasePath: 'different-path.json' });
      expect(repository.isInitialized()).toBe(true);
    });
  });

  describe('Store Operations', () => {
    beforeEach(async () => {
      await repository.initialize({ databasePath: testDatabasePath });
    });

    it('should store IntelEntity successfully', async () => {
      const intelItem = {
        id: 'test-id-1',
        timestamp: new Date().toISOString(),
        reporter: 'user123',
        content: { type: 'Test Rift', systemName: 'Alpha', near: 'P1L4' },
        location: 'Test Location'
      };
      const entity = new IntelEntity(testGuildId, intelItem);

      await repository.store(entity);

      // Verify the entity was stored in the mock database
      expect(mockDbInstance.data[testGuildId]).toBeDefined();
      expect(mockDbInstance.data[testGuildId][IntelEntity.storageKey]).toBeDefined();
      expect(mockDbInstance.data[testGuildId][IntelEntity.storageKey]).toContain(entity);
      expect(mockWrite).toHaveBeenCalled();
    });

    it('should handle store when not initialized', async () => {
      (repository as any).initialized = false;
      
      const intelItem = {
        id: 'test-id-2',
        timestamp: new Date().toISOString(),
        reporter: 'user456',
        content: {},
      };
      const entity = new IntelEntity(testGuildId, intelItem);

      // Should not throw, but should skip storage
      await repository.store(entity);

      expect(mockJSONFilePreset).not.toHaveBeenCalled();
      expect(mockWrite).not.toHaveBeenCalled();
    });

    it('should store multiple entities for same guild', async () => {
      const entity1 = new IntelEntity(testGuildId, {
        id: 'test-1',
        timestamp: new Date().toISOString(),
        reporter: 'user1',
        content: {}
      });
      const entity2 = new IntelEntity(testGuildId, {
        id: 'test-2', 
        timestamp: new Date().toISOString(),
        reporter: 'user2',
        content: {}
      });

      await repository.store(entity1);
      await repository.store(entity2);

      const storedItems = mockDbInstance.data[testGuildId][IntelEntity.storageKey];
      expect(storedItems).toHaveLength(2);
      expect(storedItems).toContain(entity1);
      expect(storedItems).toContain(entity2);
    });

    it('should store entities for different guilds separately', async () => {
      const guild1Id = '111111111111111111';
      const guild2Id = '222222222222222222';
      
      const entity1 = new IntelEntity(guild1Id, {
        id: 'test-1',
        timestamp: new Date().toISOString(),
        reporter: 'user1',
        content: {}
      });
      const entity2 = new IntelEntity(guild2Id, {
        id: 'test-2',
        timestamp: new Date().toISOString(), 
        reporter: 'user2',
        content: {}
      });

      await repository.store(entity1);
      await repository.store(entity2);

      expect(mockDbInstance.data[guild1Id][IntelEntity.storageKey]).toContain(entity1);
      expect(mockDbInstance.data[guild2Id][IntelEntity.storageKey]).toContain(entity2);
      expect(mockDbInstance.data[guild1Id][IntelEntity.storageKey]).not.toContain(entity2);
      expect(mockDbInstance.data[guild2Id][IntelEntity.storageKey]).not.toContain(entity1);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await repository.initialize({ databasePath: testDatabasePath });
    });

    it('should propagate database errors', async () => {
      const error = new Error('Database write failed');
      mockJSONFilePreset.mockRejectedValueOnce(error);

      const entity = new IntelEntity(testGuildId, {
        id: 'test-error',
        timestamp: new Date().toISOString(),
        reporter: 'user123',
        content: {}
      });

      await expect(repository.store(entity)).rejects.toThrow('Database write failed');
    });
  });

  describe('Repository Purge Methods', () => {
    beforeEach(async () => {
      await repository.initialize({ databasePath: testDatabasePath });
    });

    describe('getAll', () => {
      it('should return empty array when no items exist', async () => {
        const result = await repository.getAll(IntelEntity, testGuildId);
        expect(result).toEqual([]);
      });

      it('should return all items for a guild', async () => {
        const entity1 = new IntelEntity(testGuildId, {
          id: 'intel-1',
          timestamp: new Date().toISOString(),
          reporter: 'user1',
          content: { test: 'data1' }
        });
        const entity2 = new IntelEntity(testGuildId, {
          id: 'intel-2',
          timestamp: new Date().toISOString(),
          reporter: 'user2',
          content: { test: 'data2' }
        });

        await repository.store(entity1);
        await repository.store(entity2);

        const result = await repository.getAll(IntelEntity, testGuildId);
        expect(result).toHaveLength(2);
        expect(result).toContainEqual(entity1);
        expect(result).toContainEqual(entity2);
      });

      it('should return empty array for non-existent guild', async () => {
        const entity = new IntelEntity(testGuildId, {
          id: 'intel-1',
          timestamp: new Date().toISOString(),
          reporter: 'user1',
          content: {}
        });
        await repository.store(entity);

        const result = await repository.getAll(IntelEntity, 'different-guild-id');
        expect(result).toEqual([]);
      });

      it('should handle multiple entity types correctly', async () => {
        // Create a test entity type that's different from IntelEntity
        class TestEntity extends DatabaseEntity implements Purgeable {
          static readonly storageKey = 'test-entities';
          
          constructor(guildId: string, public timestamp: string, public data: string) {
            super(guildId);
          }
        }

        const intelEntity = new IntelEntity(testGuildId, {
          id: 'intel-1',
          timestamp: new Date().toISOString(),
          reporter: 'user1',
          content: {}
        });
        const testEntity = new TestEntity(testGuildId, new Date().toISOString(), 'test');

        await repository.store(intelEntity);
        await repository.store(testEntity);

        const intelResults = await repository.getAll(IntelEntity, testGuildId);
        const testResults = await repository.getAll(TestEntity, testGuildId);

        expect(intelResults).toHaveLength(1);
        expect(testResults).toHaveLength(1);
        expect(intelResults[0]).toEqual(intelEntity);
        expect(testResults[0]).toEqual(testEntity);
      });

      it('should throw error when entity has no storageKey', async () => {
        class NoStorageKeyEntity extends DatabaseEntity {
          constructor(guildId: string) {
            super(guildId);
          }
        }

        await expect(repository.getAll(NoStorageKeyEntity, testGuildId))
          .rejects.toThrow('Entity class must have a static storageKey property');
      });
    });

    describe('replaceAll', () => {
      it('should replace entire array with new items', async () => {
        // Store initial items
        const entity1 = new IntelEntity(testGuildId, {
          id: 'intel-1',
          timestamp: new Date().toISOString(),
          reporter: 'user1',
          content: {}
        });
        const entity2 = new IntelEntity(testGuildId, {
          id: 'intel-2',
          timestamp: new Date().toISOString(),
          reporter: 'user2',
          content: {}
        });
        await repository.store(entity1);
        await repository.store(entity2);

        // Replace with new items
        const newEntity1 = new IntelEntity(testGuildId, {
          id: 'new-intel-1',
          timestamp: new Date().toISOString(),
          reporter: 'user3',
          content: {}
        });
        const newEntity2 = new IntelEntity(testGuildId, {
          id: 'new-intel-2',
          timestamp: new Date().toISOString(),
          reporter: 'user4',
          content: {}
        });

        await repository.replaceAll(IntelEntity, testGuildId, [newEntity1, newEntity2]);

        const result = await repository.getAll(IntelEntity, testGuildId);
        expect(result).toHaveLength(2);
        expect(result).toContainEqual(newEntity1);
        expect(result).toContainEqual(newEntity2);
        expect(result).not.toContainEqual(entity1);
        expect(result).not.toContainEqual(entity2);
      });

      it('should handle empty arrays (clearing all items)', async () => {
        // Store initial items
        const entity = new IntelEntity(testGuildId, {
          id: 'intel-1',
          timestamp: new Date().toISOString(),
          reporter: 'user1',
          content: {}
        });
        await repository.store(entity);

        // Replace with empty array
        await repository.replaceAll(IntelEntity, testGuildId, []);

        const result = await repository.getAll(IntelEntity, testGuildId);
        expect(result).toEqual([]);
      });

      it('should maintain guild separation', async () => {
        const guild1Id = 'guild-1';
        const guild2Id = 'guild-2';

        // Store items in both guilds
        const guild1Entity = new IntelEntity(guild1Id, {
          id: 'intel-1',
          timestamp: new Date().toISOString(),
          reporter: 'user1',
          content: {}
        });
        const guild2Entity = new IntelEntity(guild2Id, {
          id: 'intel-2',
          timestamp: new Date().toISOString(),
          reporter: 'user2',
          content: {}
        });
        await repository.store(guild1Entity);
        await repository.store(guild2Entity);

        // Replace only guild1 items
        const newGuild1Entity = new IntelEntity(guild1Id, {
          id: 'new-intel-1',
          timestamp: new Date().toISOString(),
          reporter: 'user3',
          content: {}
        });
        await repository.replaceAll(IntelEntity, guild1Id, [newGuild1Entity]);

        const guild1Results = await repository.getAll(IntelEntity, guild1Id);
        const guild2Results = await repository.getAll(IntelEntity, guild2Id);

        expect(guild1Results).toHaveLength(1);
        expect(guild1Results[0]).toEqual(newGuild1Entity);
        expect(guild2Results).toHaveLength(1);
        expect(guild2Results[0]).toEqual(guild2Entity);
      });

      it('should create storage if it does not exist', async () => {
        const entity = new IntelEntity(testGuildId, {
          id: 'intel-1',
          timestamp: new Date().toISOString(),
          reporter: 'user1',
          content: {}
        });

        // Replace on empty storage should work
        await repository.replaceAll(IntelEntity, testGuildId, [entity]);

        const result = await repository.getAll(IntelEntity, testGuildId);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(entity);
      });
    });

    describe('purgeStaleItems', () => {
      it('should remove items older than 168 hours (default)', async () => {
        const now = new Date();
        const fresh = new Date(now.getTime() - 23 * 60 * 60 * 1000); // 23 hours ago
        const stale = new Date(now.getTime() - 180 * 60 * 60 * 1000); // 180 hours ago

        const freshEntity = new IntelEntity(testGuildId, {
          id: 'fresh-intel',
          timestamp: fresh.toISOString(),
          reporter: 'user1',
          content: {}
        });
        const staleEntity = new IntelEntity(testGuildId, {
          id: 'stale-intel',
          timestamp: stale.toISOString(),
          reporter: 'user2',
          content: {}
        });

        await repository.store(freshEntity);
        await repository.store(staleEntity);

        const purgedCount = await repository.purgeStaleItems(IntelEntity, testGuildId);

        expect(purgedCount).toBe(1);
        const remaining = await repository.getAll(IntelEntity, testGuildId);
        expect(remaining).toHaveLength(1);
        expect(remaining[0]).toEqual(freshEntity);
      });

      it('should respect custom maxAgeHours parameter', async () => {
        const now = new Date();
        const recent = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
        const old = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago

        const recentEntity = new IntelEntity(testGuildId, {
          id: 'recent-intel',
          timestamp: recent.toISOString(),
          reporter: 'user1',
          content: {}
        });
        const oldEntity = new IntelEntity(testGuildId, {
          id: 'old-intel',
          timestamp: old.toISOString(),
          reporter: 'user2',
          content: {}
        });

        await repository.store(recentEntity);
        await repository.store(oldEntity);

        // Purge items older than 2 hours
        const purgedCount = await repository.purgeStaleItems(IntelEntity, testGuildId, 2);

        expect(purgedCount).toBe(1);
        const remaining = await repository.getAll(IntelEntity, testGuildId);
        expect(remaining).toHaveLength(1);
        expect(remaining[0]).toEqual(recentEntity);
      });

      it('should return correct count of purged items', async () => {
        const now = new Date();
        const stale1 = new Date(now.getTime() - 180 * 60 * 60 * 1000);
        const stale2 = new Date(now.getTime() - 190 * 60 * 60 * 1000);
        const stale3 = new Date(now.getTime() - 200 * 60 * 60 * 1000);

        const entities = [
          new IntelEntity(testGuildId, {
            id: 'stale-1',
            timestamp: stale1.toISOString(),
            reporter: 'user1',
            content: {}
          }),
          new IntelEntity(testGuildId, {
            id: 'stale-2',
            timestamp: stale2.toISOString(),
            reporter: 'user2',
            content: {}
          }),
          new IntelEntity(testGuildId, {
            id: 'stale-3',
            timestamp: stale3.toISOString(),
            reporter: 'user3',
            content: {}
          })
        ];

        for (const entity of entities) {
          await repository.store(entity);
        }

        const purgedCount = await repository.purgeStaleItems(IntelEntity, testGuildId);

        expect(purgedCount).toBe(3);
        const remaining = await repository.getAll(IntelEntity, testGuildId);
        expect(remaining).toHaveLength(0);
      });

      it('should handle empty collections', async () => {
        const purgedCount = await repository.purgeStaleItems(IntelEntity, testGuildId);

        expect(purgedCount).toBe(0);
        const remaining = await repository.getAll(IntelEntity, testGuildId);
        expect(remaining).toHaveLength(0);
      });

      it('should handle all-fresh items (no purging)', async () => {
        const now = new Date();
        const fresh1 = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
        const fresh2 = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago

        const entities = [
          new IntelEntity(testGuildId, {
            id: 'fresh-1',
            timestamp: fresh1.toISOString(),
            reporter: 'user1',
            content: {}
          }),
          new IntelEntity(testGuildId, {
            id: 'fresh-2',
            timestamp: fresh2.toISOString(),
            reporter: 'user2',
            content: {}
          })
        ];

        for (const entity of entities) {
          await repository.store(entity);
        }

        const purgedCount = await repository.purgeStaleItems(IntelEntity, testGuildId);

        expect(purgedCount).toBe(0);
        const remaining = await repository.getAll(IntelEntity, testGuildId);
        expect(remaining).toHaveLength(2);
      });

      it('should handle mixed fresh and stale items', async () => {
        const now = new Date();
        const fresh = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago
        const stale1 = new Date(now.getTime() - 180 * 60 * 60 * 1000); // 180 hours ago
        const stale2 = new Date(now.getTime() - 200 * 60 * 60 * 1000); // 200 hours ago

        const freshEntity = new IntelEntity(testGuildId, {
          id: 'fresh-intel',
          timestamp: fresh.toISOString(),
          reporter: 'user1',
          content: {}
        });
        const staleEntity1 = new IntelEntity(testGuildId, {
          id: 'stale-intel-1',
          timestamp: stale1.toISOString(),
          reporter: 'user2',
          content: {}
        });
        const staleEntity2 = new IntelEntity(testGuildId, {
          id: 'stale-intel-2',
          timestamp: stale2.toISOString(),
          reporter: 'user3',
          content: {}
        });

        await repository.store(freshEntity);
        await repository.store(staleEntity1);
        await repository.store(staleEntity2);

        const purgedCount = await repository.purgeStaleItems(IntelEntity, testGuildId);

        expect(purgedCount).toBe(2);
        const remaining = await repository.getAll(IntelEntity, testGuildId);
        expect(remaining).toHaveLength(1);
        expect(remaining[0]).toEqual(freshEntity);
      });

      it('should return 0 when repository is not initialized', async () => {
        // Create a fresh repository instance that's not initialized
        const uninitializedRepo = new (repository.constructor as any)();
        
        const purgedCount = await uninitializedRepo.purgeStaleItems(IntelEntity, testGuildId);
        expect(purgedCount).toBe(0);
      });
    });
  });

  describe('deleteById', () => {
    beforeEach(async () => {
      mockJSONFilePreset.mockResolvedValue(mockDbInstance);
      await repository.initialize({ databasePath: testDatabasePath });
    });

    it('should delete an existing intel item by ID', async () => {
      const intelItem = {
        id: 'rift-1234567890-abc123',
        timestamp: new Date().toISOString(),
        reporter: 'user123',
        content: { type: 'Test Rift', systemName: 'Test System', near: 'P1L4' }
      };
      const entity = new IntelEntity(testGuildId, intelItem);

      // Store the item first
      mockDbInstance.data = {
        [testGuildId]: {
          [IntelEntity.storageKey]: [entity]
        }
      };

      const result = await repository.deleteById(IntelEntity, testGuildId, 'rift-1234567890-abc123');

      expect(result).toBe(true);
      expect(mockDbInstance.data[testGuildId][IntelEntity.storageKey]).toEqual([]);
      expect(mockWrite).toHaveBeenCalled();
    });

    it('should return false when item does not exist', async () => {
      mockDbInstance.data = {
        [testGuildId]: {
          [IntelEntity.storageKey]: []
        }
      };

      const result = await repository.deleteById(IntelEntity, testGuildId, 'nonexistent-id');

      expect(result).toBe(false);
      expect(mockWrite).not.toHaveBeenCalled();
    });

    it('should return false when repository is not initialized', async () => {
      const uninitializedRepo = new (repository.constructor as any)();
      
      const result = await uninitializedRepo.deleteById(IntelEntity, testGuildId, 'test-id');
      
      expect(result).toBe(false);
    });
  });
});
