import { Role, Collection } from 'discord.js';
import { findRoleByName, createRole, checkManagementRole } from '../management';
import { RoleConfig } from '../types';

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
    it('should return existing management role with detailed logging', async () => {
      // Setup
      const managementRole = { 
        ...mockRole, 
        name: 'Sansha\'s Helper',
        id: 'mgmt123',
        position: 5,
        color: 0x8B0000,
        permissions: { bitfield: BigInt(8) }
      };
      mockRoleCollection.set('mgmt123', managementRole);
      mockRoleManager.fetch.mockResolvedValue(mockRoleCollection);

      // Execute
      const result = await checkManagementRole(mockGuild);

      // Assert
      expect(result).toBe(managementRole);
      expect(mockRoleManager.create).not.toHaveBeenCalled();
    });

    it('should throw error when management role does not exist', async () => {
      // Setup
      mockRoleManager.fetch.mockResolvedValue(mockRoleCollection);

      // Execute & Assert
      await expect(checkManagementRole(mockGuild)).rejects.toThrow(
        'Management role "Sansha\'s Helper" not found. Bot may not have been properly invited with required permissions.'
      );
      expect(mockRoleManager.create).not.toHaveBeenCalled();
    });

    it('should handle fetch errors during role check', async () => {
      // Setup
      mockRoleManager.fetch.mockRejectedValue(new Error('Fetch failed'));

      // Execute & Assert
      await expect(checkManagementRole(mockGuild)).rejects.toThrow('Management role check failed: Fetch failed');
    });

    it('should handle unknown errors gracefully', async () => {
      // Setup
      mockRoleManager.fetch.mockRejectedValue('Unknown error');

      // Execute & Assert
      await expect(checkManagementRole(mockGuild)).rejects.toThrow('Management role check failed: Unknown error');
    });
  });
});
