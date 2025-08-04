import { OreIntelTypeHandler } from '../ore-handler';
import { SlashCommandStringOption } from 'discord.js';
import { IntelEntity, OreIntelItem, IntelItem } from '../../types';

describe('OreIntelTypeHandler', () => {
  let handler: OreIntelTypeHandler;

  beforeEach(() => {
    handler = new OreIntelTypeHandler();
  });

  describe('basic properties', () => {
    it('should have correct type and description', () => {
      expect(handler.type).toBe('ore');
      expect(handler.description).toBe('Add an ore site intel report');
    });
  });

  describe('getCommandOptions', () => {
    it('should return correct command options for ore intel', () => {
      const options = handler.getCommandOptions();
      
      expect(options).toHaveLength(4);
      expect(options[0]).toBeInstanceOf(SlashCommandStringOption);
      expect(options[1]).toBeInstanceOf(SlashCommandStringOption);
      expect(options[2]).toBeInstanceOf(SlashCommandStringOption);
      expect(options[3]).toBeInstanceOf(SlashCommandStringOption);
      
      // Check option names by converting to JSON
      const optionsData = options.map(opt => opt.toJSON());
      expect(optionsData[0].name).toBe('oretype');
      expect(optionsData[0].description).toBe('Type of ore resource (e.g., carbon, metal, common)');
      expect(optionsData[0].required).toBe(true);
      
      expect(optionsData[1].name).toBe('name');
      expect(optionsData[1].description).toBe('Name of the ore site (e.g., Carbon Debris Cluster)');
      expect(optionsData[1].required).toBe(true);
      
      expect(optionsData[2].name).toBe('system');
      expect(optionsData[2].description).toBe('System name where the ore site is located');
      expect(optionsData[2].required).toBe(true);
      
      expect(optionsData[3].name).toBe('near');
      expect(optionsData[3].description).toBe('What the ore site is near (e.g., P1L4)');
      expect(optionsData[3].required).toBe(false);
    });
  });

  describe('generateId', () => {
    it('should generate ID with correct ore prefix and format', () => {
      const id = handler.generateId();
      
      expect(id).toMatch(/^ore-\d+-[a-z0-9]{9}$/);
      expect(id.startsWith('ore-')).toBe(true);
      
      // Verify uniqueness by generating multiple IDs
      const id2 = handler.generateId();
      expect(id).not.toBe(id2);
    });
  });

  describe('createEmbed', () => {
    it('should create embed with correct structure and ore content', () => {
      const oreContent: OreIntelItem = {
        oreType: 'carbon',
        name: 'Carbon Debris Cluster',
        systemName: 'Zarzakh',
        near: 'P1L4'
      };
      
      const intelItem: IntelItem = {
        id: 'ore-test-123',
        timestamp: '2025-08-02T15:30:00.000Z',
        reporter: '123456789012345678',
        content: oreContent,
        location: 'Test Location'
      };
      
      const entity = new IntelEntity('test-guild', intelItem);
      const embed = handler.createEmbed(entity);
      
      expect(embed.data.title).toBe('⛏️ Ore Site Intel: ore-test-123');
      expect(embed.data.color).toBe(0xf59e0b);
      expect(embed.data.timestamp).toBe('2025-08-02T15:30:00.000Z');
      
      const fields = embed.data.fields || [];
      expect(fields).toHaveLength(6);
      expect(fields[0].name).toBe('Reporter');
      expect(fields[0].value).toBe('<@123456789012345678>');
      expect(fields[1].name).toBe('Ore Type');
      expect(fields[1].value).toBe('carbon');
      expect(fields[2].name).toBe('Site Name');
      expect(fields[2].value).toBe('Carbon Debris Cluster');
      expect(fields[3].name).toBe('System');
      expect(fields[3].value).toBe('Zarzakh');
      expect(fields[4].name).toBe('Near Gravity Well');
      expect(fields[4].value).toBe('P1L4');
      expect(fields[5].name).toBe('Location');
      expect(fields[5].value).toBe('Test Location');
    });
  });

  describe('validate', () => {
    it('should validate ore intel content correctly', () => {
      const validContent: OreIntelItem = {
        oreType: 'carbon',
        name: 'Carbon Debris Cluster',
        systemName: 'Zarzakh',
        near: 'P1L4'
      };
      
      expect(handler.validate(validContent)).toBe(true);
      
      // Test with empty near (should still be valid)
      const validWithEmptyNear: OreIntelItem = {
        oreType: 'metal',
        name: 'Metal Rich Belt',
        systemName: 'Jita',
        near: ''
      };
      
      expect(handler.validate(validWithEmptyNear)).toBe(true);
      
      // Test invalid cases
      expect(handler.validate({ oreType: '', name: 'Test', systemName: 'Test', near: '' } as OreIntelItem)).toBe(false);
      expect(handler.validate({ oreType: 'carbon', name: '', systemName: 'Test', near: '' } as OreIntelItem)).toBe(false);
      expect(handler.validate({ oreType: 'carbon', name: 'Test', systemName: '', near: '' } as OreIntelItem)).toBe(false);
    });
  });

  describe('isOfType', () => {
    it('should correctly identify OreIntelItem type', () => {
      const validOreItem = {
        oreType: 'carbon',
        name: 'Carbon Debris Cluster',
        systemName: 'Zarzakh',
        near: 'P1L4'
      };
      
      expect(handler.isOfType(validOreItem)).toBe(true);
      
      // Test with empty near (should still be valid)
      const validWithEmptyNear = {
        oreType: 'metal',
        name: 'Metal Rich Belt',
        systemName: 'Jita',
        near: ''
      };
      
      expect(handler.isOfType(validWithEmptyNear)).toBe(true);
      
      // Test invalid cases
      expect(handler.isOfType(null)).toBe(false);
      expect(handler.isOfType(undefined)).toBe(false);
      expect(handler.isOfType('string')).toBe(false);
      expect(handler.isOfType({})).toBe(false);
      expect(handler.isOfType({ oreType: 'carbon' })).toBe(false); // missing fields
      expect(handler.isOfType({ oreType: 123, name: 'Test', systemName: 'Test', near: 'Test' })).toBe(false); // wrong type
    });
  });

  describe('getSuccessMessage', () => {
    it('should generate correct success messages', () => {
      const contentWithNear: OreIntelItem = {
        oreType: 'carbon',
        name: 'Carbon Debris Cluster',
        systemName: 'Zarzakh',
        near: 'P1L4'
      };
      
      const messageWithNear = handler.getSuccessMessage(contentWithNear);
      expect(messageWithNear).toBe('Ore site intel added: Carbon Debris Cluster (carbon) in Zarzakh near P1L4');
      
      const contentWithoutNear: OreIntelItem = {
        oreType: 'metal',
        name: 'Metal Rich Belt',
        systemName: 'Jita',
        near: ''
      };
      
      const messageWithoutNear = handler.getSuccessMessage(contentWithoutNear);
      expect(messageWithoutNear).toBe('Ore site intel added: Metal Rich Belt (metal) in Jita');
    });
  });

  describe('parseInteractionData', () => {
    it('should parse interaction data correctly', () => {
      const mockInteraction = {
        options: {
          getString: jest.fn((optionName: string) => {
            if (optionName === 'oretype') return 'carbon';
            if (optionName === 'name') return 'Carbon Debris Cluster';
            if (optionName === 'system') return 'Zarzakh';
            if (optionName === 'near') return 'P1L4';
            return null;
          })
        }
      } as any;

      const mockInteractionNoNear = {
        options: {
          getString: jest.fn((optionName: string) => {
            if (optionName === 'oretype') return 'metal';
            if (optionName === 'name') return 'Metal Rich Belt';
            if (optionName === 'system') return 'Jita';
            if (optionName === 'near') return null; // Not provided
            return null;
          })
        }
      } as any;
      
      // Test with near parameter
      const resultWithNear = handler.parseInteractionData(mockInteraction);
      expect(resultWithNear).toEqual({
        oreType: 'carbon',
        name: 'Carbon Debris Cluster',
        systemName: 'Zarzakh',
        near: 'P1L4'
      });
      
      // Test without near parameter
      const resultWithoutNear = handler.parseInteractionData(mockInteractionNoNear);
      expect(resultWithoutNear).toEqual({
        oreType: 'metal',
        name: 'Metal Rich Belt',
        systemName: 'Jita',
        near: ''
      });
    });
  });
});
