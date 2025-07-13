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
