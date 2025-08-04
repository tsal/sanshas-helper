import { intelCommand, intel2Command } from '../command';
import { storeIntelItem, deleteIntelByIdFromInteraction } from '../types';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { RiftIntelTypeHandler } from '../handlers/rift-handler';
import { OreIntelTypeHandler } from '../handlers/ore-handler';
import { repository } from '../../database/repository';

// Mock the storeIntelItem and deleteIntelByIdFromInteraction functions
jest.mock('../types', () => ({
  ...jest.requireActual('../types'),
  storeIntelItem: jest.fn(),
  deleteIntelByIdFromInteraction: jest.fn()
}));

// Mock the repository
jest.mock('../../database/repository', () => ({
  repository: {
    getAll: jest.fn(() => Promise.resolve([])),
    purgeStaleItems: jest.fn(() => Promise.resolve(0)),
    store: jest.fn(() => Promise.resolve())
  }
}));

// Mock the themes
jest.mock('../../themes', () => ({
  getThemeMessage: jest.fn(() => ({ text: 'Test message' })),
  MessageCategory: {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
  }
}));

const mockStoreIntelItem = storeIntelItem as jest.MockedFunction<typeof storeIntelItem>;
const mockDeleteIntelByIdFromInteraction = deleteIntelByIdFromInteraction as jest.MockedFunction<typeof deleteIntelByIdFromInteraction>;
const mockRepositoryStore = repository.store as jest.MockedFunction<typeof repository.store>;

