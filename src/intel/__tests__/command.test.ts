import { intelCommand } from '../command';
import { storeIntelItem, deleteIntelByIdFromInteraction } from '../types';
import { ChatInputCommandInteraction } from 'discord.js';

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
    purgeStaleItems: jest.fn(() => Promise.resolve(0))
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

describe('Intel Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
