import { generateRandomString, generateIntelId, parseIntelId, isValidIntelId, getTypeFromIntelId } from '../id-utils';

describe('id-utils', () => {
  describe('generateRandomString', () => {
    it('should generate a string of default length 9', () => {
      const result = generateRandomString();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(9);
    });

    it('should generate a string of specified length', () => {
      const result = generateRandomString(5);
      expect(result.length).toBe(5);
    });

    it('should generate different strings on multiple calls', () => {
      const result1 = generateRandomString();
      const result2 = generateRandomString();
      expect(result1).not.toBe(result2);
    });
  });

  describe('generateIntelId', () => {
    it('should generate ID with correct format', () => {
      const result = generateIntelId('rift');
      expect(result).toMatch(/^rift-[a-z0-9]{9}$/);
    });

    it('should generate different IDs for same type', () => {
      const result1 = generateIntelId('ore');
      const result2 = generateIntelId('ore');
      expect(result1).not.toBe(result2);
      expect(result1).toMatch(/^ore-/);
      expect(result2).toMatch(/^ore-/);
    });
  });

  describe('parseIntelId', () => {
    it('should parse valid ID correctly', () => {
      const result = parseIntelId('rift-abc123def');
      expect(result).toEqual({
        type: 'rift',
        identifier: 'abc123def'
      });
    });

    it('should parse different types correctly', () => {
      const oreResult = parseIntelId('ore-xyz789');
      expect(oreResult).toEqual({
        type: 'ore',
        identifier: 'xyz789'
      });

      const fleetResult = parseIntelId('fleet-test123');
      expect(fleetResult).toEqual({
        type: 'fleet',
        identifier: 'test123'
      });
    });

    it('should return null for invalid formats', () => {
      expect(parseIntelId('invalidid')).toBeNull();
      expect(parseIntelId('-startwithdash')).toBeNull();
      expect(parseIntelId('endwithdash-')).toBeNull();
      expect(parseIntelId('')).toBeNull();
      expect(parseIntelId('   ')).toBeNull();
    });

    it('should return null for non-string input', () => {
      expect(parseIntelId(null as any)).toBeNull();
      expect(parseIntelId(undefined as any)).toBeNull();
      expect(parseIntelId(123 as any)).toBeNull();
    });

    it('should handle multiple dashes correctly', () => {
      const result = parseIntelId('complex-type-with-dashes');
      expect(result).toEqual({
        type: 'complex',
        identifier: 'type-with-dashes'
      });
    });
  });

  describe('isValidIntelId', () => {
    it('should return true for valid IDs', () => {
      expect(isValidIntelId('rift-abc123')).toBe(true);
      expect(isValidIntelId('ore-xyz789def')).toBe(true);
      expect(isValidIntelId('fleet-test')).toBe(true);
      expect(isValidIntelId('site-complex-id-with-dashes')).toBe(true);
    });

    it('should return false for invalid IDs', () => {
      expect(isValidIntelId('invalidid')).toBe(false);
      expect(isValidIntelId('-startwithdash')).toBe(false);
      expect(isValidIntelId('endwithdash-')).toBe(false);
      expect(isValidIntelId('')).toBe(false);
      expect(isValidIntelId('   ')).toBe(false);
    });
  });

  describe('getTypeFromIntelId', () => {
    it('should extract type from valid IDs', () => {
      expect(getTypeFromIntelId('rift-abc123')).toBe('rift');
      expect(getTypeFromIntelId('ore-xyz789def')).toBe('ore');
      expect(getTypeFromIntelId('fleet-test')).toBe('fleet');
      expect(getTypeFromIntelId('site-complex-id')).toBe('site');
    });

    it('should return null for invalid IDs', () => {
      expect(getTypeFromIntelId('invalidid')).toBeNull();
      expect(getTypeFromIntelId('-startwithdash')).toBeNull();
      expect(getTypeFromIntelId('endwithdash-')).toBeNull();
      expect(getTypeFromIntelId('')).toBeNull();
    });

    it('should handle complex types with multiple parts', () => {
      expect(getTypeFromIntelId('complex-type-identifier')).toBe('complex');
    });
  });
});
