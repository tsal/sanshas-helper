import { Role, Collection } from 'discord.js';
import { findRoleByName, createRole, checkManagementRole } from '../management';
import { RoleConfig } from '../types';

// Mock console methods to avoid noise in tests
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
};

describe('Discord Management', () => {
  let mockGuild: any;
  let mockRoleManager: any;
  let mockRole: any;
  let mockRoleCollection: Collection<string, Role>;

  beforeEach(() => {
    // Create mock role
    mockRole = {
      id: '123456789',
      name: 'Test Role',
    };

    // Create mock role collection
    mockRoleCollection = new Collection();

    // Create mock role manager
    mockRoleManager = {
      fetch: jest.fn(),
      create: jest.fn(),
      cache: mockRoleCollection,
    };

    // Create mock guild
    mockGuild = {
      id: '987654321',
      name: 'Test Guild',
      roles: mockRoleManager,
    };

    // Reset all mocks
    jest.clearAllMocks();
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
  });

  afterAll(() => {
    // Restore console methods
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('findRoleByName', () => {
    it('should find an existing role by name', async () => {
      // Setup
      mockRoleCollection.set('123', mockRole);
      mockRoleManager.fetch.mockResolvedValue(mockRoleCollection);

      // Execute
      const result = await findRoleByName(mockGuild, 'Test Role');

      // Assert
      expect(mockRoleManager.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockRole);
    });

    it('should return undefined when role does not exist', async () => {
      // Setup
      mockRoleManager.fetch.mockResolvedValue(mockRoleCollection);

      // Execute
      const result = await findRoleByName(mockGuild, 'Nonexistent Role');

      // Assert
      expect(mockRoleManager.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle fetch errors gracefully', async () => {
      // Setup
      mockRoleManager.fetch.mockRejectedValue(new Error('Fetch failed'));

      // Execute & Assert
      await expect(findRoleByName(mockGuild, 'Test Role')).rejects.toThrow('Fetch failed');
    });
  });

  describe('createRole', () => {
    const mockConfig: RoleConfig = {
      name: 'New Role',
      color: 0xFF0000,
      reason: 'Test creation'
    };

    it('should successfully create a role', async () => {
      // Setup
      mockRoleManager.create.mockResolvedValue(mockRole);

      // Execute
      const result = await createRole(mockGuild, mockConfig);

      // Assert
      expect(mockRoleManager.create).toHaveBeenCalledWith({
        name: 'New Role',
        color: 0xFF0000,
        reason: 'Test creation'
      });
      expect(result).toBe(mockRole);
    });

    it('should handle role creation failure', async () => {
      // Setup
      const createError = new Error('Permission denied');
      mockRoleManager.create.mockRejectedValue(createError);

      // Execute & Assert
      await expect(createRole(mockGuild, mockConfig)).rejects.toThrow('Role creation failed: Permission denied');
    });

    it('should handle unknown errors', async () => {
      // Setup
      mockRoleManager.create.mockRejectedValue('Unknown error');

      // Execute & Assert
      await expect(createRole(mockGuild, mockConfig)).rejects.toThrow('Role creation failed: Unknown error');
    });
  });

  describe('checkManagementRole', () => {
    it('should return existing management role', async () => {
      // Setup
      const managementRole = { ...mockRole, name: 'Sansha\'s Helper' };
      mockRoleCollection.set('mgmt123', managementRole);
      mockRoleManager.fetch.mockResolvedValue(mockRoleCollection);

      // Execute
      const result = await checkManagementRole(mockGuild);

      // Assert
      expect(result).toBe(managementRole);
      expect(mockRoleManager.create).not.toHaveBeenCalled();
    });

    it('should create management role when it does not exist', async () => {
      // Setup
      mockRoleManager.fetch.mockResolvedValue(mockRoleCollection);
      mockRoleManager.create.mockResolvedValue(mockRole);

      // Execute
      const result = await checkManagementRole(mockGuild);

      // Assert
      expect(mockRoleManager.create).toHaveBeenCalledWith({
        name: 'Sansha\'s Helper',
        color: 0x8B0000,
        reason: 'Bot management role for role assignment functionality',
        permissions: [],
        hoist: false,
        mentionable: false
      });
      expect(result).toBe(mockRole);
    });

    it('should create management role using default config instead of inline config', async () => {
      // This test ensures we can refactor to use DEFAULT_ROLE_CONFIGS later
      // Setup
      mockRoleManager.fetch.mockResolvedValue(mockRoleCollection);
      mockRoleManager.create.mockResolvedValue(mockRole);

      // Execute
      const result = await checkManagementRole(mockGuild);

      // Assert
      expect(mockRoleManager.create).toHaveBeenCalledTimes(1);
      const createCall = mockRoleManager.create.mock.calls[0][0];
      expect(createCall.name).toBe('Sansha\'s Helper');
      expect(createCall.color).toBe(0x8B0000);
      expect(result).toBe(mockRole);
    });

    it('should handle management role creation failure', async () => {
      // Setup
      mockRoleManager.fetch.mockResolvedValue(mockRoleCollection);
      mockRoleManager.create.mockRejectedValue(new Error('Creation failed'));

      // Execute & Assert
      await expect(checkManagementRole(mockGuild)).rejects.toThrow('Management role setup failed: Role creation failed: Creation failed');
    });
  });
});
