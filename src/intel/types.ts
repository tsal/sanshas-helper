/**
 * Base interface that all intel content must implement
 * Keeps things consistent but flexible, ya know?
 */
export interface IntelContentType {
  // Intentionally minimal - let specific types add their own fields
}

/**
 * Import DatabaseEntity for the wrapper class
 */
import { DatabaseEntity } from '../database/types';

/**
 * Rift intelligence content for tracking spatial anomalies
 * Represents rifts and their locations in the galaxy
 */
export interface RiftIntelItem extends IntelContentType {
  /**
   * Type/name of the rift (e.g., "Unstable Wormhole", "Quantum Anomaly")
   */
  name: string;
  
  /**
   * The stellar system where this rift is located
   */
  systemName: string;
  
  /**
   * Lagrange point designation within the system
   * Examples: "P1L4" (Planet 1, Lagrange Point 4), "P1M2" (Planet 1, Moon Point 2)
   * Can be any string - customer's always right about their naming conventions
   */
  lPointName: string;
}

/**
 * Basic intel item interface for EVE Frontier intelligence reports
 * This is a minimal foundation that can be extended and iterated upon
 */
export interface IntelItem {
  /**
   * Unique identifier for this intel item
   */
  id: string;
  
  /**
   * ISO timestamp when the intel was reported
   */
  timestamp: string;
  
  /**
   * Discord user ID of the person who reported this intel
   */
  reporter: string;
  
  /**
   * The actual intel content/data - must implement IntelContentType
   */
  content: IntelContentType;
  
  /**
   * Optional system or location reference
   */
  location?: string;
}

/**
 * Type guard to check if a value is a valid IntelItem
 * @param value - The value to check
 * @returns True if the value is a valid IntelItem
 */
export const isIntelItem = (value: unknown): value is IntelItem => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  // Check required fields
  if (typeof obj.id !== 'string' || obj.id.trim() === '') {
    return false;
  }
  
  if (typeof obj.timestamp !== 'string' || obj.timestamp.trim() === '') {
    return false;
  }
  
  if (typeof obj.reporter !== 'string' || obj.reporter.trim() === '') {
    return false;
  }
  
  if (typeof obj.content !== 'object' || obj.content === null || obj.content === undefined) {
    return false;
  }
  
  // Check optional fields
  if (obj.location !== undefined && typeof obj.location !== 'string') {
    return false;
  }
  
  return true;
};

/**
 * Database entity wrapper for storing IntelItem objects
 * Extends DatabaseEntity to work with the existing database infrastructure
 */
export class IntelEntity extends DatabaseEntity {
  static readonly storageKey = 'intel-items';
  
  /**
   * The wrapped intel item data
   */
  public readonly intelItem: IntelItem;
  
  /**
   * Creates a new IntelEntity wrapper for database storage
   * @param guildId - The Discord guild ID
   * @param intelItem - The intel item to wrap and store
   */
  constructor(guildId: string, intelItem: IntelItem) {
    super(guildId);
    this.intelItem = intelItem;
  }
}

/**
 * Import repository for utility functions
 */
import { repository } from '../database/repository';

/**
 * Stores an intel item in the database for a specific guild
 * @param guildId - The Discord guild ID
 * @param intelItem - The intel item to store
 * @returns Promise that resolves when the item is stored
 */
export const storeIntelItem = async (guildId: string, intelItem: IntelItem): Promise<void> => {
  const entity = new IntelEntity(guildId, intelItem);
  await repository.store(entity);
};

/**
 * Type for intel item retrieval (placeholder for future implementation)
 * When we need to retrieve items, we'll implement this function
 */
export type GetIntelItemsFunction = (guildId: string) => Promise<IntelItem[]>;
