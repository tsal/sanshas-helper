/**
 * Intel Type Handler System
 * 
 * This module provides a generic interface for handling different types of intel
 * in a consistent, extensible way. Each intel type (rift, ore, etc.) can implement
 * the IntelTypeHandler interface to provide standardized functionality.
 */

export { IntelTypeHandler, SlashCommandOptionBuilder } from './types';
export { IntelTypeRegistry } from './registry';
