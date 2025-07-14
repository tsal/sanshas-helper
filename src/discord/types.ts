import { RoleCreateOptions } from 'discord.js';
import { Role as FrontierRole } from '../frontier/types';

/**
 * Interface for mapping EVE Frontier roles to Discord role identifiers
 * Maps FrontierRole enum values to Discord role IDs (snowflake strings)
 */
export interface RoleMap {
  /**
   * Discord role ID for the Exploration role
   */
  [FrontierRole.Exploration]: string;
  /**
   * Discord role ID for the Industry role
   */
  [FrontierRole.Industry]: string;
  /**
   * Discord role ID for the Mining role
   */
  [FrontierRole.Mining]: string;
  /**
   * Discord role ID for the PVE role
   */
  [FrontierRole.PVE]: string;
  /**
   * Discord role ID for the PVP role
   */
  [FrontierRole.PVP]: string;
}

/**
 * Internal role creation configuration object
 * This will be used to generate role creation parameters for Discord
 */
export interface RoleConfig {
  /** The name of the role */
  name: string;
  /** The color of the role (hex value) */
  color?: number;
  /** The reason for creating the role */
  reason?: string;
  /** Array of permission strings or permission bitfield */
  permissions?: bigint[] | bigint;
  /** Whether the role should be displayed separately in the member list */
  hoist?: boolean;
  /** Whether the role can be mentioned */
  mentionable?: boolean;
}

/**
 * Converts a RoleConfig to Discord.js RoleCreateOptions
 * @param config - The internal role configuration
 * @returns Discord.js compatible role creation options
 */
export const createRoleOptions = (config: RoleConfig): RoleCreateOptions => {
  const options: RoleCreateOptions = {
    name: config.name
  };
  
  if (config.color !== undefined) options.color = config.color;
  if (config.reason !== undefined) options.reason = config.reason;
  if (config.permissions !== undefined) options.permissions = config.permissions;
  if (config.hoist !== undefined) options.hoist = config.hoist;
  if (config.mentionable !== undefined) options.mentionable = config.mentionable;
  
  return options;
};

/**
 * Key constants for default role configurations
 */
export const MANAGEMENT_ROLE = 'MANAGEMENT_ROLE';

/**
 * Collection of default role configurations
 * Maps string keys to RoleConfig objects for consistent role creation
 */
export const DEFAULT_ROLE_CONFIGS: Record<string, RoleConfig> = {
  [MANAGEMENT_ROLE]: {
    name: 'Sansha\'s Helper',
    color: 0x8B0000, // Dark red color for Sansha's Nation theme
    reason: 'Bot management role for role assignment functionality',
    permissions: [], // No special permissions needed, just for hierarchy
    hoist: false, // Don't display separately in member list
    mentionable: false // Don't allow mentioning this role
  },
  [FrontierRole.Exploration]: {
    name: 'Exploration',
    color: 0xEB459E, // Purple for royalty/crucial role
    reason: 'EVE Frontier exploration tribe role',
    permissions: [],
    hoist: false,
    mentionable: true
  },
  [FrontierRole.Industry]: {
    name: 'Industry',
    color: 0xFEE75C, // Yellow for caution, valuable targets
    reason: 'EVE Frontier industry tribe role',
    permissions: [],
    hoist: false,
    mentionable: true
  },
  [FrontierRole.Mining]: {
    name: 'Mining',
    color: 0x57F287, // Green for safe, low threat
    reason: 'EVE Frontier mining tribe role',
    permissions: [],
    hoist: false,
    mentionable: true
  },
  [FrontierRole.PVE]: {
    name: 'PVE',
    color: 0xF97316, // Orange for moderate danger
    reason: 'EVE Frontier PVE tribe role',
    permissions: [],
    hoist: false,
    mentionable: true
  },
  [FrontierRole.PVP]: {
    name: 'PVP',
    color: 0xED4245, // Red for maximum danger
    reason: 'EVE Frontier PVP tribe role',
    permissions: [],
    hoist: false,
    mentionable: true
  }
};
