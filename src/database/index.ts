/**
 * Database module exports
 * Handles data persistence using lowdb
 * 
 * Main interface: Use the `repository` singleton for all database operations
 */

// Main repository interface - use this for all database operations
export { repository, Repository, RepositoryConfig } from './repository';

// Base types for creating database entities
export { DatabaseObject, DatabaseEntity } from './types';

// Utility function for conditional command registration
export { isDatabaseEnabled } from './register';
