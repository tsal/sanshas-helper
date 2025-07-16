import { getBotConfig, ResponseTheme } from '../types';
import { Role as FrontierRole } from '../../frontier/types';

describe('getBotConfig', () => {
  const originalEnv = {
    TRIBE_ROLES: process.env.TRIBE_ROLES,
    RESPONSE_THEME: process.env.RESPONSE_THEME
  };
  
  afterEach(() => {
    // Restore original environment variables
    if (originalEnv.TRIBE_ROLES !== undefined) {
      process.env.TRIBE_ROLES = originalEnv.TRIBE_ROLES;
    } else {
      delete process.env.TRIBE_ROLES;
    }
    
    if (originalEnv.RESPONSE_THEME !== undefined) {
      process.env.RESPONSE_THEME = originalEnv.RESPONSE_THEME;
    } else {
      delete process.env.RESPONSE_THEME;
    }
  });

  it('should return all roles when TRIBE_ROLES is not set', () => {
    delete process.env.TRIBE_ROLES;
    delete process.env.RESPONSE_THEME;
    
    const config = getBotConfig();
    
    expect(config.availableRoles).toEqual(Object.values(FrontierRole));
    expect(config.availableRoles).toHaveLength(8);
    expect(config.responseTheme).toBe(ResponseTheme.KUVAKEI);
  });

  it('should return all roles when TRIBE_ROLES is empty string', () => {
    process.env.TRIBE_ROLES = '';
    delete process.env.RESPONSE_THEME;
    
    const config = getBotConfig();
    
    expect(config.availableRoles).toEqual(Object.values(FrontierRole));
    expect(config.responseTheme).toBe(ResponseTheme.KUVAKEI);
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

  describe('Response Theme Configuration', () => {
    it('should default to kuvakei theme when RESPONSE_THEME is not set', () => {
      delete process.env.RESPONSE_THEME;
      
      const config = getBotConfig();
      
      expect(config.responseTheme).toBe(ResponseTheme.KUVAKEI);
    });

    it('should use kuvakei theme when set explicitly', () => {
      process.env.RESPONSE_THEME = 'kuvakei';
      
      const config = getBotConfig();
      
      expect(config.responseTheme).toBe(ResponseTheme.KUVAKEI);
    });

    it('should use triglav theme when set explicitly', () => {
      process.env.RESPONSE_THEME = 'triglav';
      
      const config = getBotConfig();
      
      expect(config.responseTheme).toBe(ResponseTheme.TRIGLAV);
    });

    it('should handle case insensitive theme names', () => {
      process.env.RESPONSE_THEME = 'TRIGLAV';
      
      const config = getBotConfig();
      
      expect(config.responseTheme).toBe(ResponseTheme.TRIGLAV);
    });

    it('should fall back to kuvakei for invalid theme names', () => {
      process.env.RESPONSE_THEME = 'invalid_theme';
      
      const config = getBotConfig();
      
      expect(config.responseTheme).toBe(ResponseTheme.KUVAKEI);
    });
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
