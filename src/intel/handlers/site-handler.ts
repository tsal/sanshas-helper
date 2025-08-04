import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandStringOption } from 'discord.js';
import { IntelTypeHandler, SlashCommandOptionBuilder } from './types';
import { SiteIntelItem, IntelEntity } from '../types';

/**
 * Handler for site intel type
 * Manages investigation and combat site intelligence reports
 */
export class SiteIntelTypeHandler implements IntelTypeHandler<SiteIntelItem> {
  readonly type = 'site';
  readonly description = 'Add a site intel report';

  getCommandOptions(): SlashCommandOptionBuilder[] {
    return [
      new SlashCommandStringOption()
        .setName('name')
        .setDescription('Name of the investigation or combat site')
        .setRequired(true),
      new SlashCommandStringOption()
        .setName('system')
        .setDescription('System name where the site is located')
        .setRequired(true),
      new SlashCommandStringOption()
        .setName('triggered')
        .setDescription('Site trigger status')
        .setRequired(true)
        .addChoices(
          { name: 'Yes', value: 'yes' },
          { name: 'No', value: 'no' },
          { name: 'Unknown', value: 'unknown' }
        ),
      new SlashCommandStringOption()
        .setName('near')
        .setDescription('What the site is near (optional)')
        .setRequired(false)
    ];
  }

  parseInteractionData(interaction: ChatInputCommandInteraction): SiteIntelItem {
    const name = interaction.options.getString('name', true);
    const system = interaction.options.getString('system', true);
    const triggered = interaction.options.getString('triggered', true);
    const near = interaction.options.getString('near');

    const siteData: SiteIntelItem = {
      name,
      system,
      triggered
    };

    if (near) {
      siteData.near = near;
    }

    return siteData;
  }

  generateId(): string {
    return `site-${Date.now()}`;
  }

  createEmbed(intel: IntelEntity): EmbedBuilder {
    const content = intel.intelItem.content as SiteIntelItem;
    
    const embed = new EmbedBuilder()
      .setTitle('🏗️ Site Intelligence Report')
      .setColor(0x8B4513) // Brown color for construction/sites
      .setTimestamp(new Date(intel.intelItem.timestamp))
      .addFields(
        { name: 'Site Name', value: content.name, inline: true },
        { name: 'System', value: content.system, inline: true },
        { name: 'Triggered', value: content.triggered, inline: true }
      );

    if (content.near) {
      embed.addFields({ name: 'Near', value: content.near, inline: true });
    }

    embed.addFields({ name: 'Reporter', value: `<@${intel.intelItem.reporter}>`, inline: true });

    return embed;
  }

  isOfType(content: unknown): content is SiteIntelItem {
    if (typeof content !== 'object' || content === null) {
      return false;
    }
    
    const obj = content as Record<string, unknown>;
    return typeof obj.name === 'string' && 
           typeof obj.system === 'string' &&
           typeof obj.triggered === 'string' && 
           (obj.near === undefined || typeof obj.near === 'string');
  }

  getSuccessMessage(content: SiteIntelItem): string {
    const nearText = content.near ? ` near ${content.near}` : '';
    return `Site intel added: ${content.name} in ${content.system}${nearText} (Triggered: ${content.triggered})`;
  }
}
