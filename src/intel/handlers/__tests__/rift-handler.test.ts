import { RiftIntelTypeHandler } from '../rift-handler';

describe('RiftIntelTypeHandler', () => {
  let handler: RiftIntelTypeHandler;

  beforeEach(() => {
    handler = new RiftIntelTypeHandler();
  });

  it('should have correct type and description', () => {
    // Assert
    expect(handler.type).toBe('rift');
    expect(handler.description).toBe('Add a rift intel report');
  });

  it('should generate unique IDs with rift prefix', () => {
    // Act
    const id1 = handler.generateId();
    const id2 = handler.generateId();
    
    // Assert
    expect(id1).toMatch(/^rift-\d+-[a-z0-9]+$/);
    expect(id2).toMatch(/^rift-\d+-[a-z0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  it('should correctly identify rift intel content', () => {
    // Arrange
    const validRiftContent = {
      type: '0200',
      systemName: 'Thera',
      near: 'P1L4'
    };
    const invalidContent = {
      wrongField: 'value'
    };
    const nullContent = null;
    
    // Act & Assert
    expect(handler.isOfType(validRiftContent)).toBe(true);
    expect(handler.isOfType(invalidContent)).toBe(false);
    expect(handler.isOfType(nullContent)).toBe(false);
  });

  it('should validate rift content correctly', () => {
    // Arrange
    const validContent = {
      type: '0200',
      systemName: 'Thera',
      near: 'P1L4'
    };
    const validContentEmptyNear = {
      type: '0200',
      systemName: 'Thera',
      near: ''
    };
    const invalidEmptyType = {
      type: '',
      systemName: 'Thera',
      near: 'P1L4'
    };
    const invalidEmptySystem = {
      type: '0200',
      systemName: '',
      near: 'P1L4'
    };
    
    // Act & Assert
    expect(handler.validate(validContent)).toBe(true);
    expect(handler.validate(validContentEmptyNear)).toBe(true);
    expect(handler.validate(invalidEmptyType)).toBe(false);
    expect(handler.validate(invalidEmptySystem)).toBe(false);
  });

  it('should generate appropriate success message', () => {
    // Arrange
    const contentWithNear = {
      type: '0200',
      systemName: 'Thera',
      near: 'P1L4'
    };
    const contentWithoutNear = {
      type: '0200',
      systemName: 'Jita',
      near: ''
    };
    
    // Act & Assert
    expect(handler.getSuccessMessage(contentWithNear)).toBe('Rift intel added: 0200 in Thera near P1L4');
    expect(handler.getSuccessMessage(contentWithoutNear)).toBe('Rift intel added: 0200 in Jita');
  });

  it('should create rift embed correctly', () => {
    // Arrange
    const mockEntity = {
      guildId: 'test-guild',
      intelItem: {
        id: 'rift-123-abc',
        timestamp: '2025-08-04T12:00:00.000Z',
        reporter: 'user123',
        content: {
          type: '0200',
          systemName: 'Thera',
          near: 'P1L4'
        }
      }
    };
    
    // Act
    const embed = handler.createEmbed(mockEntity as any);
    const embedData = embed.toJSON();
    
    // Assert
    expect(embedData.title).toBe('🌌 Rift Intel: rift-123-abc');
    expect(embedData.color).toBe(0x8b5cf6);
    expect(embedData.timestamp).toBe('2025-08-04T12:00:00.000Z');
    expect(embedData.fields).toHaveLength(4);
    expect(embedData.fields![0]).toEqual({ name: 'Reporter', value: '<@user123>', inline: true });
    expect(embedData.fields![1]).toEqual({ name: 'Rift Type', value: '0200', inline: true });
    expect(embedData.fields![2]).toEqual({ name: 'System', value: 'Thera', inline: true });
    expect(embedData.fields![3]).toEqual({ name: 'Near Gravity Well', value: 'P1L4', inline: true });
  });

  it('should define correct command options', () => {
    // Act
    const options = handler.getCommandOptions();
    
    // Assert
    expect(options).toHaveLength(3);
    
    const typeOption = options[0];
    expect(typeOption.toJSON().name).toBe('type');
    expect(typeOption.toJSON().description).toBe('Rift type code');
    expect(typeOption.toJSON().required).toBe(true);
    
    const systemOption = options[1];
    expect(systemOption.toJSON().name).toBe('system');
    expect(systemOption.toJSON().description).toBe('System name where the rift is located');
    expect(systemOption.toJSON().required).toBe(true);
    
    const nearOption = options[2];
    expect(nearOption.toJSON().name).toBe('near');
    expect(nearOption.toJSON().description).toBe('What the rift is near (e.g., P1L4)');
    expect(nearOption.toJSON().required).toBe(false);
  });

  it('should parse interaction data correctly', () => {
    // Arrange
      const mockInteraction = {
        options: {
          getString: jest.fn((optionName: string) => {
            if (optionName === 'type') return '0200';
            if (optionName === 'system') return 'Thera';
            if (optionName === 'near') return 'P1L4';
            return null;
          })
        }
      } as any;

      const mockInteractionNoNear = {
        options: {
          getString: jest.fn((optionName: string) => {
            if (optionName === 'type') return '0200';
            if (optionName === 'system') return 'Jita';
            if (optionName === 'near') return null; // Not provided
            return null;
          })
        }
      } as any;
    
    // Act
    const resultWithNear = handler.parseInteractionData(mockInteraction);
    const resultWithoutNear = handler.parseInteractionData(mockInteractionNoNear);
    
    // Assert
    expect(resultWithNear).toEqual({
      type: '0200',
      systemName: 'Thera',
      near: 'P1L4'
    });
    
    expect(resultWithoutNear).toEqual({
      type: '0200',
      systemName: 'Jita',
      near: '' // Default to empty string
    });
  });
});
