import { DatabaseObject, DatabaseCollection, Purgeable } from '../types';
import { Repository, RepositoryConfig } from './types';

/**
 * Database storage interface - guild ID strings as keys, with collections within each guild
 */
interface DatabaseData {
  [guildId: string]: {
    [storageKey: string]: DatabaseObject[] | DatabaseCollection<any>[];
  };
}

/**
 * Singleton repository instance for high-level database operations
 */
class DatabaseRepository implements Repository {
  private config: RepositoryConfig | null = null;
  private initialized = false;
  private dbInstance: any | null = null;

  /**
   * Initialize the database with the given path
   * @param databasePath - Path to the database file
   * @returns Promise that resolves when database is initialized
   */
  private async initializeDatabase(databasePath: string): Promise<void> {
    if (this.dbInstance === null) {
      try {
        const { JSONFilePreset } = await import('lowdb/node');
        this.dbInstance = await JSONFilePreset<DatabaseData>(databasePath, {});
      } catch (error) {
        // Reset dbInstance to null if initialization fails
        this.dbInstance = null;
        throw error;
      }
    }
  }

  /**
   * Internal unified storage function for both objects and collections
   * @param databasePath - Path to the database file
   * @param guildId - The guild ID string
   * @param storageKey - The storage key for the data type
   * @param data - The data to store (object or collection)
   * @returns Promise that resolves when data is stored
   */
  private async storeData(
    databasePath: string,
    guildId: string,
    storageKey: string,
    data: DatabaseObject | DatabaseCollection<any>
  ): Promise<void> {
    await this.initializeDatabase(databasePath);
    
    if (!this.dbInstance) {
      throw new Error('Failed to initialize database');
    }

    // Ensure the guild exists in the database
    if (!this.dbInstance.data[guildId]) {
      this.dbInstance.data[guildId] = {};
    }

    // Ensure the storage key exists for this guild
    if (!this.dbInstance.data[guildId][storageKey]) {
      this.dbInstance.data[guildId][storageKey] = [];
    }

    // Add the data to the array for this guild and storage key
    (this.dbInstance.data[guildId][storageKey] as any[]).push(data);
    
    // Write changes to file
    await this.dbInstance.write();
  }

  /**
   * Initialize the repository with configuration
   * @param config - Repository configuration
   */
  async initialize(config: RepositoryConfig): Promise<void> {
    this.config = config;
    this.initialized = true;
  }

  /**
   * Check if the repository is initialized
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.initialized && this.config !== null;
  }

  /**
   * Store an object in the database
   * @param object - The object to store
   */
  async store<T extends DatabaseObject>(object: T): Promise<void> {
    if (!this.isInitialized()) {
      return;
    }
    
    try {
      const { guildId } = object;
      const storageKey = (object.constructor as any).storageKey;

      if (!storageKey) {
        throw new Error('Object class must have a static storageKey property');
      }

      await this.storeData(this.config!.databasePath, guildId, storageKey, object);
    } catch (error) {
      console.error('Failed to store object:', error);
      throw error; // Re-throw for caller to handle
    }
  }

  /**
   * Store a collection in the database
   * @param storageKey - The storage key for the collection
   * @param collection - The collection to store
   */
  async storeCollection<T = any>(storageKey: string, collection: DatabaseCollection<T>): Promise<void> {
    if (!this.isInitialized()) {
      return;
    }
    
    try {
      const { guildId } = collection;
      await this.storeData(this.config!.databasePath, guildId, storageKey, collection);
    } catch (error) {
      console.error('Failed to store collection:', error);
      throw error; // Re-throw for caller to handle
    }
  }

