import { IntelTypeHandler } from './types';
import { IntelContentType } from '../types';

/**
 * Registry for managing intel type handlers
 * Provides a centralized way to register and retrieve handlers for different intel types
 */
export class IntelTypeRegistry {
  private handlers: Map<string, IntelTypeHandler<IntelContentType>>;

  constructor() {
    this.handlers = new Map();
  }

  /**
   * Register an intel type handler
   * @param type - The intel type identifier (e.g., 'rift', 'ore')
   * @param handler - The handler implementation for this intel type
   */
  register(type: string, handler: IntelTypeHandler<IntelContentType>): void {
    this.handlers.set(type, handler);
  }

  /**
   * Retrieve a registered intel type handler
   * @param type - The intel type identifier to look up
   * @returns The handler for this type, or undefined if not found
   */
  getHandler(type: string): IntelTypeHandler<IntelContentType> | undefined {
    return this.handlers.get(type);
  }

  /**
   * Check if a handler is registered for the given type
   * @param type - The intel type identifier to check
   * @returns True if a handler is registered for this type, false otherwise
   */
  hasHandler(type: string): boolean {
    return this.handlers.has(type);
  }

  /**
   * Get all registered intel type identifiers
   * @returns Array of registered type identifiers
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}
