/**
 * Base interface that all database objects must implement
 * Ensures all objects have a guildId for proper data organization
 */
export interface DatabaseObject {
  /**
   * The Discord guild ID this object belongs to
   */
  guildId: string;
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
