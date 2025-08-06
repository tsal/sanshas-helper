/**
 * Triglav theme module - Triglavian Collective messaging system
 * 
 * This module contains the three-fold voice of the Triglavian Collective,
 * reflecting their bioadaptive technology, proving trials, and the eternal
 * Flow of Vyraj that guides their existence. Messages embody the wisdom
 * of Troikas: Narodnya, Navka, and Koschoi unified in purpose.
 */

import { BaseTheme } from '../base';
import { MessageCategory, ThemeMessage } from '../types';
import { MessageCollection, TriglavMessage, TroikaAspect } from './types';

// Custom implementations
/**
 * Retrieves a random message from the specified category
 * @param category - The message category to select from
 * @returns A random TriglavMessage from the category
 */
const getRandomMessage = (category: MessageCategory): TriglavMessage => {
  const messages = TRIGLAV_MESSAGES[category];
  if (!messages || messages.length === 0) {
    // Fallback message if category is empty
    return {
      text: 'The Triglav speaks... but the three-fold path obscures the meaning.',
      category,
      context: 'fallback',
      troikaAspect: TroikaAspect.KOSCHOI
    };
  }
  
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

/**
 * Retrieves all messages from a specific category
 * @param category - The message category to retrieve
 * @returns Array of all TriglavMessage objects in the category
 */
const getMessagesByCategory = (category: MessageCategory): TriglavMessage[] => {
  return TRIGLAV_MESSAGES[category] || [];
};

/**
 * Triglav theme implementation
 * Provides Triglavian Collective threefold wisdom messaging
 */
export class TriglavTheme extends BaseTheme {
  readonly name = 'triglav';

  getRandomMessage(category: MessageCategory): ThemeMessage {
    return getRandomMessage(category);
  }

  getMessagesByCategory(category: MessageCategory): ThemeMessage[] {
    return getMessagesByCategory(category);
  }
}

/**
 * Thematic message strings from the Triglav collective consciousness
 * Reflects Triglavian concepts of proving, bioadaptive evolution, the Flow of Vyraj,
 * and the three-fold nature of their Troika society
 */
const TRIGLAV_MESSAGES: MessageCollection = {
  [MessageCategory.SUCCESS]: [
    {
      text: 'The proving trial concludes with acceptable parameters. Your adaptation flows forward.',
      category: MessageCategory.SUCCESS,
      context: 'success_action',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Bioadaptive enhancement complete. The Flow of Vyraj continues through proven pathways.',
      category: MessageCategory.SUCCESS,
      context: 'success_action',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle convergence achieved. The three-fold path illuminates new possibilities.',
      category: MessageCategory.SUCCESS,
      context: 'success_action',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Communion resonance detected. The collective acknowledges your worthiness.',
      category: MessageCategory.SUCCESS,
      context: 'success_action',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Your essence has proven adaptable. The Troika evolves through your contribution.',
      category: MessageCategory.SUCCESS,
      context: 'success_action',
      troikaAspect: TroikaAspect.NARODNYA
    }
  ],

  [MessageCategory.ERROR]: [
    {
      text: 'The proving trial yields insufficient outcomes. Adaptation parameters require recalibration.',
      category: MessageCategory.ERROR,
      context: 'operation_error',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Bioadaptive corruption detected. The Flow of Vyraj encounters unexpected resistance.',
      category: MessageCategory.ERROR,
      context: 'operation_error',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle coherence lost. The three-fold path fragments into chaotic patterns.',
      category: MessageCategory.ERROR,
      context: 'operation_error',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Communion static interferes. The collective signal weakens and disperses.',
      category: MessageCategory.ERROR,
      context: 'operation_error',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Proving failure recorded. Your essence requires additional trials for advancement.',
      category: MessageCategory.ERROR,
      context: 'operation_error',
      troikaAspect: TroikaAspect.NARODNYA
    }
  ],

  [MessageCategory.ROLE_ASSIGNMENT]: [
    {
      text: 'Your proving trial yields advancement. The Troika assigns {username} a new path forward.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'role_assigned',
      variables: ['username'],
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Bioadaptive enhancement complete. {username} evolves to fill the {roleName} designation.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'assignment_complete',
      variables: ['username', 'roleName'],
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle convergence achieved. {username} strengthens the three-fold structure.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'user_role',
      variables: ['username'],
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'The collective recognizes your potential. This {roleName} path opens new proving opportunities.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'role_confirmed',
      variables: ['roleName'],
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Your adaptation proves worthy. The Flow of Vyraj carries {username} to new purpose.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'role_transform',
      variables: ['username'],
      troikaAspect: TroikaAspect.NARODNYA
    }
  ],

  [MessageCategory.ROLE_REMOVAL]: [
    {
      text: 'The proving cycle completes. Your path redirects toward new trials.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'role_removed',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Bioadaptive reconfiguration initiated. Your essence returns to baseline parameters.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'removal_complete',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle dissolution acknowledged. The three-fold path awaits your next convergence.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'user_role_removal',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'The collective releases your designation. New proving opportunities await.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'role_deselected',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Your trial concludes acceptably. The Flow of Vyraj prepares new challenges.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'role_reset',
      troikaAspect: TroikaAspect.NARODNYA
    }
  ],

  [MessageCategory.ACKNOWLEDGMENT]: [
    {
      text: 'The Troika acknowledges your communication. Processing your intent through three-fold analysis.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'command_ack',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Communion signal received. Your request flows through bioadaptive channels.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'request_ack',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle resonance detected. The collective processes your proving attempt.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'general_ack',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'The Flow of Vyraj carries your message forward. Adaptation protocols engage.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'comm_success',
      troikaAspect: TroikaAspect.NAVKA
    }
  ],

  [MessageCategory.WARNING]: [
    {
      text: 'Proving parameters approach critical thresholds. Caution advised in proceeding.',
      category: MessageCategory.WARNING,
      context: 'general_warning',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Bioadaptive corruption signatures detected. The Flow of Vyraj encounters turbulence.',
      category: MessageCategory.WARNING,
      context: 'data_warning',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle coherence destabilizes. The three-fold path shows signs of discord.',
      category: MessageCategory.WARNING,
      context: 'config_conflict',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Communion interference increases. The collective signal weakens progressively.',
      category: MessageCategory.WARNING,
      context: 'performance_warning',
      troikaAspect: TroikaAspect.NAVKA
    }
  ],

  [MessageCategory.GREETING]: [
    {
      text: 'A new consciousness enters the proving grounds. The Troika evaluates {username}.',
      category: MessageCategory.GREETING,
      context: 'user_join',
      variables: ['username'],
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Bioadaptive sensors detect fresh essence. Welcome to the Flow of Vyraj, {username}.',
      category: MessageCategory.GREETING,
      context: 'welcome',
      variables: ['username'],
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle expansion protocols engage. Your arrival strengthens the collective.',
      category: MessageCategory.GREETING,
      context: 'interaction_start',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'The communion circle widens. Your essence joins the three-fold path.',
      category: MessageCategory.GREETING,
      context: 'bot_init',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'New candidate arrives for proving. Your trials begin with this first step.',
      category: MessageCategory.GREETING,
      context: 'user_onboard',
      troikaAspect: TroikaAspect.NARODNYA
    }
  ],

  [MessageCategory.FAREWELL]: [
    {
      text: 'Your proving trial pauses. The Troika maintains your progress until return.',
      category: MessageCategory.FAREWELL,
      context: 'user_leave',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Bioadaptive connection terminates. The Flow of Vyraj remembers your passage.',
      category: MessageCategory.FAREWELL,
      context: 'goodbye',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle convergence concludes. Your three-fold path remains open for future trials.',
      category: MessageCategory.FAREWELL,
      context: 'interaction_end',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'The communion signal fades. Until the collective calls you forth again.',
      category: MessageCategory.FAREWELL,
      context: 'bot_shutdown',
      troikaAspect: TroikaAspect.NAVKA
    }
  ]
};

// Export singleton instance
export const triglavTheme = new TriglavTheme();

export * from './types';
