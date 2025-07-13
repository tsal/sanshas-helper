import { getBotConfig } from '../types';
import { Role as FrontierRole } from '../../frontier/types';

describe('getBotConfig', () => {
  const originalEnv = process.env.TRIBE_ROLES;
  
  afterEach(() => {
    // Restore original environment variable
    if (originalEnv !== undefined) {
      process.env.TRIBE_ROLES = originalEnv;
    } else {
      delete process.env.TRIBE_ROLES;
    }
  });

  it('should return all roles when TRIBE_ROLES is not set', () => {
    delete process.env.TRIBE_ROLES;
    
    const config = getBotConfig();
    
    expect(config.availableRoles).toEqual(Object.values(FrontierRole));
    expect(config.availableRoles).toHaveLength(5);
  });

  it('should return all roles when TRIBE_ROLES is empty string', () => {
    process.env.TRIBE_ROLES = '';
    
    const config = getBotConfig();
    
    expect(config.availableRoles).toEqual(Object.values(FrontierRole));
  });

  it('should parse single valid role', () => {
    process.env.TRIBE_ROLES = 'Exploration';
    
    const config = getBotConfig();
    
    expect(config.availableRoles).toEqual([FrontierRole.Exploration]);
  });

  it('should parse multiple valid roles', () => {
    process.env.TRIBE_ROLES = 'Exploration,PVP,Mining';
    
    const config = getBotConfig();
    
    expect(config.availableRoles).toEqual([
      FrontierRole.Exploration,
      FrontierRole.PVP,
      FrontierRole.Mining
    ]);
  });

  it('should handle whitespace around role names', () => {
    process.env.TRIBE_ROLES = ' Exploration , PVP , Mining ';
    
    const config = getBotConfig();
    
    expect(config.availableRoles).toEqual([
      FrontierRole.Exploration,
      FrontierRole.PVP,
      FrontierRole.Mining
    ]);
  });

  it('should skip invalid roles and keep valid ones', () => {
    process.env.TRIBE_ROLES = 'Exploration,InvalidRole,PVP,AnotherBadRole,Mining';
    
    const config = getBotConfig();
    
    expect(config.availableRoles).toEqual([
      FrontierRole.Exploration,
      FrontierRole.PVP,
      FrontierRole.Mining
    ]);
  });

  it('should return all roles when no valid roles found', () => {
    process.env.TRIBE_ROLES = 'InvalidRole,AnotherBadRole';
    
    const config = getBotConfig();
    
    expect(config.availableRoles).toEqual(Object.values(FrontierRole));
  });

  it('should handle empty values in comma-separated list', () => {
    process.env.TRIBE_ROLES = 'Exploration,,PVP,';
    
    const config = getBotConfig();
    
    expect(config.availableRoles).toEqual([
      FrontierRole.Exploration,
      FrontierRole.PVP
    ]);
  });
});
