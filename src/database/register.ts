import { JSONFilePreset } from 'lowdb/node';
import { DatabaseObject, DatabaseCollection, DatabaseObjectConstructor } from './types';

/**
 * Database storage interface - guild ID strings as keys, with collections within each guild
 */
interface DatabaseData {
  [guildId: string]: {
    [storageKey: string]: DatabaseObject[] | DatabaseCollection<any>[];
  };
}

/**
 * Global database instance
 */
let dbInstance: Awaited<ReturnType<typeof JSONFilePreset<DatabaseData>>> | null = null;

/**
 * Object type registry for in-memory tracking of registered object types
 */
const objectTypeRegistry = new Set<string>();

/**
 * Resets the database instance and object registry (for testing only)
 * @internal
 */
export const resetDatabaseForTesting = (): void => {
  dbInstance = null;
  objectTypeRegistry.clear();
};

/**
 * Checks if the database is enabled and properly initialized
 * @param databasePath - The database path from configuration, can be null
 * @returns True if database is enabled (path is not null) and repository is initialized, false otherwise
 */
export const isDatabaseEnabled = (databasePath: string | null): boolean => {
  if (databasePath === null) {
    return false;
  }
  
  // Import repository here to avoid circular dependency
  const { repository } = require('./repository');
  return repository.isInitialized();
};

/**
 * Registers an object type for tracking (in-memory only)
 * @param objectClass - The class constructor that has a static storageKey property
 */
export const registerObject = (objectClass: DatabaseObjectConstructor): void => {
  objectTypeRegistry.add(objectClass.storageKey);
};

/**
 * Initialize the database with the given path
 * @param databasePath - Path to the database file
 * @returns Promise that resolves when database is initialized
 */
const initializeDatabase = async (databasePath: string): Promise<void> => {
  if (dbInstance === null) {
    try {
      dbInstance = await JSONFilePreset<DatabaseData>(databasePath, {});
    } catch (error) {
      // Reset dbInstance to null if initialization fails
      dbInstance = null;
      throw error;
    }
  }
};

/**
 * Internal unified storage function for both objects and collections
 * @param databasePath - Path to the database file
 * @param guildId - The guild ID string
 * @param storageKey - The storage key for the data type
 * @param data - The data to store (object or collection)
 * @returns Promise that resolves when data is stored
 */
const storeData = async (
  databasePath: string,
  guildId: string,
  storageKey: string,
  data: DatabaseObject | DatabaseCollection<any>
): Promise<void> => {
  await initializeDatabase(databasePath);
  
  if (!dbInstance) {
    throw new Error('Failed to initialize database');
  }

  // Ensure the guild exists in the database
  if (!dbInstance.data[guildId]) {
    dbInstance.data[guildId] = {};
  }

  // Ensure the storage key exists for this guild
  if (!dbInstance.data[guildId][storageKey]) {
    dbInstance.data[guildId][storageKey] = [];
  }

  // Add the data to the array for this guild and storage key
  (dbInstance.data[guildId][storageKey] as any[]).push(data);
  
  // Write changes to file
  await dbInstance.write();
};

/**
 * Stores an object in the database using guild ID and storage key
 * @param databasePath - Path to the database file
 * @param object - The object to store, must have guildId and storageKey fields
 * @returns Promise that resolves when the object is registered
 */
export const storeObject = async <T extends DatabaseObject>(
  databasePath: string,
  object: T
): Promise<void> => {
  const { guildId } = object;
  const storageKey = (object.constructor as DatabaseObjectConstructor).storageKey;

  if (!storageKey) {
    throw new Error('Object class must have a static storageKey property');
  }

  await storeData(databasePath, guildId, storageKey, object);
};

/**
 * Stores a collection in the database using guild ID and storage key
 * @param databasePath - Path to the database file
 * @param storageKey - The storage key for this collection type
 * @param collection - The collection to store, must have guildId field
 * @returns Promise that resolves when the collection is stored
 */
export const storeCollection = async <T = any>(
  databasePath: string,
  storageKey: string,
  collection: DatabaseCollection<T>
): Promise<void> => {
  const { guildId } = collection;
  await storeData(databasePath, guildId, storageKey, collection);
};
