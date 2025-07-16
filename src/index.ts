import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import { ensureAllRoles } from './discord';
import { roleCommand } from './discord/roles';
import { getBotConfig } from './config';
import { initializeThemes } from './themes';
import { isDatabaseEnabled, repository, Version, getBotVersion } from './database';

// Load environment variables
dotenv.config();

/**
 * Main Discord bot client instance
 */
const client: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

/**
 * Registers slash commands with Discord
 * @param clientId - The bot's client ID
 */
const registerCommands = async (clientId: string): Promise<void> => {
  const token: string | undefined = process.env.DISCORD_TOKEN;
  
  if (token === undefined) {
    throw new Error('DISCORD_TOKEN environment variable is not set');
  }
  
  const rest = new REST({ version: '10' }).setToken(token);
  
  try {
    console.log('Started refreshing application (/) commands.');
    
    const commands = [roleCommand.data.toJSON()];
    
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
};

/**
 * Updates version records for all guilds if database is enabled
 * Keeps timestamps fresh and updates version numbers if changed
 */
const updateVersionRecords = async (): Promise<void> => {
  const config = getBotConfig();
  
  // Only run if database is enabled and initialized
  if (!isDatabaseEnabled(config.databasePath)) {
    return;
  }
  
  try {
    const currentVersion = getBotVersion();
    
    // Update version record for each guild
    for (const guild of client.guilds.cache.values()) {
      const versionRecord = new Version(guild.id, currentVersion);
      await repository.store(versionRecord);
    }
  } catch (error) {
    console.error('Failed to update version records:', error);
  }
};

/**
 * Schedules periodic version updates every 12 hours
 */
const scheduleVersionUpdates = (): void => {
  const config = getBotConfig();
  
  // Only schedule if database is enabled
  if (!isDatabaseEnabled(config.databasePath)) {
    return;
  }
  
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  
  // Run immediately on startup
  updateVersionRecords();
  
  // Then every 12 hours
  setInterval(() => {
    updateVersionRecords();
  }, TWELVE_HOURS);
};

/**
 * Bot ready event handler
 * Logs when the bot successfully connects to Discord
 */
client.once('ready', async (): Promise<void> => {
  if (client.user === null) {
    console.error('Client user is null');
    return;
  }
  
  console.log(`Bot is ready! Logged in as ${client.user.tag}`);
  console.log(`Bot ID: ${client.user.id}`);
  console.log(`Serving ${client.guilds.cache.size} guilds`);
  
  // Register slash commands
  await registerCommands(client.user.id);
  
  // Initialize database if configured
  const config = getBotConfig();
  if (config.databasePath) {
    try {
      await repository.initialize({ databasePath: config.databasePath });
      console.log('Database initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize database, database features disabled:', error);
    }
  }
  
  // Check management roles in all existing guilds
  console.log('Setting up roles in existing guilds...');
  for (const guild of client.guilds.cache.values()) {
    try {
      const roles = await ensureAllRoles(guild);
      console.log(`Successfully ensured ${roles.length} roles exist in guild: ${guild.name}`);
    } catch (error) {
      console.error(`Failed to ensure roles in guild ${guild.name}:`, error);
    }
  }
  console.log('Role setup complete.');
  
  // Schedule periodic version updates (only if database is enabled)
  scheduleVersionUpdates();
});

/**
 * Error event handler
 * Logs any errors that occur with the Discord client
 */
client.on('error', (error: Error): void => {
  console.error('Discord client error:', error);
});

/**
 * Guild create event handler
 * Executes when the bot joins a new server
 */
client.on('guildCreate', async (guild): Promise<void> => {
  console.log(`Joined new guild: ${guild.name} (ID: ${guild.id})`);
  
  try {
    const roles = await ensureAllRoles(guild);
    console.log(`Successfully set up ${roles.length} roles in guild: ${guild.name}`);
  } catch (error) {
    console.error(`Failed to set up roles in guild ${guild.name}:`, error);
  }
});

/**
 * Interaction create event handler
 * Handles slash commands - button interactions are now handled by InteractionCollector
 */
client.on('interactionCreate', async (interaction): Promise<void> => {
  try {
    if (interaction.isChatInputCommand()) {
      // Handle slash commands
      const config = getBotConfig();
      if (interaction.commandName === config.rolesCommandName) {
        await roleCommand.execute(interaction);
      }
    }
    // Button interactions are now handled by InteractionCollector in roleCommand
  } catch (error) {
    console.error('Error handling interaction:', error);
    
    try {
      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'An error occurred while processing your request.',
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Failed to send error reply:', replyError);
    }
  }
});

/**
 * Graceful shutdown handler
 * Properly closes the Discord client connection
 */
const gracefulShutdown = async (): Promise<void> => {
  console.log('Shutting down bot gracefully...');
  
  try {
    await client.destroy();
    console.log('Bot disconnected successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Register process signal handlers
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

/**
 * Start the bot
 * Logs in using the Discord token from environment variables
 */
const startBot = async (): Promise<void> => {
  const token: string | undefined = process.env.DISCORD_TOKEN;
  
  if (token === undefined) {
    console.error('DISCORD_TOKEN environment variable is not set');
    process.exit(1);
  }

  // Initialize theme system
  initializeThemes();
  
  try {
    await client.login(token);
  } catch (error) {
    console.error('Failed to login to Discord:', error);
    process.exit(1);
  }
};

// Start the bot
startBot().catch((error: unknown): void => {
  console.error('Unexpected error starting bot:', error);
  process.exit(1);
});
