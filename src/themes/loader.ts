/**
 * Dynamic theme registry - Simple runtime theme registration
 * 
 * This module provides a simple registry for themes that can be populated
 * at runtime.
 */

import { Theme } from './base';

/**
 * Simple theme registry that gets populated at startup
 */
export class ThemeRegistry {
  private themes: Map<string, Theme> = new Map();

  /**
   * Register a theme in the registry
   */
  register(theme: Theme): void {
    this.themes.set(theme.name, theme);
  }

  /**
   * Get a theme by name
   */
  getTheme(name: string): Theme | undefined {
    return this.themes.get(name);
  }

  /**
   * Get all available theme names
   */
  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * Check if a theme exists
   */
  hasTheme(name: string): boolean {
    return this.themes.has(name);
  }

  /**
   * Get all themes as a Record
   */
  getThemes(): Record<string, Theme> {
    const record: Record<string, Theme> = {};
    for (const [name, theme] of this.themes) {
      record[name] = theme;
    }
    return record;
  }

  /**
   * Get the number of registered themes
   */
  size(): number {
    return this.themes.size;
  }
}

// Export singleton instance
export const themeRegistry = new ThemeRegistry();
