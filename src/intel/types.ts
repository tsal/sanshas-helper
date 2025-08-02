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
   * The actual intel content/data - can be any type for flexibility
   */
  content: any;
  
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
  
  if (obj.content === undefined || obj.content === null) {
    return false;
  }
  
  // Check optional fields
  if (obj.location !== undefined && typeof obj.location !== 'string') {
    return false;
  }
  
  return true;
};
