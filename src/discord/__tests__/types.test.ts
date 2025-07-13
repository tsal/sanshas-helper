import { createRoleOptions, RoleConfig } from '../types';

describe('Discord Types', () => {
  describe('createRoleOptions', () => {
    it('should create role options with only required name field', () => {
      const config: RoleConfig = {
        name: 'Test Role'
      };

      const result = createRoleOptions(config);

      expect(result).toEqual({
        name: 'Test Role'
      });
    });

    it('should create role options with all fields defined', () => {
      const config: RoleConfig = {
        name: 'Complete Role',
        color: 0xFF0000,
        reason: 'Test reason',
        permissions: BigInt(8), // Administrator permission
        hoist: true,
        mentionable: false
      };

      const result = createRoleOptions(config);

      expect(result).toEqual({
        name: 'Complete Role',
        color: 0xFF0000,
        reason: 'Test reason',
        permissions: BigInt(8),
        hoist: true,
        mentionable: false
      });
    });

    it('should exclude undefined optional fields', () => {
      const config: RoleConfig = {
        name: 'Partial Role',
        color: 0x00FF00,
        hoist: false
      };

      const result = createRoleOptions(config);

      expect(result).toEqual({
        name: 'Partial Role',
        color: 0x00FF00,
        hoist: false
      });
      expect(result).not.toHaveProperty('reason');
      expect(result).not.toHaveProperty('permissions');
      expect(result).not.toHaveProperty('mentionable');
    });

    it('should handle permissions as BigInt array', () => {
      const config: RoleConfig = {
        name: 'Permission Role',
        permissions: [BigInt(8), BigInt(16)] // Administrator and ManageChannels
      };

      const result = createRoleOptions(config);

      expect(result).toEqual({
        name: 'Permission Role',
        permissions: [BigInt(8), BigInt(16)]
      });
    });

    it('should handle zero values correctly', () => {
      const config: RoleConfig = {
        name: 'Zero Role',
        color: 0, // Black color
        permissions: BigInt(0), // No permissions
        hoist: false,
        mentionable: false
      };

      const result = createRoleOptions(config);

      expect(result).toEqual({
        name: 'Zero Role',
        color: 0,
        permissions: BigInt(0),
        hoist: false,
        mentionable: false
      });
    });
  });
});
