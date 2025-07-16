import { JSONFilePreset } from 'lowdb/node';
import { DatabaseObject } from './types';

/**
 * Database storage interface
 */
interface DatabaseData {
  [key: string]: DatabaseObject[];
}

/**
 * Global database instance
 */
let dbInstance: Awaited<ReturnType<typeof JSONFilePreset<DatabaseData>>> | null = null;

/**
 * Checks if the database is enabled based on the provided path
 * @param databasePath - The database path from configuration, can be null
 * @returns True if database is enabled (path is not null), false otherwise
 */
export const isDatabaseEnabled = (databasePath: string | null): boolean => {
  return databasePath !== null;
};

/**
 * Initialize the database with the given path
 * @param databasePath - Path to the database file
 * @returns Promise that resolves when database is initialized
 */
const initializeDatabase = async (databasePath: string): Promise<void> => {
  if (dbInstance === null) {
    dbInstance = await JSONFilePreset<DatabaseData>(databasePath, {});
  }
};

/**
 * Registers an object to be saved in the database
 * The object must implement the DatabaseObject interface with a guildId field
 * @param databasePath - Path to the database file
 * @param key - The key under which to store the object type
 * @param object - The object to register, must have a guildId field
 * @returns Promise that resolves when the object is registered
 */
export const registerObject = async <T extends DatabaseObject>(
  databasePath: string,
  key: string,
  object: T
): Promise<void> => {
  await initializeDatabase(databasePath);
  
  if (!dbInstance) {
    throw new Error('Failed to initialize database');
  }

  // Ensure the key exists in the database
  if (!dbInstance.data[key]) {
    dbInstance.data[key] = [];
  }

  // Add the object to the array for this key
  dbInstance.data[key].push(object);
  
  // Write changes to file
  await dbInstance.write();
};
