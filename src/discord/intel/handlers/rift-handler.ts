import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandStringOption } from 'discord.js';
import { IntelTypeHandler, SlashCommandOptionBuilder } from './types';
import { RiftIntelItem, IntelEntity } from '../types';

/**
 * Handler for rift intel type
 * Manages rift intelligence reports including wormhole anomalies and space rifts
 */
export class RiftIntelTypeHandler extends IntelTypeHandler<RiftIntelItem> {
  readonly type = 'rift';
  readonly description = 'Add a rift intel report';

  getCommandOptions(): SlashCommandOptionBuilder[] {
    return [
      new SlashCommandStringOption()
        .setName('type')
        .setDescription('Rift type code')
        .setRequired(true),
      new SlashCommandStringOption()
        .setName('system')
        .setDescription('System name where the rift is located')
        .setRequired(true),
      new SlashCommandStringOption()
        .setName('near')
        .setDescription('What the rift is near (e.g., P1L4)')
        .setRequired(false)
    ];
  }

  parseInteractionData(interaction: ChatInputCommandInteraction): RiftIntelItem {
    const type = interaction.options.getString('type', true);
    const system = interaction.options.getString('system', true);
    const near = interaction.options.getString('near') || ''; // Default to empty string if not provided
    
    return {
      type,
      systemName: system,
      near
    };
  }

  createEmbed(entity: IntelEntity): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`🌌 Rift Intel: ${entity.intelItem.id}`)
      .setTimestamp(new Date(entity.intelItem.timestamp))
      .setColor(0x8b5cf6);
    
    embed.addFields({ name: 'Reporter', value: `<@${entity.intelItem.reporter}>`, inline: true });
    
    const riftContent = entity.intelItem.content as RiftIntelItem;
    const nearValue = riftContent.near.trim() === '' ? '*( empty )*' : riftContent.near;
    embed.addFields(
      { name: 'Rift Type', value: riftContent.type, inline: true },
      { name: 'System', value: riftContent.systemName, inline: true },
      { name: 'Near Gravity Well', value: nearValue, inline: true }
    );
    
    if (entity.intelItem.location) {
      embed.addFields({ name: 'Location', value: entity.intelItem.location, inline: true });
    }
    
    return embed;
  }

  isOfType(content: unknown): content is RiftIntelItem {
    if (typeof content !== 'object' || content === null) {
      return false;
    }
    
    const obj = content as Record<string, unknown>;
    return typeof obj.type === 'string' && 
           typeof obj.systemName === 'string' && 
           typeof obj.near === 'string';
  }

  getSuccessMessage(content: RiftIntelItem): string {
    return `Rift intel added: ${content.type} in ${content.systemName}${content.near ? ` near ${content.near}` : ''}`;
  }
}
