import { createFleetButtons } from '../fleets';

describe('createFleetButtons', () => {
  it('should create action rows for fleet management', () => {
    const result = createFleetButtons();
    
    // Should return array of action rows
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    // Get all buttons from all rows
    const allButtons = result.flatMap(row => row.components);
    
    // Should have at least one placeholder button
    expect(allButtons.length).toBeGreaterThan(0);
  });

  it('should create disabled placeholder buttons', () => {
    const result = createFleetButtons();
    const allButtons = result.flatMap(row => row.components);
    
    // All buttons should be disabled for now (placeholder)
    allButtons.forEach(button => {
      expect(button.data.disabled).toBe(true);
    });
  });

  it('should have fleet-prefixed custom IDs', () => {
    const result = createFleetButtons();
    const allButtons = result.flatMap(row => row.components);
    
    // All buttons should have fleet_ prefix
    // Using type assertion since Discord.js types don't properly expose custom_id
    allButtons.forEach(button => {
      const customId = (button.data as any).custom_id;
      expect(customId).toMatch(/^fleet_/);
    });
  });

  it('should handle row organization correctly', () => {
    const result = createFleetButtons();
    
    // Should have exactly one row for now (only one placeholder button)
    expect(result.length).toBe(1);
    
    // First row should have exactly one button
    expect(result[0].components.length).toBe(1);
  });
});