  /**
   * Get all objects of a specific type for a guild
   * @param EntityClass - The entity class constructor
   * @param guildId - Guild ID to retrieve from
   * @returns Array of objects
   */
  async getAll<T extends DatabaseObject>(
    EntityClass: new (...args: any[]) => T,
    guildId: string
  ): Promise<T[]> {
    if (!this.isInitialized()) {
      return [];
    }

    try {
      const storageKey = (EntityClass as any).storageKey;
      if (!storageKey) {
        throw new Error('Entity class must have a static storageKey property');
      }

      await this.initializeDatabase(this.config!.databasePath);
      
      if (!this.dbInstance) {
        throw new Error('Failed to initialize database');
      }
      
      // Return empty array if guild or storage key doesn't exist
      if (!this.dbInstance.data[guildId] || !this.dbInstance.data[guildId][storageKey]) {
        return [];
      }

      const storedData = this.dbInstance.data[guildId][storageKey] as any[];
      
      // Reconstruct class instances from stored plain objects
      return storedData.map((item: any) => {
        try {
          // For IntelEntity: constructor(guildId: string, intelItem: IntelItem)
          if (item.guildId && item.intelItem) {
            return new EntityClass(item.guildId, item.intelItem);
          }
          // For TestEntity and similar: constructor(guildId: string, timestamp: string, data: string)
          else if (item.guildId && item.timestamp && item.data !== undefined) {
            return new EntityClass(item.guildId, item.timestamp, item.data);
          }
          // Generic approach: extract guildId and pass remaining properties as individual arguments
          else if (item.guildId) {
            const { guildId: itemGuildId, ...otherProps } = item;
            const propValues = Object.values(otherProps);
            return new EntityClass(itemGuildId, ...propValues);
          }
          // Fallback: assume the stored object has the right shape
          else {
            return item as T;
          }
        } catch (error) {
          console.warn('Failed to reconstruct object, using fallback:', error);
          return item as T;
        }
      });
    } catch (error) {
      console.error('Failed to get all objects:', error);
      throw error;
    }
  }

  /**
   * Remove stale objects that implement Purgeable interface
   * @param EntityClass - The entity class to purge
   * @param guildId - Guild ID to purge from
   * @param maxAgeHours - Maximum age in hours (default 24)
   * @returns Number of items purged
   */
  async purgeStaleItems<T extends DatabaseObject & Purgeable>(
    EntityClass: new (...args: any[]) => T,
    guildId: string,
    maxAgeHours: number = 24
  ): Promise<number> {
    if (!this.isInitialized()) {
      return 0;
    }

    try {
      const storageKey = (EntityClass as any).storageKey;
      if (!storageKey) {
        throw new Error('Entity class must have a static storageKey property');
      }

      // Get all items
      const allItems = await this.getAll(EntityClass, guildId);
      
      // Calculate cutoff time
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - maxAgeHours);
      const cutoffTimestamp = cutoffTime.toISOString();

      // Filter out stale items
      const freshItems = allItems.filter(item => {
        const itemTimestamp = (item as Purgeable).timestamp;
        return itemTimestamp > cutoffTimestamp;
      });

      const purgedCount = allItems.length - freshItems.length;

      // Replace all items with fresh ones if any were purged
      if (purgedCount > 0) {
        await this.replaceAll(EntityClass, guildId, freshItems);
      }

      return purgedCount;
    } catch (error) {
      console.error('Failed to purge stale items:', error);
      throw error;
    }
  }

  /**
   * Replace all objects of a specific type for a guild
   * @param EntityClass - The entity class constructor
   * @param guildId - Guild ID to replace in
   * @param objects - New objects to store
   */
  async replaceAll<T extends DatabaseObject>(
    EntityClass: new (...args: any[]) => T,
    guildId: string,
    objects: T[]
  ): Promise<void> {
    if (!this.isInitialized()) {
      return;
    }

    try {
      const storageKey = (EntityClass as any).storageKey;
      if (!storageKey) {
        throw new Error('Entity class must have a static storageKey property');
      }

      await this.initializeDatabase(this.config!.databasePath);
      
      if (!this.dbInstance) {
        throw new Error('Failed to initialize database');
      }
      
      // Ensure the guild exists in the database
      if (!this.dbInstance.data[guildId]) {
        this.dbInstance.data[guildId] = {};
      }

      // Replace the entire array for this storage key
      this.dbInstance.data[guildId][storageKey] = objects;
      
      // Write changes to file
      await this.dbInstance.write();
    } catch (error) {
      console.error('Failed to replace all objects:', error);
      throw error;
    }
  }
}

/**
 * Singleton repository instance
 */
export const repository: Repository = new DatabaseRepository();
