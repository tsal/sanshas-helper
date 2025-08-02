import { isDatabaseEnabled, registerObject, resetDatabaseForTesting } from '../register';
import { DatabaseEntity } from '../types';

// Mock repository
jest.mock('../repository', () => ({
  repository: {
    isInitialized: jest.fn()
  }
}));

// Import after mock
const { repository } = require('../repository');

/**
 * Test entity class for registration testing
 */
class TestEntity extends DatabaseEntity {
  static override readonly storageKey = 'test-entities';

  constructor(
    guildId: string,
    public id: string,
    public testField: string
  ) {
    super(guildId);
  }
}

describe('Database Register Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetDatabaseForTesting();
  });

  describe('isDatabaseEnabled', () => {
    it('should return false when database path is null', () => {
      const result = isDatabaseEnabled(null);
      expect(result).toBe(false);
    });

    it('should return false when database path is provided but repository is not initialized', () => {
      (repository.isInitialized as jest.Mock).mockReturnValue(false);
      const result = isDatabaseEnabled('/test/path');
      expect(result).toBe(false);
    });

    it('should return true when database path is provided and repository is initialized', () => {
      (repository.isInitialized as jest.Mock).mockReturnValue(true);
      const result = isDatabaseEnabled('/test/path');
      expect(result).toBe(true);
    });
  });

  describe('registerObject', () => {
    it('should register an object type without throwing errors', () => {
      expect(() => registerObject(TestEntity)).not.toThrow();
    });

    it('should handle multiple registrations of the same type', () => {
      expect(() => {
        registerObject(TestEntity);
        registerObject(TestEntity);
      }).not.toThrow();
    });
  });

  describe('resetDatabaseForTesting', () => {
    it('should reset the registry for testing', () => {
      // Register an object type
      registerObject(TestEntity);
      
      // Reset should not throw
      expect(() => resetDatabaseForTesting()).not.toThrow();
    });
  });
});
