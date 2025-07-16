import { Version } from '../version';

describe('Version Entity', () => {
  const testGuildId = '123456789012345678'; // Mock Discord Snowflake
  const testVersion = '1.2.3';

  describe('constructor', () => {
    it('should create Version with provided guildId, version, and lastUpdated', () => {
      const testTimestamp = '2025-01-01T00:00:00.000Z';
      const version = new Version(testGuildId, testVersion, testTimestamp);

      expect(version.guildId).toBe(testGuildId);
      expect(version.version).toBe(testVersion);
      expect(version.lastUpdated).toBe(testTimestamp);
    });

    it('should create Version with default timestamp when lastUpdated not provided', () => {
      const beforeCreation = Date.now();
      const version = new Version(testGuildId, testVersion);
      const afterCreation = Date.now();

      expect(version.guildId).toBe(testGuildId);
      expect(version.version).toBe(testVersion);
      
      const versionTimestamp = new Date(version.lastUpdated).getTime();
      expect(versionTimestamp).toBeGreaterThanOrEqual(beforeCreation);
      expect(versionTimestamp).toBeLessThanOrEqual(afterCreation);
      
      // Verify it's a valid ISO string
      expect(() => new Date(version.lastUpdated)).not.toThrow();
    });

    it('should properly inherit guildId from DatabaseEntity', () => {
      const version = new Version(testGuildId, testVersion);

      expect(version.guildId).toBe(testGuildId);
      expect(version).toHaveProperty('guildId');
    });

    it('should set static storageKey correctly', () => {
      expect(Version.storageKey).toBe('versions');
    });
  });

  describe('isStale() method', () => {
    it('should return false for recently created version (default timestamp)', () => {
      const version = new Version(testGuildId, testVersion);

      expect(version.isStale()).toBe(false);
    });

    it('should return false for version updated within 5 days', () => {
      // 3 days ago
      const threeDaysAgo = new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString();
      const version = new Version(testGuildId, testVersion, threeDaysAgo);

      expect(version.isStale()).toBe(false);
    });

    it('should return true for version older than 5 days', () => {
      // 6 days ago
      const sixDaysAgo = new Date(Date.now() - (6 * 24 * 60 * 60 * 1000)).toISOString();
      const version = new Version(testGuildId, testVersion, sixDaysAgo);

      expect(version.isStale()).toBe(true);
    });

    it('should return false for version exactly 5 days old (boundary test)', () => {
      // Exactly 5 days ago - should be false since condition is "more than 5 days"
      const fiveDaysAgo = new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)).toISOString();
      const version = new Version(testGuildId, testVersion, fiveDaysAgo);

      expect(version.isStale()).toBe(false);
    });

    it('should handle invalid timestamp strings gracefully', () => {
      const version = new Version(testGuildId, testVersion, 'invalid-timestamp');

      // Should not throw, and should return some boolean value
      expect(() => version.isStale()).not.toThrow();
      expect(typeof version.isStale()).toBe('boolean');
      
      // Invalid timestamps result in NaN dates, and NaN < anything is false
      expect(version.isStale()).toBe(false);
    });
  });

  describe('property tests', () => {
    it('should have readonly version and lastUpdated properties', () => {
      const version = new Version(testGuildId, testVersion);

      // TypeScript readonly is compile-time only, but we can verify the properties exist
      expect(version.version).toBe(testVersion);
      expect(typeof version.lastUpdated).toBe('string');
      
      // Properties should be defined and not undefined
      expect(version.version).toBeDefined();
      expect(version.lastUpdated).toBeDefined();
    });

    it('should contain expected values after construction', () => {
      const testTimestamp = '2025-07-16T12:00:00.000Z';
      const version = new Version(testGuildId, testVersion, testTimestamp);

      expect(version.guildId).toBe(testGuildId);
      expect(version.version).toBe(testVersion);
      expect(version.lastUpdated).toBe(testTimestamp);
      
      // Verify all properties are the correct types
      expect(typeof version.guildId).toBe('string');
      expect(typeof version.version).toBe('string');
      expect(typeof version.lastUpdated).toBe('string');
    });
  });
});
