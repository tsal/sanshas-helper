import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, GuildMember, MessageFlags } from 'discord.js';
import { getBotConfig } from '../config';
import { findRoleByName } from './management';
import { getThemeMessage, MessageCategory } from '../themes';

/**
 * Role selection command interface
 */
export interface RoleCommand {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * Gets the appropriate emoji for a role based on danger level and theme
 * @param roleName - The name of the role
 * @returns The emoji string for the role
 */
const getRoleEmoji = (roleName: string): string => {
  switch (roleName.toLowerCase()) {
    case 'mining':
      return '🟢'; // Green - safe, low threat
    case 'industry':
      return '🟡'; // Yellow - caution, valuable targets
    case 'exploration':
      return '🟣'; // Purple - royalty/crucial role
    case 'pve':
      return '🟠'; // Orange - moderate danger
    case 'pvp':
      return '🔴'; // Red - maximum danger
    default:
      return '⚪'; // White circle for unknown roles
  }
};

/**
 * Schedules automatic deletion of an interaction reply after a specified timeout
 * @param interaction - The interaction whose reply should be deleted
 * @param timeoutMs - Time in milliseconds before deletion
 * @returns Promise that resolves when deletion completes
 */
const scheduleMessageDeletion = (
  interaction: ChatInputCommandInteraction | ButtonInteraction, 
  timeoutMs: number
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
        resolve();
      } catch (error) {
        // Message might already be deleted or interaction might be invalid
        // This is often expected behavior, so we resolve rather than reject
        resolve();
      }
    }, timeoutMs);
  });
};

/**
 * Creates button components for role selection
 * @returns Array of action rows containing role buttons
 */
export const createRoleButtons = (): ActionRowBuilder<ButtonBuilder>[] => {
  const config = getBotConfig();
  const buttons: ButtonBuilder[] = [];
  
  // Create a button for each configured available role
  config.availableRoles.forEach((role) => {
    const emoji = getRoleEmoji(role);
    const button = new ButtonBuilder()
      .setCustomId(`role_${role}`)
      .setLabel(`${emoji} ${role}`)
      .setStyle(ButtonStyle.Secondary);
    
    buttons.push(button);
  });
  
  // Discord allows max 5 buttons per row, so we might need multiple rows
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < buttons.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(buttons.slice(i, i + 5));
    rows.push(row);
  }
  
  return rows;
};

/**
 * Checks if a guild member has a specific role
 * @param member - The guild member to check
 * @param roleName - The name of the role to check for
 * @returns Promise that resolves to true if member has the role, false otherwise
 */
export const hasRole = async (member: GuildMember, roleName: string): Promise<boolean> => {
  if (!member.guild) {
    console.error(`hasRole: Member ${member.user.tag} is not in a guild`);
    return false;
  }
  
  const role = await findRoleByName(member.guild, roleName);
  if (!role) {
    console.error(`hasRole: Role "${roleName}" not found in guild ${member.guild.name}`);
    return false;
  }
  
  const hasTheRole = member.roles.cache.has(role.id);
  
  return hasTheRole;
};

/**
 * Toggles a role for a guild member (adds if they don't have it, removes if they do)
 * @param member - The guild member to toggle the role for
 * @param roleName - The name of the role to toggle
 * @returns Promise that resolves to 'added' or 'removed' based on the action taken
 * @throws Error if the role doesn't exist or the operation fails
 */
export const toggleRole = async (member: GuildMember, roleName: string): Promise<'added' | 'removed'> => {
  if (!member.guild) {
    throw new Error('Member is not in a guild');
  }
  
  const role = await findRoleByName(member.guild, roleName);
  if (!role) {
    throw new Error(`Role "${roleName}" not found in guild`);
  }
  
  const hasTheRole = await hasRole(member, roleName);
  
  if (hasTheRole) {
    // Remove the role
    await member.roles.remove(role, `Role removal requested by ${member.user.tag}`);
    return 'removed';
  } else {
    // Add the role
    await member.roles.add(role, `Role assignment requested by ${member.user.tag}`);
    return 'added';
  }
};

