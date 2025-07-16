/**
 * Database module exports
 * Handles data persistence using lowdb
 */

export { 
  DatabaseObject, 
  DatabaseCollection, 
  DatabaseConfig, 
  DEFAULT_DATABASE_CONFIG,
  DatabaseObjectConstructor,
  DatabaseEntity 
} from './types';
export { registerObject, storeObject, storeCollection, isDatabaseEnabled } from './register';
