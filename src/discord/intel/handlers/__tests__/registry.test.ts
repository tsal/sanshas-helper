import { IntelTypeRegistry } from '../registry';
import { IntelTypeHandler } from '../types';
import { IntelContentType } from '../../types';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

// Mock intel content type for testing
interface MockIntelItem extends IntelContentType {
  testField: string;
}

// Create a minimal mock handler class for testing
class MockHandler extends IntelTypeHandler<MockIntelItem> {
  readonly type: string;
  readonly description: string;

  constructor(type: string) {
    super();
    this.type = type;
    this.description = `Mock ${type} handler`;
  }

  getCommandOptions() {
    return [];
  }

  parseInteractionData(_interaction: ChatInputCommandInteraction): MockIntelItem {
    return { testField: 'test' };
  }

  createEmbed(): EmbedBuilder {
    return { toJSON: () => ({}) } as any;
  }

  isOfType(_content: unknown): _content is MockIntelItem {
    return true;
  }

  getSuccessMessage(): string {
    return `${this.type} added`;
  }
}

// Create a minimal mock handler for testing
const createMockHandler = (type: string): IntelTypeHandler<MockIntelItem> => new MockHandler(type);

describe('IntelTypeRegistry', () => {
  let registry: IntelTypeRegistry;

  beforeEach(() => {
    registry = new IntelTypeRegistry();
  });

  it('should register and retrieve handlers', () => {
    // Arrange
    const mockHandler = createMockHandler('test');
    
    // Act
    registry.register('test', mockHandler);
    const retrievedHandler = registry.getHandler('test');
    
    // Assert
    expect(retrievedHandler).toBe(mockHandler);
    expect(retrievedHandler?.type).toBe('test');
  });

  it('should return undefined for unregistered types', () => {
    // Act
    const retrievedHandler = registry.getHandler('nonexistent');
    
    // Assert
    expect(retrievedHandler).toBeUndefined();
  });

  it('should check if handler exists', () => {
    // Arrange
    const mockHandler = createMockHandler('exists');
    registry.register('exists', mockHandler);
    
    // Act & Assert
    expect(registry.hasHandler('exists')).toBe(true);
    expect(registry.hasHandler('nonexistent')).toBe(false);
  });

  it('should list registered types', () => {
    // Arrange
    const handler1 = createMockHandler('type1');
    const handler2 = createMockHandler('type2');
    registry.register('type1', handler1);
    registry.register('type2', handler2);
    
    // Act
    const registeredTypes = registry.getRegisteredTypes();
    
    // Assert
    expect(registeredTypes).toHaveLength(2);
    expect(registeredTypes).toContain('type1');
    expect(registeredTypes).toContain('type2');
  });

  it('should check if type is supported', () => {
    // Arrange
    const mockHandler = createMockHandler('supported');
    registry.register('supported', mockHandler);
    
    // Act & Assert
    expect(registry.isSupportedType('supported')).toBe(true);
    expect(registry.isSupportedType('unsupported')).toBe(false);
  });

  it('should generate unique IDs between multiple handler instances', () => {
    // Arrange
    const handler1 = createMockHandler('unique');
    const handler2 = createMockHandler('unique');
    
    // Act - Generate multiple IDs from both instances
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(handler1.generateId());
      ids.add(handler2.generateId());
    }
    
    // Assert - All IDs should be unique (no collisions)
    expect(ids.size).toBe(200); // 100 IDs from each handler = 200 unique IDs
  });
});
