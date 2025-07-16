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
   * @throws Error if repository is not initialized
   */
  async store<T extends DatabaseObject>(object: T): Promise<void> {
    this.ensureInitialized();
    await storeObject(this.config!.databasePath, object);
  }

  /**
   * Store a collection in the database
   * @param storageKey - The storage key for the collection
   * @param collection - The collection to store
   * @throws Error if repository is not initialized
   */
  async storeCollection<T = any>(storageKey: string, collection: DatabaseCollection<T>): Promise<void> {
    this.ensureInitialized();
    await storeCollection(this.config!.databasePath, storageKey, collection);
  }

  /**
   * Ensure the repository is initialized
   * @throws Error if not initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized()) {
      throw new Error('Repository is not initialized. Call initialize() first.');
    }
  }
}

/**
 * Singleton repository instance
 */
export const repository: Repository = new DatabaseRepository();
