import { Role, isRole, parseRole, parseRoleFromJson } from '../types';

describe('Role', () => {
  describe('enum values', () => {
    it('should have Exploration role', () => {
      expect(Role.Exploration).toBe('Exploration');
    });

    it('should serialize to JSON correctly', () => {
      const role = Role.Exploration;
      const json = JSON.stringify(role);
      expect(json).toBe('"Exploration"');
    });

    it('should deserialize from JSON correctly', () => {
      const json = '"Exploration"';
      const role = JSON.parse(json);
      expect(role).toBe('Exploration');
      expect(isRole(role)).toBe(true);
    });
  });

  describe('isRole', () => {
    it('should return true for valid role strings', () => {
      expect(isRole('Exploration')).toBe(true);
    });

    it('should return false for invalid strings', () => {
      expect(isRole('InvalidRole')).toBe(false);
      expect(isRole('')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isRole(null)).toBe(false);
      expect(isRole(undefined)).toBe(false);
      expect(isRole(123)).toBe(false);
      expect(isRole({})).toBe(false);
      expect(isRole([])).toBe(false);
    });
  });

  describe('parseRole', () => {
    it('should parse valid role strings', () => {
      expect(parseRole('Exploration')).toBe(Role.Exploration);
    });

    it('should throw error for invalid role strings', () => {
      expect(() => parseRole('InvalidRole')).toThrow('Invalid role value: InvalidRole');
    });

    it('should include valid roles in error message', () => {
      expect(() => parseRole('Invalid')).toThrow('Valid roles are: Exploration');
    });
  });

  describe('parseRoleFromJson', () => {
    it('should parse role from valid JSON object', () => {
      const json = { role: 'Exploration' };
      expect(parseRoleFromJson(json)).toBe(Role.Exploration);
    });

    it('should throw error when role is not a string', () => {
      expect(() => parseRoleFromJson({ role: 123 })).toThrow('Role must be a string');
      expect(() => parseRoleFromJson({ role: null })).toThrow('Role must be a string');
      expect(() => parseRoleFromJson({ role: undefined })).toThrow('Role must be a string');
    });

    it('should throw error for invalid role strings in JSON', () => {
      expect(() => parseRoleFromJson({ role: 'InvalidRole' })).toThrow('Invalid role value: InvalidRole');
    });
  });
});
