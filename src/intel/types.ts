import { DatabaseEntity, Purgeable } from '../database/types';
import { repository } from '../database/repository';
import { getThemeMessage, MessageCategory } from '../themes';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

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

// Ore intel: ore type, name, system, near location
export interface OreIntelItem extends IntelContentType {
  oreType: string;
  name: string;
  systemName: string;
  near: string;
}

// Type guard for OreIntelItem validation
export const isOreIntelItem = (content: unknown): content is OreIntelItem => {
  if (typeof content !== 'object' || content === null) {
    return false;
  }
  
  const obj = content as Record<string, unknown>;
  return typeof obj.oreType === 'string' && 
         typeof obj.name === 'string' &&
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

/**
 * Delete an intel item by ID from a Discord interaction
 * @param interaction - Discord interaction object
 * @param guildId - Guild ID
 * @param id - Intel item ID to delete
 * @throws Error if deletion fails
 */
export const deleteIntelByIdFromInteraction = async (
  interaction: ChatInputCommandInteraction, 
  guildId: string, 
  id: string
): Promise<void> => {
  const deleted = await repository.deleteById(IntelEntity, guildId, id);
  
  if (!deleted) {
    const errorMessage = getThemeMessage(MessageCategory.ERROR, `Intel item not found: ${id}`);
    await interaction.reply({
      content: errorMessage.text,
      flags: MessageFlags.Ephemeral
    });
    return;
  }
  
  const successMessage = getThemeMessage(MessageCategory.SUCCESS, `Intel item deleted: ${id}`);
  await interaction.reply({
    content: successMessage.text,
    flags: MessageFlags.Ephemeral
  });
};