describe('Intel Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Command Structure', () => {
    it('should have ore subcommand with required parameters', () => {
      const commandData = intelCommand.data.toJSON();
      
      // Verify the command has the expected basic structure
      expect(commandData.name).toBe('intel');
      expect(commandData.description).toBe('🕵️ Manage intelligence reports');
      
      // Find the ore subcommand
      const oreSubcommand = commandData.options?.find(
        (option: any) => option.name === 'ore'
      );
      
      expect(oreSubcommand).toBeDefined();
      expect(oreSubcommand?.description).toBe('Add an ore site intel report');
      
      // Verify ore subcommand has the expected options
      const oreOptions = (oreSubcommand as any)?.options || [];
      expect(oreOptions.length).toBeGreaterThanOrEqual(3); // At least oretype, name, system
      
      const hasOreType = oreOptions.some((opt: any) => opt.name === 'oretype' && opt.required === true);
      const hasName = oreOptions.some((opt: any) => opt.name === 'name' && opt.required === true);
      const hasSystem = oreOptions.some((opt: any) => opt.name === 'system' && opt.required === true);
      const hasNear = oreOptions.some((opt: any) => opt.name === 'near' && opt.required === false);
      
      expect(hasOreType).toBe(true);
      expect(hasName).toBe(true);
      expect(hasSystem).toBe(true);
      expect(hasNear).toBe(true);
    });

    it('should have list subcommand with pages parameter', () => {
      const commandData = intelCommand.data.toJSON();
      
      // Find the list subcommand
      const listSubcommand = commandData.options?.find(
        (option: any) => option.name === 'list'
      );
      
      expect(listSubcommand).toBeDefined();
      expect(listSubcommand?.description).toBe('View current intelligence reports');
      
      // Verify list subcommand has the expected options
      const listOptions = (listSubcommand as any)?.options || [];
      expect(listOptions.length).toBe(2); // timeout and pages
      
      const timeoutOption = listOptions.find((opt: any) => opt.name === 'timeout');
      const pagesOption = listOptions.find((opt: any) => opt.name === 'pages');
      
      expect(timeoutOption).toBeDefined();
      expect(timeoutOption?.required).toBe(false);
      expect(timeoutOption?.min_value).toBe(1);
      expect(timeoutOption?.max_value).toBe(10);
      
      expect(pagesOption).toBeDefined();
      expect(pagesOption?.description).toBe('Number of pages to display (1-10, default: 1)');
      expect(pagesOption?.required).toBe(false);
      expect(pagesOption?.min_value).toBe(1);
      expect(pagesOption?.max_value).toBe(10);
    });
  });

  describe('Rift Subcommand Execution', () => {
    const mockInteraction = {
      guildId: '123456789012345678',
      user: { id: 'user123' },
      options: {
        getSubcommand: jest.fn(),
        getString: jest.fn()
      },
      reply: jest.fn()
    } as unknown as ChatInputCommandInteraction;

    beforeEach(() => {
      (mockInteraction.options.getSubcommand as jest.Mock).mockReturnValue('rift');
      (mockInteraction.reply as jest.Mock).mockResolvedValue(undefined);
      mockStoreIntelItem.mockResolvedValue(undefined);
    });

    it('should handle rift subcommand with all parameters', async () => {
      (mockInteraction.options.getString as jest.Mock)
        .mockReturnValueOnce('Unstable Wormhole')  // type
        .mockReturnValueOnce('Jita')               // system
        .mockReturnValueOnce('P1L4');              // near

      await intelCommand.execute(mockInteraction);

      expect(mockStoreIntelItem).toHaveBeenCalledWith(
        '123456789012345678',
        expect.objectContaining({
          id: expect.stringMatching(/^rift-\d+-[a-z0-9]+$/),
          timestamp: expect.any(String),
          reporter: 'user123',
          content: {
            type: 'Unstable Wormhole',
            systemName: 'Jita',
            near: 'P1L4'
          }
        })
      );

      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test message'
        })
      );
    });

    it('should handle rift subcommand with missing near parameter', async () => {
      (mockInteraction.options.getString as jest.Mock)
        .mockReturnValueOnce('Quantum Anomaly')   // type
        .mockReturnValueOnce('Amarr')             // system
        .mockReturnValueOnce(null);               // near (not provided)

      await intelCommand.execute(mockInteraction);

      expect(mockStoreIntelItem).toHaveBeenCalledWith(
        '123456789012345678',
        expect.objectContaining({
          content: {
            type: 'Quantum Anomaly',
            systemName: 'Amarr',
            near: ''  // Should default to empty string
          }
        })
      );
    });

    it('should handle missing guild ID', async () => {
      const noGuildInteraction = {
        ...mockInteraction,
        guildId: null
      } as unknown as ChatInputCommandInteraction;

      await intelCommand.execute(noGuildInteraction);

      expect(mockStoreIntelItem).not.toHaveBeenCalled();
      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test message'
        })
      );
    });
  });

  describe('List Subcommand Execution', () => {
    const mockInteraction = {
      guildId: '123456789012345678',
      user: { id: 'user123' },
      options: {
        getSubcommand: jest.fn(() => 'list'),
        getString: jest.fn(),
        getInteger: jest.fn(() => null) // Default timeout
      },
      reply: jest.fn()
    } as unknown as ChatInputCommandInteraction;

    beforeEach(() => {
      // Create a spy that captures all arguments
      const replyMock = jest.fn().mockResolvedValue(undefined);
      (mockInteraction.reply as jest.Mock) = replyMock;
    });

    it('should handle list subcommand', async () => {
      await intelCommand.execute(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test message',
          embeds: [],
          flags: expect.any(Number)
        })
      );
    });

    it('should extract pages parameter in list subcommand', async () => {
      // Mock getInteger to return different values for timeout and pages
      (mockInteraction.options.getInteger as jest.Mock)
        .mockReturnValueOnce(7)  // timeout
        .mockReturnValueOnce(3); // pages

      await intelCommand.execute(mockInteraction);

      // Verify getInteger was called for both parameters
      expect(mockInteraction.options.getInteger).toHaveBeenCalledWith('timeout');
      expect(mockInteraction.options.getInteger).toHaveBeenCalledWith('pages');
    });

    it('should handle pagination logic correctly', async () => {
      // Mock interaction with followUp method
      const mockFollowUp = jest.fn().mockResolvedValue({});
      const paginationInteraction = {
        ...mockInteraction,
        followUp: mockFollowUp
      } as unknown as ChatInputCommandInteraction;

      // Mock getInteger to return pages = 2
      (paginationInteraction.options.getInteger as jest.Mock)
        .mockReturnValueOnce(5)  // timeout
        .mockReturnValueOnce(2); // pages

      await intelCommand.execute(paginationInteraction);

      // Should call reply for first page
      expect(paginationInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test message',
          embeds: [],
          flags: expect.any(Number)
        })
      );

      // With empty intel items, should not call followUp
      expect(mockFollowUp).not.toHaveBeenCalled();
    });
  });

  describe('Del Subcommand Execution', () => {
    const mockInteraction = {
      guildId: '123456789012345678',
      user: { id: 'user123' },
      options: {
        getSubcommand: jest.fn(() => 'del'),
        getString: jest.fn()
      },
      reply: jest.fn()
    } as unknown as ChatInputCommandInteraction;

    beforeEach(() => {
      (mockInteraction.reply as jest.Mock).mockResolvedValue(undefined);
      mockDeleteIntelByIdFromInteraction.mockResolvedValue(undefined);
    });

    it('should handle del subcommand for rift type', async () => {
      (mockInteraction.options.getString as jest.Mock)
        .mockReturnValueOnce('rift')        // type
        .mockReturnValueOnce('rift-123-abc'); // id

      await intelCommand.execute(mockInteraction);

      expect(mockDeleteIntelByIdFromInteraction).toHaveBeenCalledWith(
        mockInteraction,
        '123456789012345678',
        'rift-123-abc'
      );
    });

    it('should handle del subcommand for unknown intel type', async () => {
      (mockInteraction.options.getString as jest.Mock)
        .mockReturnValueOnce('ship')         // type
        .mockReturnValueOnce('ship-123-abc'); // id

      await intelCommand.execute(mockInteraction);

      expect(mockDeleteIntelByIdFromInteraction).not.toHaveBeenCalled();
      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test message'
        })
      );
    });

    it('should handle errors from deleteIntelByIdFromInteraction', async () => {
      (mockInteraction.options.getString as jest.Mock)
        .mockReturnValueOnce('rift')        // type
        .mockReturnValueOnce('rift-123-abc'); // id
      
      mockDeleteIntelByIdFromInteraction.mockRejectedValue(new Error('Repository error'));

      await intelCommand.execute(mockInteraction);

      expect(mockDeleteIntelByIdFromInteraction).toHaveBeenCalled();
      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test message'
        })
      );
    });
  });
});

