import { DatabaseEntity, Purgeable } from '../database/types';
import { repository } from '../database/repository';

// Base interface for intel content
export interface IntelContentType {
  // Minimal - extend as needed
}

// Rift intel: name, system, lagrange point (e.g. P1L4, P1M2)
export interface RiftIntelItem extends IntelContentType {
  type: string;
  systemName: string;
  near: string; // P1L4 = Planet 1, L-Point 4
}

// Type guard for RiftIntelItem validation
export const isRiftIntelItem = (content: unknown): content is RiftIntelItem => {
  if (typeof content !== 'object' || content === null) {
    return false;
  }
  
  const obj = content as Record<string, unknown>;
  return typeof obj.type === 'string' && 
         typeof obj.systemName === 'string' && 
         typeof obj.near === 'string';
};

// Intel item: ID, timestamp, reporter, content, optional location
export interface IntelItem {
  id: string;
  timestamp: string; // ISO format
  reporter: string; // Discord user ID
  content: IntelContentType;
  location?: string;
}

// Type guard for IntelItem validation
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

// Database wrapper for IntelItem storage
export class IntelEntity extends DatabaseEntity implements Purgeable {
  static readonly storageKey = 'intel-items';
  public readonly intelItem: IntelItem;
  
  constructor(guildId: string, intelItem: IntelItem) {
    super(guildId);
    this.intelItem = intelItem;
  }
  
  // Purgeable interface implementation
  get timestamp(): string {
    return this.intelItem.timestamp;
  }
}

// Store intel item in database
export const storeIntelItem = async (guildId: string, intelItem: IntelItem): Promise<void> => {
  const entity = new IntelEntity(guildId, intelItem);
  await repository.store(entity);
};

// Type for future retrieval function
export type GetIntelItemsFunction = (guildId: string) => Promise<IntelItem[]>;
