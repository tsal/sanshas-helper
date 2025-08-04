import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandStringOption } from 'discord.js';
import { IntelTypeHandler, SlashCommandOptionBuilder } from '../index';
import { IntelContentType, IntelEntity } from '../../types';

// Mock intel content type for testing
interface MockIntelItem extends IntelContentType {
  testField: string;
}

// Mock implementation of IntelTypeHandler for testing
class MockIntelTypeHandler implements IntelTypeHandler<MockIntelItem> {
  readonly type = 'mock';
  readonly description = 'Mock intel type for testing';

  getCommandOptions(): SlashCommandOptionBuilder[] {
    return [
      new SlashCommandStringOption()
        .setName('testfield')
        .setDescription('Test field')
        .setRequired(true)
    ];
  }

  parseInteractionData(interaction: ChatInputCommandInteraction): MockIntelItem {
    const testField = interaction.options.getString('testfield', true);
    return { testField };
  }

  generateId(): string {
    return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  createEmbed(entity: IntelEntity): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`Mock Intel: ${entity.intelItem.id}`)
      .setColor(0x00ff00);
    
    const content = entity.intelItem.content as MockIntelItem;
    embed.addFields({ name: 'Test Field', value: content.testField });
    
    return embed;
  }

  validate(content: MockIntelItem): boolean {
    return typeof content.testField === 'string' && content.testField.length > 0;
  }

  isOfType(content: unknown): content is MockIntelItem {
    if (typeof content !== 'object' || content === null) {
      return false;
    }
    const obj = content as Record<string, unknown>;
    return typeof obj.testField === 'string';
  }

  getSuccessMessage(content: MockIntelItem): string {
    return `Mock intel added: ${content.testField}`;
  }
}

describe('IntelTypeHandler Interface', () => {
  let mockHandler: MockIntelTypeHandler;

  beforeEach(() => {
    mockHandler = new MockIntelTypeHandler();
  });

  it('should have correct type and description', () => {
    expect(mockHandler.type).toBe('mock');
    expect(mockHandler.description).toBe('Mock intel type for testing');
  });

  it('should generate unique IDs with correct prefix', () => {
    const id1 = mockHandler.generateId();
    const id2 = mockHandler.generateId();
    
    expect(id1).toMatch(/^mock-\d+-[a-z0-9]+$/);
    expect(id2).toMatch(/^mock-\d+-[a-z0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  it('should validate content correctly', () => {
    const validContent: MockIntelItem = { testField: 'valid' };
    const invalidContent: MockIntelItem = { testField: '' };
    
    expect(mockHandler.validate(validContent)).toBe(true);
    expect(mockHandler.validate(invalidContent)).toBe(false);
  });

  it('should correctly identify content type', () => {
    const validContent = { testField: 'test' };
    const invalidContent = { wrongField: 'test' };
    const nullContent = null;
    
    expect(mockHandler.isOfType(validContent)).toBe(true);
    expect(mockHandler.isOfType(invalidContent)).toBe(false);
    expect(mockHandler.isOfType(nullContent)).toBe(false);
  });

  it('should generate appropriate success message', () => {
    const content: MockIntelItem = { testField: 'test value' };
    const message = mockHandler.getSuccessMessage(content);
    
    expect(message).toBe('Mock intel added: test value');
  });

  it('should return command options array', () => {
    const options = mockHandler.getCommandOptions();
    
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBeGreaterThan(0);
  });
});
