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
        type: 'Unstable Wormhole',
        systemName: 'Jita',
        near: 'P1L4'
      };

      expect(riftIntel.type).toBe('Unstable Wormhole');
      expect(riftIntel.systemName).toBe('Jita');
      expect(riftIntel.near).toBe('P1L4');
    });

    it('should work with different lagrange point formats', () => {
      const riftIntel: RiftIntelItem = {
        type: 'Quantum Anomaly',
        systemName: 'Amarr',
        near: 'P1M2'
      };

      expect(riftIntel.near).toBe('P1M2');
    });
  });

  describe('IntelItem interface', () => {
    const validIntelItem: IntelItem = {
      id: 'intel-123',
      timestamp: '2025-08-02T10:30:00.000Z',
      reporter: '123456789012345678',
      content: {
        type: 'Enemy Fleet Spotted',
        systemName: 'Jita',
        near: 'P1L4'
      } as RiftIntelItem,
      location: 'Jita'
    };

    it('should create a valid intel item with rift content', () => {
      expect(validIntelItem.id).toBe('intel-123');
      expect(validIntelItem.timestamp).toBe('2025-08-02T10:30:00.000Z');
      expect(validIntelItem.reporter).toBe('123456789012345678');
      expect((validIntelItem.content as RiftIntelItem).type).toBe('Enemy Fleet Spotted');
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
        type: 'Enemy Fleet',
        systemName: 'Jita',
        near: 'P1L4'
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
        type: 'Test Rift',
        systemName: 'Test System',
        near: 'P1L1'
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
        type: 'Storage Test Rift',
        systemName: 'Storage System',
        near: 'P2L3'
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

  describe('IntelEntity Database Integration', () => {
    const testGuildId = '123456789012345678';
    const testDatabasePath = '/tmp/intel-test.json';

    // Import the real repository for integration testing
    let realRepository: any;
    
    beforeAll(async () => {
      // Import the real repository (not mocked)
      jest.unmock('../../database/repository');
      const { repository } = await import('../../database/repository');
      realRepository = repository;
    });

    beforeEach(async () => {
      // Reset repository state
      (realRepository as any).config = null;
      (realRepository as any).initialized = false;
      (realRepository as any).dbInstance = null;
      
      // Initialize for testing
      await realRepository.initialize({ databasePath: testDatabasePath });
    });

    afterAll(() => {
      // Re-mock for other tests
      jest.mock('../../database/repository', () => ({
        repository: {
          store: jest.fn()
        }
      }));
    });

    describe('IntelEntity Storage Key', () => {
      it('should have correct static storageKey', () => {
        expect(IntelEntity.storageKey).toBe('intel-items');
        expect(typeof IntelEntity.storageKey).toBe('string');
        expect(IntelEntity.storageKey.length).toBeGreaterThan(0);
      });
    });

    describe('Purgeable Interface Implementation', () => {
      it('should implement Purgeable with timestamp getter', () => {
        const intelItem: IntelItem = {
          id: 'timestamp-test',
          timestamp: '2025-08-02T14:00:00.000Z',
          reporter: 'user123',
          content: {}
        };
        
        const entity = new IntelEntity(testGuildId, intelItem);
        
        expect(entity.timestamp).toBe('2025-08-02T14:00:00.000Z');
        expect(entity.timestamp).toBe(intelItem.timestamp);
      });

      it('should return timestamp from internal intelItem', () => {
        const timestamp1 = '2025-08-02T10:00:00.000Z';
        const timestamp2 = '2025-08-02T15:00:00.000Z';
        
        const item1: IntelItem = {
          id: 'item1',
          timestamp: timestamp1,
          reporter: 'user1',
          content: {}
        };
        
        const item2: IntelItem = {
          id: 'item2', 
          timestamp: timestamp2,
          reporter: 'user2',
          content: {}
        };
        
        const entity1 = new IntelEntity(testGuildId, item1);
        const entity2 = new IntelEntity(testGuildId, item2);
        
        expect(entity1.timestamp).toBe(timestamp1);
        expect(entity2.timestamp).toBe(timestamp2);
      });
    });

    describe('Repository Integration', () => {
      it('should store and retrieve through repository', async () => {
        const intelItem: IntelItem = {
          id: 'repo-test-1',
          timestamp: new Date().toISOString(),
          reporter: 'user123',
          content: {
            type: 'Test Rift',
            systemName: 'TestSystem',
            near: 'P1L1'
          } as RiftIntelItem
        };
        
        const entity = new IntelEntity(testGuildId, intelItem);
        
        // Store the entity
        await realRepository.store(entity);
        
        // Retrieve and verify
        const retrieved = await realRepository.getAll(IntelEntity, testGuildId);
        expect(retrieved).toHaveLength(1);
        expect(retrieved[0].guildId).toBe(testGuildId);
        expect(retrieved[0].intelItem.id).toBe(intelItem.id);
        expect(retrieved[0].intelItem.timestamp).toBe(intelItem.timestamp);
        expect(retrieved[0].intelItem.reporter).toBe(intelItem.reporter);
      });

      it('should maintain data integrity through store/retrieve cycles', async () => {
        const originalItem: IntelItem = {
          id: 'integrity-test',
          timestamp: '2025-08-02T16:30:00.000Z',
          reporter: 'integrity-user',
          content: {
            type: 'Complex Rift Data',
            systemName: 'Complex System',
            near: 'P3L5'
          } as RiftIntelItem,
          location: 'Complex Location with Special Characters: àáâãäå'
        };
        
        const entity = new IntelEntity(testGuildId, originalItem);
        
        // Store
        await realRepository.store(entity);
        
        // Retrieve
        const retrieved = await realRepository.getAll(IntelEntity, testGuildId);
        const retrievedItem = retrieved[0].intelItem;
        
        // Verify all fields maintained
        expect(retrievedItem.id).toBe(originalItem.id);
        expect(retrievedItem.timestamp).toBe(originalItem.timestamp);
        expect(retrievedItem.reporter).toBe(originalItem.reporter);
        expect(retrievedItem.location).toBe(originalItem.location);
        expect((retrievedItem.content as RiftIntelItem).type).toBe('Complex Rift Data');
        expect((retrievedItem.content as RiftIntelItem).systemName).toBe('Complex System');
        expect((retrievedItem.content as RiftIntelItem).near).toBe('P3L5');
      });

      it('should handle multiple intel items in same guild', async () => {
        const items: IntelItem[] = [
          {
            id: 'multi-1',
            timestamp: '2025-08-02T17:00:00.000Z',
            reporter: 'user1',
            content: { type: 'Rift 1', systemName: 'Sys1', near: 'P1L1' } as RiftIntelItem
          },
          {
            id: 'multi-2', 
            timestamp: '2025-08-02T17:15:00.000Z',
            reporter: 'user2',
            content: { type: 'Rift 2', systemName: 'Sys2', near: 'P1L2' } as RiftIntelItem
          },
          {
            id: 'multi-3',
            timestamp: '2025-08-02T17:30:00.000Z',
            reporter: 'user3',
            content: {}
          }
        ];
        
        // Store all items
        for (const item of items) {
          const entity = new IntelEntity(testGuildId, item);
          await realRepository.store(entity);
        }
        
        // Retrieve and verify
        const retrieved = await realRepository.getAll(IntelEntity, testGuildId);
        expect(retrieved).toHaveLength(3);
        
        const retrievedIds = retrieved.map((e: any) => e.intelItem.id);
        expect(retrievedIds).toContain('multi-1');
        expect(retrievedIds).toContain('multi-2');
        expect(retrievedIds).toContain('multi-3');
      });

      it('should separate data by guild correctly', async () => {
        const guild1Id = 'guild-111';
        const guild2Id = 'guild-222';
        
        const guild1Item: IntelItem = {
          id: 'guild1-item',
          timestamp: new Date().toISOString(),
          reporter: 'user1',
          content: {}
        };
        
        const guild2Item: IntelItem = {
          id: 'guild2-item',
          timestamp: new Date().toISOString(),
          reporter: 'user2',
          content: {}
        };
        
        // Store in different guilds
        await realRepository.store(new IntelEntity(guild1Id, guild1Item));
        await realRepository.store(new IntelEntity(guild2Id, guild2Item));
        
        // Retrieve separately
        const guild1Results = await realRepository.getAll(IntelEntity, guild1Id);
        const guild2Results = await realRepository.getAll(IntelEntity, guild2Id);
        
        expect(guild1Results).toHaveLength(1);
        expect(guild2Results).toHaveLength(1);
        expect(guild1Results[0].intelItem.id).toBe('guild1-item');
        expect(guild2Results[0].intelItem.id).toBe('guild2-item');
      });
    });

    describe('Purge Functionality Integration', () => {
      it('should participate in purge operations based on timestamp', async () => {
        const now = new Date();
        const fresh = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago
        const stale = new Date(now.getTime() - 36 * 60 * 60 * 1000); // 36 hours ago
        
        const freshItem: IntelItem = {
          id: 'fresh-intel',
          timestamp: fresh.toISOString(),
          reporter: 'user1',
          content: { type: 'Fresh Rift', systemName: 'FreshSys', near: 'P1L1' } as RiftIntelItem
        };
        
        const staleItem: IntelItem = {
          id: 'stale-intel',
          timestamp: stale.toISOString(),
          reporter: 'user2',
          content: { type: 'Stale Rift', systemName: 'StaleSys', near: 'P1L2' } as RiftIntelItem
        };
        
        // Store both items
        await realRepository.store(new IntelEntity(testGuildId, freshItem));
        await realRepository.store(new IntelEntity(testGuildId, staleItem));
        
        // Verify both are stored
        const allItems = await realRepository.getAll(IntelEntity, testGuildId);
        expect(allItems).toHaveLength(2);
        
        // Purge stale items (default 24 hours)
        const purgedCount = await realRepository.purgeStaleItems(IntelEntity, testGuildId);
        
        expect(purgedCount).toBe(1);
        
        // Verify only fresh item remains
        const remainingItems = await realRepository.getAll(IntelEntity, testGuildId);
        expect(remainingItems).toHaveLength(1);
        expect(remainingItems[0].intelItem.id).toBe('fresh-intel');
      });

      it('should handle custom purge age correctly', async () => {
        const now = new Date();
        const recent = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
        const old = new Date(now.getTime() - 90 * 60 * 1000); // 90 minutes ago
        
        const recentItem: IntelItem = {
          id: 'recent-intel',
          timestamp: recent.toISOString(),
          reporter: 'user1',
          content: {}
        };
        
        const oldItem: IntelItem = {
          id: 'old-intel',
          timestamp: old.toISOString(),
          reporter: 'user2',
          content: {}
        };
        
        // Store both items
        await realRepository.store(new IntelEntity(testGuildId, recentItem));
        await realRepository.store(new IntelEntity(testGuildId, oldItem));
        
        // Purge items older than 1 hour
        const purgedCount = await realRepository.purgeStaleItems(IntelEntity, testGuildId, 1);
        
        expect(purgedCount).toBe(1);
        
        // Verify only recent item remains
        const remainingItems = await realRepository.getAll(IntelEntity, testGuildId);
        expect(remainingItems).toHaveLength(1);
        expect(remainingItems[0].intelItem.id).toBe('recent-intel');
      });

      it('should preserve fresh intel during purge operations', async () => {
        const now = new Date();
        const fresh1 = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago
        const fresh2 = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago
        const fresh3 = new Date(now.getTime() - 18 * 60 * 60 * 1000); // 18 hours ago
        
        const items: IntelItem[] = [
          {
            id: 'fresh-1',
            timestamp: fresh1.toISOString(),
            reporter: 'user1',
            content: { type: 'Fresh Rift 1', systemName: 'Sys1', near: 'P1L1' } as RiftIntelItem
          },
          {
            id: 'fresh-2',
            timestamp: fresh2.toISOString(),
            reporter: 'user2',
            content: { type: 'Fresh Rift 2', systemName: 'Sys2', near: 'P1L2' } as RiftIntelItem
          },
          {
            id: 'fresh-3',
            timestamp: fresh3.toISOString(),
            reporter: 'user3',
            content: { type: 'Fresh Rift 3', systemName: 'Sys3', near: 'P1L3' } as RiftIntelItem
          }
        ];
        
        // Store all fresh items
        for (const item of items) {
          await realRepository.store(new IntelEntity(testGuildId, item));
        }
        
        // Purge (should remove nothing since all are fresh)
        const purgedCount = await realRepository.purgeStaleItems(IntelEntity, testGuildId);
        
        expect(purgedCount).toBe(0);
        
        // Verify all items remain
        const remainingItems = await realRepository.getAll(IntelEntity, testGuildId);
        expect(remainingItems).toHaveLength(3);
        
        const remainingIds = remainingItems.map((e: any) => e.intelItem.id);
        expect(remainingIds).toContain('fresh-1');
        expect(remainingIds).toContain('fresh-2');
        expect(remainingIds).toContain('fresh-3');
      });
    });

    describe('JSON Serialization Compatibility', () => {
      it('should be JSON serializable and deserializable without data loss', async () => {
        const complexItem: IntelItem = {
          id: 'json-test-complex',
          timestamp: '2025-08-02T20:45:30.123Z',
          reporter: 'json-test-user',
          content: {
            type: 'Complex Rift with Unicode: 测试 αβγ 🚀',
            systemName: 'System-With-Dashes_And_Underscores',
            near: 'P99L88'
          } as RiftIntelItem,
          location: 'Location with "quotes" and \'apostrophes\' and newlines\nand tabs\t'
        };
        
        const entity = new IntelEntity(testGuildId, complexItem);
        
        // Store (involves JSON serialization)
        await realRepository.store(entity);
        
        // Retrieve (involves JSON deserialization) 
        const retrieved = await realRepository.getAll(IntelEntity, testGuildId);
        const retrievedItem = retrieved[0].intelItem;
        
        // Verify complex data survived JSON round-trip
        expect(retrievedItem.id).toBe(complexItem.id);
        expect(retrievedItem.timestamp).toBe(complexItem.timestamp);
        expect(retrievedItem.reporter).toBe(complexItem.reporter);
        expect(retrievedItem.location).toBe(complexItem.location);
        
        const retrievedContent = retrievedItem.content as RiftIntelItem;
        const originalContent = complexItem.content as RiftIntelItem;
        expect(retrievedContent.type).toBe(originalContent.type);
        expect(retrievedContent.systemName).toBe(originalContent.systemName);
        expect(retrievedContent.near).toBe(originalContent.near);
      });

      it('should handle edge case data correctly', async () => {
        const edgeCaseItem: IntelItem = {
          id: '',  // Empty string edge case
          timestamp: '2025-08-02T00:00:00.000Z',  // Midnight edge case
          reporter: '0',  // Minimal valid user ID
          content: {} // Empty content
          // location is omitted (undefined)
        };
        
        const entity = new IntelEntity(testGuildId, edgeCaseItem);
        
        // Store and retrieve
        await realRepository.store(entity);
        const retrieved = await realRepository.getAll(IntelEntity, testGuildId);
        const retrievedItem = retrieved[0].intelItem;
        
        // Verify edge cases preserved
        expect(retrievedItem.id).toBe('');
        expect(retrievedItem.timestamp).toBe('2025-08-02T00:00:00.000Z');
        expect(retrievedItem.reporter).toBe('0');
        expect(retrievedItem.content).toEqual({});
        expect(retrievedItem.location).toBeUndefined();
      });
    });
  });
});
