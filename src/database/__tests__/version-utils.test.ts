import { getBotVersion } from '../version-utils';
import { readFileSync } from 'fs';

// Mock the fs module
jest.mock('fs');
const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;

describe('getBotVersion', () => {
  afterEach(() => {
    jest.clearAllMocks();
    // Clear console.error mock if we add one
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

  it('should return "0.0.4" and log error when file cannot be read', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockReadFileSync.mockImplementation(() => {
      throw new Error('File not found');
    });
    
    const version = getBotVersion();
    
    expect(version).toBe('0.0.4');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to read bot version from package.json, falling back to 0.0.4:',
      'File not found'
    );
  });

  it('should return "0.0.4" and log error when JSON is invalid', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockReadFileSync.mockReturnValue('invalid json content');
    
    const version = getBotVersion();
    
    expect(version).toBe('0.0.4');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to read bot version from package.json, falling back to 0.0.4:',
      expect.stringContaining('Unexpected token')
    );
  });
});
