/**
 * Database module exports
 * Handles data persistence using lowdb
 */

export { DatabaseObject, DatabaseConfig, DEFAULT_DATABASE_CONFIG } from './types';
export { registerObject, isDatabaseEnabled } from './register';
