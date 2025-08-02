/**
 * Base interface that all database objects must implement
 * Ensures all objects have a guildId for proper data organization
 */
export interface DatabaseObject {
  /**
   * The Discord guild ID this object belongs to (stored as string due to 64-bit integer limits)
   */
  guildId: string;
}

/**
 * Interface for classes that can be stored in the database
 * Requires a static storageKey property
 */
export interface DatabaseObjectConstructor {
  readonly storageKey: string;
  new (...args: any[]): DatabaseObject;
}

/**
 * Interface for objects that can be automatically purged based on age
 * Requires ISO timestamp string for efficient storage
 */
export interface Purgeable {
  timestamp: string;
}

/**
 * Abstract base class for database objects with static storageKey requirement
 */
export abstract class DatabaseEntity implements DatabaseObject {
  /**
   * Static storage key - must be implemented by subclasses
   */
  static readonly storageKey: string;
  
  /**
   * The Discord guild ID this object belongs to
   */
  guildId: string;

  constructor(guildId: string) {
    this.guildId = guildId;
  }
}

/**
 * Generic collection wrapper that associates a guild with a collection of data
 * The data items themselves do not need to implement DatabaseObject
 */
export interface DatabaseCollection<T = any> {
  /**
   * The Discord guild ID this collection belongs to
   */
  guildId: string;
  /**
   * The array of data items for this guild
   */
  data: T[];
}

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  /**
   * The path to the database file
   */
  filePath: string;
}

/**
 * Default database configuration
 */
export const DEFAULT_DATABASE_CONFIG: DatabaseConfig = {
  filePath: './data/db.json'
};
