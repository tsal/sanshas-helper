import { DatabaseEntity } from '../types';

/**
 * Version entity to track bot version per guild
 * Used to determine if commands need re-registration
 */
export class Version extends DatabaseEntity {
  static readonly storageKey = 'versions';

  /**
   * The bot version number (e.g., "0.0.4")
   */
  public readonly version: string;

  /**
   * Timestamp when this version was last updated (ISO string for reliable serialization)
   */
  public readonly lastUpdated: string;

  /**
   * Creates a new Version entity
   * @param guildId - The Discord guild ID (Snowflake string)
   * @param version - The bot version number
   * @param lastUpdated - Optional timestamp, defaults to current time
   */
  constructor(guildId: string, version: string, lastUpdated?: string) {
    super(guildId);
    this.version = version;
    this.lastUpdated = lastUpdated || new Date().toISOString();
  }

  /**
   * Checks if the version was last updated more than 5 days ago
   * @returns True if more than 5 days have passed since last update
   */
  public isStale(): boolean {
    const lastUpdateTime = new Date(this.lastUpdated);
    const fiveDaysAgo = new Date(Date.now() - (5 * 24 * 60 * 60 * 1000));
    return lastUpdateTime < fiveDaysAgo;
  }
}
