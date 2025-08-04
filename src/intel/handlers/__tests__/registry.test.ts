import { IntelTypeRegistry } from '../registry';
import { IntelTypeHandler } from '../types';
import { IntelContentType } from '../../types';

// Mock intel content type for testing
interface MockIntelItem extends IntelContentType {
  testField: string;
}

// Create a minimal mock handler for testing
const createMockHandler = (type: string): IntelTypeHandler<MockIntelItem> => ({
  type,
  description: `Mock ${type} handler`,
  getCommandOptions: () => [],
  parseInteractionData: () => ({ testField: 'test' }),
  generateId: () => `${type}-test-id`,
  createEmbed: () => ({ toJSON: () => ({}) } as any),
  isOfType: (_content: unknown): _content is MockIntelItem => true,
  getSuccessMessage: () => `${type} added`
});

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
});
