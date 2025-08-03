import { OreIntelItem, isOreIntelItem } from '../types';

describe('OreIntelItem', () => {
  describe('isOreIntelItem', () => {
    it('should return true for valid ore intel item', () => {
      const validOreItem: OreIntelItem = {
        oreType: 'Pyroxeres',
        name: 'Rich Pyroxeres Site',
        systemName: 'Zarzakh',
        near: 'P1L4'
      };

      expect(isOreIntelItem(validOreItem)).toBe(true);
    });

    it('should return true for valid ore intel item with empty near field', () => {
      const validOreItem: OreIntelItem = {
        oreType: 'Kernite',
        name: 'Kernite Deposit Alpha',
        systemName: 'Jita',
        near: ''
      };

      expect(isOreIntelItem(validOreItem)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isOreIntelItem(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isOreIntelItem(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isOreIntelItem('string')).toBe(false);
      expect(isOreIntelItem(123)).toBe(false);
      expect(isOreIntelItem(true)).toBe(false);
    });

    it('should return false for missing oreType', () => {
      const invalidItem = {
        name: 'Test Site',
        systemName: 'Zarzakh',
        near: 'P1L4'
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });

    it('should return false for missing name', () => {
      const invalidItem = {
        oreType: 'Pyroxeres',
        systemName: 'Zarzakh',
        near: 'P1L4'
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });

    it('should return false for missing systemName', () => {
      const invalidItem = {
        oreType: 'Pyroxeres',
        name: 'Test Site',
        near: 'P1L4'
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });

    it('should return false for missing near', () => {
      const invalidItem = {
        oreType: 'Pyroxeres',
        name: 'Test Site',
        systemName: 'Zarzakh'
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });

    it('should return false for non-string oreType', () => {
      const invalidItem = {
        oreType: 123,
        name: 'Test Site',
        systemName: 'Zarzakh',
        near: 'P1L4'
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });

    it('should return false for non-string name', () => {
      const invalidItem = {
        oreType: 'Pyroxeres',
        name: null,
        systemName: 'Zarzakh',
        near: 'P1L4'
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });

    it('should return false for non-string systemName', () => {
      const invalidItem = {
        oreType: 'Pyroxeres',
        name: 'Test Site',
        systemName: undefined,
        near: 'P1L4'
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });

    it('should return false for non-string near', () => {
      const invalidItem = {
        oreType: 'Pyroxeres',
        name: 'Test Site',
        systemName: 'Zarzakh',
        near: false
      };

      expect(isOreIntelItem(invalidItem)).toBe(false);
    });
  });
});
