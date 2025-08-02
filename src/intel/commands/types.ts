import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

/**
 * Intel command interface for Discord interactions
 * "Every detective needs the right tools for the job."
 */
export interface IntelCommand {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * Intel subcommand types
 * "We're keeping it simple for now, detective - just the basics until we crack this case."
 * TODO: Stub for future iterations - will expand when implementing subcommands
 */
export type IntelSubcommand = 'add' | 'list';

/**
 * Intel command options interface
 * "The details matter in every investigation."
 * TODO: Will be used when subcommands are implemented
 */
export interface IntelCommandOptions {
  subcommand: IntelSubcommand;
  data?: string;
}

/**
 * Intel command execution result
 * "Every operation needs a proper report."
 */
export interface IntelCommandResult {
  success: boolean;
  message: string;
  itemsProcessed?: number;
}
