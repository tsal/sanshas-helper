import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandStringOption } from 'discord.js';
import { IntelTypeHandler, SlashCommandOptionBuilder } from './types';
import { FleetIntelItem, IntelEntity } from '../types';

/**
 * Handler for fleet intel type
 * Manages fleet intelligence reports including tribe identification and composition
 */
export class FleetIntelTypeHandler extends IntelTypeHandler<FleetIntelItem> {
  readonly type = 'fleet';
  readonly description = 'Add a fleet intel report';

  getCommandOptions(): SlashCommandOptionBuilder[] {
    return [
      new SlashCommandStringOption()
        .setName('tribename')
        .setDescription('Name or identifier of the fleet/tribe')
        .setRequired(true),
      new SlashCommandStringOption()
        .setName('comp')
        .setDescription('Fleet composition details')
        .setRequired(true),
      new SlashCommandStringOption()
        .setName('system')
        .setDescription('System name where the fleet is located')
        .setRequired(true),
      new SlashCommandStringOption()
        .setName('near')
        .setDescription('What the fleet is near (e.g., P1L4)')
        .setRequired(true),
      new SlashCommandStringOption()
        .setName('standing')
        .setDescription('Relationship status (e.g., good, bad, neutral)')
        .setRequired(false)
    ];
  }

  parseInteractionData(interaction: ChatInputCommandInteraction): FleetIntelItem {
    const tribeName = interaction.options.getString('tribename', true);
    const comp = interaction.options.getString('comp', true);
    const system = interaction.options.getString('system', true);
    const near = interaction.options.getString('near', true);
    const standing = interaction.options.getString('standing') || '';

    return {
      tribeName,
      comp,
      system,
      near,
      standing
    };
  }

  createEmbed(entity: IntelEntity): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`⚔️ Fleet Intel: ${entity.intelItem.id}`)
      .setTimestamp(new Date(entity.intelItem.timestamp))
      .setColor(0xef4444);
    
    embed.addFields({ name: 'Reporter', value: `<@${entity.intelItem.reporter}>`, inline: true });
    
    const fleetContent = entity.intelItem.content as FleetIntelItem;
    const nearValue = fleetContent.near.trim() === '' ? '*( empty )*' : fleetContent.near;
    const standingValue = fleetContent.standing.trim() === '' ? '*( empty )*' : fleetContent.standing;
    
    embed.addFields(
      { name: 'Tribe/Fleet', value: fleetContent.tribeName, inline: true },
      { name: 'Composition', value: fleetContent.comp, inline: true },
      { name: 'System', value: fleetContent.system, inline: true },
      { name: 'Near', value: nearValue, inline: true },
      { name: 'Standing', value: standingValue, inline: true }
    );
    
    if (entity.intelItem.location) {
      embed.addFields({ name: 'Location', value: entity.intelItem.location, inline: true });
    }
    
    return embed;
  }

  isOfType(content: unknown): content is FleetIntelItem {
    if (typeof content !== 'object' || content === null) {
      return false;
    }
    
    const obj = content as Record<string, unknown>;
    return typeof obj.tribeName === 'string' && 
           typeof obj.comp === 'string' &&
           typeof obj.system === 'string' && 
           typeof obj.near === 'string' &&
           typeof obj.standing === 'string';
  }

  getSuccessMessage(content: FleetIntelItem): string {
    return `Fleet intel added: ${content.tribeName} in ${content.system}${content.near ? ` near ${content.near}` : ''}`;
  }
}
