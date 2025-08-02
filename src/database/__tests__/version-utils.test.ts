import { getBotVersion, shouldRegisterCommands } from '../version-utils';
import { Version } from '../entities/version';
import { readFileSync } from 'fs';

// Mock the fs module
jest.mock('fs');
const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;

describe('getBotVersion', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should return the version from package.json when valid', () => {
    const mockPackageJson = JSON.stringify({
      name: 'test-bot',
      version: '1.2.3'
    });
    
    mockReadFileSync.mockReturnValue(mockPackageJson);
    
    const version = getBotVersion();
    
    expect(version).toBe('1.2.3');
    expect(mockReadFileSync).toHaveBeenCalledWith(
      expect.stringContaining('package.json'),
      'utf-8'
    );
  });

  it('should return "0.0.4" when package.json has no version field', () => {
    const mockPackageJson = JSON.stringify({
      name: 'test-bot'
      // no version field
    });
    
    mockReadFileSync.mockReturnValue(mockPackageJson);
    
    const version = getBotVersion();
    
    expect(version).toBe('0.0.4');
  });

  it('should return "0.0.4" when package.json version is not a string', () => {
    const mockPackageJson = JSON.stringify({
      name: 'test-bot',
      version: 123 // number instead of string
    });
    
    mockReadFileSync.mockReturnValue(mockPackageJson);
    
    const version = getBotVersion();
    
    expect(version).toBe('0.0.4');
  });

  it('should return "0.0.4" when file cannot be read', () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('File not found');
    });
    
    const version = getBotVersion();
    
    expect(version).toBe('0.0.4');
  });

  it('should return "0.0.4" when JSON is invalid', () => {
    mockReadFileSync.mockReturnValue('invalid json content');
    
    const version = getBotVersion();
    
    expect(version).toBe('0.0.4');
  });
});

describe('shouldRegisterCommands', () => {
  const testGuildId = '123456789012345678';
  const currentVersion = '1.2.3';

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('first run scenarios', () => {
    it('should return true when no stored version exists (null)', () => {
      const result = shouldRegisterCommands(null, currentVersion);

      expect(result).toBe(true);
    });
  });

  describe('version change scenarios', () => {
    it('should return true when stored version differs from current version', () => {
      const storedVersion = new Version(testGuildId, '1.0.0');
      const result = shouldRegisterCommands(storedVersion, '1.2.3');

      expect(result).toBe(true);
    });

    it('should return true when stored version is older than current version', () => {
      const storedVersion = new Version(testGuildId, '1.0.0');
      const result = shouldRegisterCommands(storedVersion, '2.0.0');

      expect(result).toBe(true);
    });

    it('should return true when stored version is newer than current version', () => {
      const storedVersion = new Version(testGuildId, '2.0.0');
      const result = shouldRegisterCommands(storedVersion, '1.0.0');

      expect(result).toBe(true);
    });
  });

  describe('staleness scenarios', () => {
    it('should return true when versions match but stored version is stale (>5 days)', () => {
      const sixDaysAgo = new Date(Date.now() - (6 * 24 * 60 * 60 * 1000)).toISOString();
      const storedVersion = new Version(testGuildId, currentVersion, sixDaysAgo);
      const result = shouldRegisterCommands(storedVersion, currentVersion);

      expect(result).toBe(true);
    });

    it('should return false when versions match and stored version is fresh (<5 days)', () => {
      const threeDaysAgo = new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString();
      const storedVersion = new Version(testGuildId, currentVersion, threeDaysAgo);
      const result = shouldRegisterCommands(storedVersion, currentVersion);

      expect(result).toBe(false);
    });

    it('should return false when versions match and stored version is recent', () => {
      const storedVersion = new Version(testGuildId, currentVersion); // Default timestamp (now)
      const result = shouldRegisterCommands(storedVersion, currentVersion);

      expect(result).toBe(false);
    });
  });

  describe('parameter handling', () => {
    it('should use getBotVersion() when currentVersion not provided', () => {
      const mockPackageJson = JSON.stringify({ version: '2.5.0' });
      mockReadFileSync.mockReturnValue(mockPackageJson);

      const storedVersion = new Version(testGuildId, '1.0.0');
      const result = shouldRegisterCommands(storedVersion);

      expect(result).toBe(true); // Different versions: stored=1.0.0, current=2.5.0
      expect(mockReadFileSync).toHaveBeenCalled();
    });

    it('should use provided currentVersion when specified', () => {
      const storedVersion = new Version(testGuildId, '1.0.0');
      const result = shouldRegisterCommands(storedVersion, '1.0.0');

      expect(result).toBe(false); // Same version and fresh
      // getBotVersion should not be called since currentVersion was provided
    });

    it('should handle empty string currentVersion', () => {
      const storedVersion = new Version(testGuildId, 'some-version');
      const result = shouldRegisterCommands(storedVersion, '');

      expect(result).toBe(true); // Different versions
    });
  });

  describe('edge cases', () => {
    it('should handle stored version with invalid timestamp gracefully', () => {
      const storedVersionWithInvalidTimestamp = new Version(testGuildId, currentVersion, 'invalid-timestamp');
      const result = shouldRegisterCommands(storedVersionWithInvalidTimestamp, currentVersion);

      // Versions match but invalid timestamp should not be stale (returns false from isStale())
      expect(result).toBe(false);
    });

    it('should handle getBotVersion fallback when currentVersion not provided and package.json fails', () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const storedVersion = new Version(testGuildId, '1.0.0');
      const result = shouldRegisterCommands(storedVersion);

      expect(result).toBe(true); // stored=1.0.0, current=0.0.4 (fallback)
    });
  });
});
