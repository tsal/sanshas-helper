import { readFileSync } from 'fs';
import { join } from 'path';
import { Version } from './entities/version';

/**
 * Gets the current bot version from package.json
 * @returns The version string from package.json, defaults to "0.0.4" if unavailable
 */
export const getBotVersion = (): string => {
  try {
    // Read package.json from the project root
    const packageJsonPath = join(__dirname, '../../..', 'package.json');
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    
    if (typeof packageJson.version !== 'string') {
      return '0.0.4';
    }
    
    return packageJson.version;
  } catch (error) {
    console.error('Failed to read bot version from package.json, falling back to 0.0.4:', error instanceof Error ? error.message : 'Unknown error');
    return '0.0.4';
  }
};

/**
 * Determines if command registration should be run based on version comparison and staleness
 * @param storedVersion - The stored Version entity, or null if none exists
 * @param currentVersion - The current bot version, defaults to getBotVersion()
 * @returns True if commands should be re-registered
 */
export const shouldRegisterCommands = (storedVersion: Version | null, currentVersion?: string): boolean => {
  const botVersion = currentVersion || getBotVersion();
  
  // If no stored version, this is first run - register commands
  if (storedVersion === null) {
    return true;
  }
  
  // If version has changed, register commands
  if (storedVersion.version !== botVersion) {
    return true;
  }
  
  // If version is the same but stale (>5 days), register commands as fallback
  if (storedVersion.isStale()) {
    return true;
  }
  
  // Version is same and not stale, skip registration
  return false;
};