describe('Intel2Command', () => {
  describe('command structure', () => {
    it('should have correct name and description', () => {
      const commandData = intel2Command.data.toJSON();
      
      expect(commandData.name).toBe('intel2');
      expect(commandData.description).toBe('Manage intelligence reports using new plugin architecture');
    });
  });

  describe('registry integration', () => {
    it('should initialize with empty registry', () => {
      const registeredTypes = (intel2Command as any).getRegisteredTypes();
      
      expect(Array.isArray(registeredTypes)).toBe(true);
      expect(registeredTypes).toHaveLength(0);
    });

    it('should register and retrieve handlers correctly', () => {
      const riftHandler = new RiftIntelTypeHandler();
      const oreHandler = new OreIntelTypeHandler();
      
      (intel2Command as any).registerHandler('rift', riftHandler);
      (intel2Command as any).registerHandler('ore', oreHandler);
      
      const registeredTypes = (intel2Command as any).getRegisteredTypes();
      expect(registeredTypes).toHaveLength(2);
      expect(registeredTypes).toContain('rift');
      expect(registeredTypes).toContain('ore');
    });

    it('should generate dynamic subcommands based on registered handlers', () => {
      const riftHandler = new RiftIntelTypeHandler();
      const oreHandler = new OreIntelTypeHandler();
      
      (intel2Command as any).registerHandler('rift', riftHandler);
      (intel2Command as any).registerHandler('ore', oreHandler);
      
      const commandData = intel2Command.data.toJSON();
      
      expect(commandData.options).toBeDefined();
      expect(commandData.options).toHaveLength(2);
      
      const subcommands = commandData.options || [];
      const riftSubcommand = subcommands.find((sub: any) => sub.name === 'rift');
      const oreSubcommand = subcommands.find((sub: any) => sub.name === 'ore');
      
      expect(riftSubcommand).toBeDefined();
      expect(riftSubcommand?.description).toBe('Add a rift intel report');
      
      expect(oreSubcommand).toBeDefined();
      expect(oreSubcommand?.description).toBe('Add an ore site intel report');
    });
  });

  describe('execute method', () => {
    it('should execute complete flow with handler and store intel', async () => {
      // Setup mock handler with all required methods
      const mockHandler = {
        type: 'rift',
        description: 'Test rift handler',
        getCommandOptions: jest.fn().mockReturnValue([]),
        parseInteractionData: jest.fn().mockReturnValue({ type: 'inert', systemName: 'Test', near: 'P1L4' }),
        generateId: jest.fn().mockReturnValue('test-id-123'),
        createEmbed: jest.fn().mockReturnValue(new EmbedBuilder().setTitle('Test Embed')),
        validate: jest.fn().mockReturnValue(true),
        isOfType: (_content: unknown): _content is any => true,
        getSuccessMessage: jest.fn().mockReturnValue('Intel added successfully!')
      };

      // Register the mock handler using the interface method
      intel2Command.registerHandler!('rift', mockHandler);

      const mockInteraction = {
        options: {
          getSubcommand: jest.fn().mockReturnValue('rift')
        },
        guildId: '123456789012345678',
        user: { id: '987654321098765432' },
        reply: jest.fn().mockResolvedValue(undefined)
      } as unknown as ChatInputCommandInteraction;

      // Execute
      await intel2Command.execute(mockInteraction);

      // Verify handler methods called
      expect(mockHandler.parseInteractionData).toHaveBeenCalledWith(mockInteraction);
      expect(mockHandler.validate).toHaveBeenCalledWith({ type: 'inert', systemName: 'Test', near: 'P1L4' });
      expect(mockHandler.generateId).toHaveBeenCalled();
      expect(mockHandler.createEmbed).toHaveBeenCalled();
      expect(mockHandler.getSuccessMessage).toHaveBeenCalledWith({ type: 'inert', systemName: 'Test', near: 'P1L4' });

      // Verify repository store called
      expect(mockRepositoryStore).toHaveBeenCalled();

      // Verify Discord reply
      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: 'Intel added successfully!',
        embeds: [expect.any(EmbedBuilder)]
      });
    });

    it('should handle validation failure and respond with error', async () => {
      // Setup mock handler that fails validation
      const mockHandler = {
        type: 'rift',
        description: 'Test rift handler',
        getCommandOptions: jest.fn().mockReturnValue([]),
        parseInteractionData: jest.fn().mockReturnValue({ type: 'invalid', systemName: 'Test', near: 'P1L4' }),
        generateId: jest.fn().mockReturnValue('test-id-123'),
        createEmbed: jest.fn().mockReturnValue(new EmbedBuilder().setTitle('Test Embed')),
        validate: jest.fn().mockReturnValue(false), // Validation fails
        isOfType: (_content: unknown): _content is any => true,
        getSuccessMessage: jest.fn().mockReturnValue('Intel added successfully!')
      };

      // Register the mock handler
      intel2Command.registerHandler!('rift', mockHandler);

      const mockInteraction = {
        options: {
          getSubcommand: jest.fn().mockReturnValue('rift')
        },
        guildId: '123456789012345678',
        user: { id: '987654321098765432' },
        reply: jest.fn().mockResolvedValue(undefined)
      } as unknown as ChatInputCommandInteraction;

      // Execute
      await intel2Command.execute(mockInteraction);

      // Verify handler methods called up to validation
      expect(mockHandler.parseInteractionData).toHaveBeenCalledWith(mockInteraction);
      expect(mockHandler.validate).toHaveBeenCalledWith({ type: 'invalid', systemName: 'Test', near: 'P1L4' });

      // Verify these methods were NOT called after validation failure
      expect(mockHandler.createEmbed).not.toHaveBeenCalled();
      expect(mockHandler.getSuccessMessage).not.toHaveBeenCalled();

      // Verify repository store was NOT called
      expect(mockRepositoryStore).not.toHaveBeenCalled();

      // Verify error response
      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: 'Invalid rift intel provided.',
        ephemeral: true
      });
    });

    it('should handle handler exceptions gracefully. hand.', async () => {
      // Setup mock handler that throws an error
      const mockHandler = {
        type: 'rift',
        description: 'Test rift handler',
        getCommandOptions: jest.fn().mockReturnValue([]),
        parseInteractionData: jest.fn().mockImplementation(() => {
          throw new Error('Parse error');
        }),
        generateId: jest.fn().mockReturnValue('test-id-123'),
        createEmbed: jest.fn().mockReturnValue(new EmbedBuilder().setTitle('Test Embed')),
        validate: jest.fn().mockReturnValue(true),
        isOfType: (_content: unknown): _content is any => true,
        getSuccessMessage: jest.fn().mockReturnValue('Intel added successfully!')
      };

      // Register the mock handler
      intel2Command.registerHandler!('rift', mockHandler);

      const mockInteraction = {
        options: {
          getSubcommand: jest.fn().mockReturnValue('rift')
        },
        guildId: '123456789012345678',
        user: { id: '987654321098765432' },
        reply: jest.fn().mockResolvedValue(undefined),
        replied: false
      } as unknown as ChatInputCommandInteraction;

      // Mock console.error to verify error logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Execute
      await intel2Command.execute(mockInteraction);

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith('Error executing rift intel command:', expect.any(Error));

      // Verify error response
      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: 'Error processing rift intel: Parse error',
        ephemeral: true
      });

      // Cleanup
      consoleSpy.mockRestore();
    });

    it('should throw error for unregistered handler', async () => {
      const mockInteraction = {
        options: {
          getSubcommand: jest.fn(() => 'unknown')
        }
      } as any;
      
      await expect(intel2Command.execute(mockInteraction)).rejects.toThrow('No handler registered for intel type: unknown');
    });
  });
});