/**
 * Validates that the interaction is a role button interaction
 * @param interaction - The button interaction to validate
 * @returns The role name if valid, null if invalid
 */
const validateRoleInteraction = (interaction: ButtonInteraction): string | null => {
  if (!interaction.customId.startsWith('role_')) {
    return null;
  }
  
  // Extract role from custom ID (e.g., 'role_Exploration' -> 'Exploration')
  return interaction.customId.replace('role_', '');
};

/**
 * Checks if the role is supported for assignment
 * @param roleName - The name of the role to check
 * @returns True if the role is supported
 */
const isRoleSupported = (roleName: string): boolean => {
  const config = getBotConfig();
  return config.availableRoles.includes(roleName as any);
};

/**
 * Handles unsupported role button clicks
 * @param interaction - The button interaction
 * @param roleName - The name of the unsupported role
 */
const handleUnsupportedRole = async (interaction: ButtonInteraction, roleName: string): Promise<void> => {
  await interaction.reply({
    content: `${getThemeMessage(MessageCategory.WARNING).text} The "${roleName}" role is not yet accessible.`,
    flags: MessageFlags.Ephemeral
  });
};

/**
 * Handles the role toggle operation and sends response
 * @param interaction - The button interaction
 * @param member - The guild member
 * @param roleName - The name of the role to toggle
 */
const handleRoleToggle = async (interaction: ButtonInteraction, member: GuildMember, roleName: string): Promise<void> => {
  const action = await toggleRole(member, roleName);
  
  let message: string;
  if (action === 'added') {
    message = `${getThemeMessage(MessageCategory.ROLE_ASSIGNMENT).text} You have been assigned the **${roleName}** role.`;
  } else {
    message = `${getThemeMessage(MessageCategory.ROLE_REMOVAL).text} You have been removed from the **${roleName}** role.`;
  }
  
  // Send ephemeral response about the role change
  await interaction.reply({
    content: message,
    flags: MessageFlags.Ephemeral
  });
  
  // Schedule auto-deletion of the role change notification after 15 seconds
  scheduleMessageDeletion(interaction, 15 * 1000);
};

/**
 * Handles button interactions for role selection
 * Supports all configured roles and uses helper functions for clean organization
 * @param interaction - The button interaction to handle
 */
export const handleRoleButtonInteraction = async (interaction: ButtonInteraction): Promise<void> => {
  try {
    // Validate that this is a role button interaction
    const roleName = validateRoleInteraction(interaction);
    if (!roleName) {
      return;
    }
    
    // Check if the role is supported for assignment
    if (!isRoleSupported(roleName)) {
      await handleUnsupportedRole(interaction, roleName);
      return;
    }
    
    // Validate guild and member context
    if (!interaction.guild || !interaction.member) {
      await interaction.reply({
        content: getThemeMessage(MessageCategory.ERROR).text,
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    
    const member = interaction.member as GuildMember;
    
    // Handle the role toggle operation
    await handleRoleToggle(interaction, member, roleName);
    
  } catch (error) {
    console.error('Error handling role button interaction:', error);
    
    try {
      await interaction.reply({
        content: getThemeMessage(MessageCategory.ERROR).text,
        flags: MessageFlags.Ephemeral
      });
    } catch (replyError) {
      console.error('Failed to reply to interaction after error:', replyError);
    }
  }
};

/**
 * Role selection slash command
 * Presents an ephemeral message with buttons for each available role
 */
export const roleCommand: RoleCommand = {
  data: new SlashCommandBuilder()
    .setName(getBotConfig().rolesCommandName)
    .setDescription('Select your EVE Frontier roles'),
  
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const roleButtons = createRoleButtons();
      
      await interaction.reply({
        content: getThemeMessage(MessageCategory.GREETING).text,
        components: roleButtons,
        flags: MessageFlags.Ephemeral
      });
      
      // Schedule auto-dismissal of the role selection message after 1 minute
      scheduleMessageDeletion(interaction, 60 * 1000);
      
    } catch (error) {
      console.error('Error executing role command:', error);
      
      if (!interaction.replied) {
        await interaction.reply({
          content: getThemeMessage(MessageCategory.ERROR).text,
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
};
