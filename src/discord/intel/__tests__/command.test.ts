import { intelCommand } from '../command';
import { storeIntelItem, deleteIntelByIdFromInteraction } from '../types';
import { ChatInputCommandInteraction } from 'discord.js';
import { RiftIntelTypeHandler } from '../handlers/rift-handler';
import { OreIntelTypeHandler } from '../handlers/ore-handler';

// Mock the storeIntelItem and deleteIntelByIdFromInteraction functions
jest.mock('../types', () => ({
  ...jest.requireActual('../types'),
  storeIntelItem: jest.fn(),
  deleteIntelByIdFromInteraction: jest.fn()
}));

// Mock the themes
jest.mock('../../../themes', () => ({
  getThemeMessage: jest.fn(() => ({ text: 'Test message' })),
  MessageCategory: {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
  }
}));

const mockStoreIntelItem = storeIntelItem as jest.MockedFunction<typeof storeIntelItem>;
const mockDeleteIntelByIdFromInteraction = deleteIntelByIdFromInteraction as jest.MockedFunction<typeof deleteIntelByIdFromInteraction>;

describe('Intel Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Register handlers for tests (similar to main application)
    intelCommand.registerHandler('rift', new RiftIntelTypeHandler());
    intelCommand.registerHandler('ore', new OreIntelTypeHandler());
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
          id: expect.stringMatching(/^rift-[a-z0-9]+$/),
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

    it('should handle invalid ID format without dash', async () => {
      (mockInteraction.options.getString as jest.Mock)
        .mockReturnValueOnce('invalidid'); // id without dash

      await intelCommand.execute(mockInteraction);

      expect(mockDeleteIntelByIdFromInteraction).not.toHaveBeenCalled();
      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test message'
        })
      );
    });
  });
});
