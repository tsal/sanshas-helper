/**
 * Repository configuration interface
 */
export interface RepositoryConfig {
  /**
   * The path to the database file
   */
  databasePath: string;
}

/**
 * Repository interface for high-level database operations
 */
export interface Repository {
  /**
   * Initialize the repository with configuration
   */
  initialize(config: RepositoryConfig): Promise<void>;
  
  /**
   * Check if the repository is initialized
   */
  isInitialized(): boolean;
  
  /**
   * Store an object in the database
   */
  store<T extends import('../types').DatabaseObject>(object: T): Promise<void>;
  
  /**
   * Store a collection in the database
   */
  storeCollection<T = any>(storageKey: string, collection: import('../types').DatabaseCollection<T>): Promise<void>;
}
