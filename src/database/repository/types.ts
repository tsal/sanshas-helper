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

  /**
   * Get all objects of a specific type for a guild
   */
  getAll<T extends import('../types').DatabaseObject>(
    EntityClass: new (...args: any[]) => T,
    guildId: string
  ): Promise<T[]>;

    /**
   * Remove stale objects that implement Purgeable interface
   * @param EntityClass - The entity class to purge
   * @param guildId - Guild ID to purge from
   * @param maxAgeHours - Maximum age in hours (default 168)
   * @returns Promise that resolves to the number of items purged
   */
  purgeStaleItems<T extends import('../types').DatabaseObject & import('../types').Purgeable>(
    EntityClass: new (...args: any[]) => T,
    guildId: string,
    maxAgeHours?: number
  ): Promise<number>;

  /**
   * Replace all objects of a specific type for a guild
   */
  replaceAll<T extends import('../types').DatabaseObject>(
    EntityClass: new (...args: any[]) => T,
    guildId: string,
    objects: T[]
  ): Promise<void>;

  /**
   * Delete a specific object by ID for a guild
   * @param EntityClass - The entity class to delete from
   * @param guildId - Guild ID to delete from
   * @param id - The ID of the object to delete
   * @returns True if item was found and deleted, false if not found
   */
  deleteById<T extends import('../types').DatabaseObject>(
    EntityClass: new (...args: any[]) => T,
    guildId: string,
    id: string
  ): Promise<boolean>;
}
