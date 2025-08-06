import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandStringOption } from 'discord.js';
import { IntelTypeHandler, SlashCommandOptionBuilder } from './types';
import { OreIntelItem, IntelEntity } from '../types';

/**
 * Handler for ore intel type
 * Manages ore site intelligence reports including resource locations and types
 */
export class OreIntelTypeHandler extends IntelTypeHandler<OreIntelItem> {
  readonly type = 'ore';
  readonly description = 'Add an ore site intel report';

  getCommandOptions(): SlashCommandOptionBuilder[] {
    return [
      new SlashCommandStringOption()
        .setName('oretype')
        .setDescription('Type of ore resource (e.g., carbon, metal, common)')
        .setRequired(true),
      new SlashCommandStringOption()
        .setName('name')
        .setDescription('Name of the ore site (e.g., Carbon Debris Cluster)')
        .setRequired(true),
      new SlashCommandStringOption()
        .setName('system')
        .setDescription('System name where the ore site is located')
        .setRequired(true),
      new SlashCommandStringOption()
        .setName('near')
        .setDescription('What the ore site is near (e.g., P1L4)')
        .setRequired(false)
    ];
  }

  parseInteractionData(interaction: ChatInputCommandInteraction): OreIntelItem {
    const oreType = interaction.options.getString('oretype', true);
    const name = interaction.options.getString('name', true);
    const system = interaction.options.getString('system', true);
    const near = interaction.options.getString('near') || ''; // Default to empty string if not provided
    
    return {
      oreType,
      name,
      systemName: system,
      near
    };
  }

  createEmbed(entity: IntelEntity): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`⛏️ Ore Site Intel: ${entity.intelItem.id}`)
      .setTimestamp(new Date(entity.intelItem.timestamp))
      .setColor(0xf59e0b);
    
    embed.addFields({ name: 'Reporter', value: `<@${entity.intelItem.reporter}>`, inline: true });
    
    const oreContent = entity.intelItem.content as OreIntelItem;
    const nearValue = oreContent.near.trim() === '' ? '*( empty )*' : oreContent.near;
    embed.addFields(
      { name: 'Ore Type', value: oreContent.oreType, inline: true },
      { name: 'Site Name', value: oreContent.name, inline: true },
      { name: 'System', value: oreContent.systemName, inline: true },
      { name: 'Near Gravity Well', value: nearValue, inline: true }
    );
    
    if (entity.intelItem.location) {
      embed.addFields({ name: 'Location', value: entity.intelItem.location, inline: true });
    }
    
    return embed;
  }

  isOfType(content: unknown): content is OreIntelItem {
    if (typeof content !== 'object' || content === null) {
      return false;
    }
    
    const obj = content as Record<string, unknown>;
    return typeof obj.oreType === 'string' && 
           typeof obj.name === 'string' &&
           typeof obj.systemName === 'string' && 
           typeof obj.near === 'string';
  }

  getSuccessMessage(content: OreIntelItem): string {
    return `Ore site intel added: ${content.name} (${content.oreType}) in ${content.systemName}${content.near ? ` near ${content.near}` : ''}`;
  }
}
