import { storeObject, storeCollection } from '../register';
import { DatabaseObject, DatabaseCollection } from '../types';
import { Repository, RepositoryConfig } from './types';

/**
 * Singleton repository instance for high-level database operations
 */
class DatabaseRepository implements Repository {
  private config: RepositoryConfig | null = null;
  private initialized = false;

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
      console.warn('Repository is not initialized, skipping store operation');
      return;
    }
    
    try {
      await storeObject(this.config!.databasePath, object);
    } catch (error) {
      console.error('Failed to store object:', error);
    }
  }

  /**
   * Store a collection in the database
   * @param storageKey - The storage key for the collection
   * @param collection - The collection to store
   */
  async storeCollection<T = any>(storageKey: string, collection: DatabaseCollection<T>): Promise<void> {
    if (!this.isInitialized()) {
      console.warn('Repository is not initialized, skipping store collection operation');
      return;
    }
    
    try {
      await storeCollection(this.config!.databasePath, storageKey, collection);
    } catch (error) {
      console.error('Failed to store collection:', error);
    }
  }
}

/**
 * Singleton repository instance
 */
export const repository: Repository = new DatabaseRepository();
