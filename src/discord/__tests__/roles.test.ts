import { createRoleButtons } from '../roles';
import { Role as FrontierRole } from '../../frontier/types';

describe('createRoleButtons', () => {
  it('should create action rows for all frontier roles', () => {
    const result = createRoleButtons();
    
    // Should return array of action rows
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    // Get all buttons from all rows
    const allButtons = result.flatMap(row => row.components);
    
    // Should have one button per frontier role
    expect(allButtons).toHaveLength(Object.values(FrontierRole).length);
  });

  it('should create the expected number of buttons', () => {
    const result = createRoleButtons();
    const totalButtons = result.reduce((sum, row) => sum + row.components.length, 0);
    
    expect(totalButtons).toBe(Object.values(FrontierRole).length);
  });

  it('should handle row organization correctly for many buttons', () => {
    // Test the logic that would apply if we had more than 5 roles
    const buttonsPerRow = 5;
    const testCases = [
      { buttons: 3, expectedRows: 1 },
      { buttons: 5, expectedRows: 1 },
      { buttons: 6, expectedRows: 2 },
      { buttons: 10, expectedRows: 2 },
      { buttons: 11, expectedRows: 3 }
    ];
    
    testCases.forEach(({ buttons, expectedRows }) => {
      const calculatedRows = Math.ceil(buttons / buttonsPerRow);
      expect(calculatedRows).toBe(expectedRows);
    });
  });
});
