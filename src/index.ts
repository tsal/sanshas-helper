import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import { checkManagementRole } from './discord';

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
  
  // Check management roles in all existing guilds
  console.log('Checking management roles in existing guilds...');
  for (const guild of client.guilds.cache.values()) {
    try {
      await checkManagementRole(guild);
      console.log(`Management role verified in guild: ${guild.name}`);
    } catch (error) {
      console.error(`Failed to verify management role in guild ${guild.name}:`, error);
    }
  }
  console.log('Management role check complete.');
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
    await checkManagementRole(guild);
    console.log(`Successfully set up management role in guild: ${guild.name}`);
  } catch (error) {
    console.error(`Failed to set up management role in guild ${guild.name}:`, error);
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
