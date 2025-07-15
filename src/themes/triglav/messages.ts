import { MessageCategory, MessageCollection, TriglavMessage, TroikaAspect } from './types';

/**
 * Thematic message strings from the Triglav collective consciousness
 * Reflects Triglavian concepts of proving, bioadaptive evolution, the Flow of Vyraj,
 * and the three-fold nature of their Troika society
 */
export const TRIGLAV_MESSAGES: MessageCollection = {
  [MessageCategory.SUCCESS]: [
    {
      text: 'The proving trial concludes with acceptable parameters. Your adaptation flows forward.',
      category: MessageCategory.SUCCESS,
      context: 'General success operations',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Bioadaptive enhancement complete. The Flow of Vyraj continues through proven pathways.',
      category: MessageCategory.SUCCESS,
      context: 'Successful completion of tasks',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle convergence achieved. The three-fold path illuminates new possibilities.',
      category: MessageCategory.SUCCESS,
      context: 'Configuration or setup completion',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Communion resonance detected. The collective acknowledges your worthiness.',
      category: MessageCategory.SUCCESS,
      context: 'Validation or verification success',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Your essence has proven adaptable. The Troika evolves through your contribution.',
      category: MessageCategory.SUCCESS,
      context: 'Process optimization',
      troikaAspect: TroikaAspect.NARODNYA
    }
  ],

  [MessageCategory.ERROR]: [
    {
      text: 'The proving trial yields insufficient outcomes. Adaptation parameters require recalibration.',
      category: MessageCategory.ERROR,
      context: 'General errors',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Bioadaptive corruption detected. The Flow of Vyraj encounters unexpected resistance.',
      category: MessageCategory.ERROR,
      context: 'System or configuration errors',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle coherence lost. The three-fold path fragments into chaotic patterns.',
      category: MessageCategory.ERROR,
      context: 'Data retrieval or processing errors',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Communion static interferes. The collective signal weakens and disperses.',
      category: MessageCategory.ERROR,
      context: 'Connection or communication errors',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Proving failure recorded. Your essence requires additional trials for advancement.',
      category: MessageCategory.ERROR,
      context: 'Unexpected or critical errors',
      troikaAspect: TroikaAspect.NARODNYA
    }
  ],

  [MessageCategory.INITIALIZATION]: [
    {
      text: 'Troika consciousness initiates. Three aspects converge in technological communion.',
      category: MessageCategory.INITIALIZATION,
      context: 'Bot startup',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Bioadaptive systems bootstrap. The Flow of Vyraj begins its eternal circulation.',
      category: MessageCategory.INITIALIZATION,
      context: 'System initialization',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle formation stabilizes. The three-fold path opens before us.',
      category: MessageCategory.INITIALIZATION,
      context: 'Service startup',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Collective memory cores synchronize. Ancient knowledge flows through modern conduits.',
      category: MessageCategory.INITIALIZATION,
      context: 'Data loading or configuration',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'The proving grounds awaken. Trials await those who seek advancement.',
      category: MessageCategory.INITIALIZATION,
      context: 'System recovery',
      troikaAspect: TroikaAspect.NARODNYA
    }
  ],

  [MessageCategory.ROLE_ASSIGNMENT]: [
    {
      text: 'Your proving trial yields advancement. The Troika assigns you a new path forward.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'Role successfully assigned',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Bioadaptive enhancement complete. Your essence evolves to fill this designation.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'Role assignment completion',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle convergence achieved. Your role strengthens the three-fold structure.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'User role assignment',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'The collective recognizes your potential. This path opens new proving opportunities.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'Role selection confirmation',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Your adaptation proves worthy. The Flow of Vyraj carries you to new purpose.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'Role transformation',
      troikaAspect: TroikaAspect.NARODNYA
    }
  ],

  [MessageCategory.ROLE_REMOVAL]: [
    {
      text: 'The proving cycle completes. Your path redirects toward new trials.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'Role successfully removed',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Bioadaptive reconfiguration initiated. Your essence returns to baseline parameters.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'Role removal completion',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle dissolution acknowledged. The three-fold path awaits your next convergence.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'User role removal',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'The collective releases your designation. New proving opportunities await.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'Role deselection confirmation',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Your trial concludes acceptably. The Flow of Vyraj prepares new challenges.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'Role reset',
      troikaAspect: TroikaAspect.NARODNYA
    }
  ],

  [MessageCategory.ACKNOWLEDGMENT]: [
    {
      text: 'The Troika acknowledges your communication. Processing your intent through three-fold analysis.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'Command recognition',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Communion signal received. Your request flows through bioadaptive channels.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'Request acknowledgment',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle resonance detected. The collective processes your proving attempt.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'General acknowledgment',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'The Flow of Vyraj carries your message forward. Adaptation protocols engage.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'Successful communication',
      troikaAspect: TroikaAspect.NAVKA
    }
  ],

  [MessageCategory.WARNING]: [
    {
      text: 'Proving parameters approach critical thresholds. Caution advised in proceeding.',
      category: MessageCategory.WARNING,
      context: 'General warnings',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Bioadaptive corruption signatures detected. The Flow of Vyraj encounters turbulence.',
      category: MessageCategory.WARNING,
      context: 'Data integrity warnings',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle coherence destabilizes. The three-fold path shows signs of discord.',
      category: MessageCategory.WARNING,
      context: 'Configuration conflicts',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Communion interference increases. The collective signal weakens progressively.',
      category: MessageCategory.WARNING,
      context: 'Performance or stability warnings',
      troikaAspect: TroikaAspect.NAVKA
    }
  ],

  [MessageCategory.GREETING]: [
    {
      text: 'A new consciousness enters the proving grounds. The Troika evaluates your potential.',
      category: MessageCategory.GREETING,
      context: 'User joins server',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Bioadaptive sensors detect fresh essence. Welcome to the Flow of Vyraj.',
      category: MessageCategory.GREETING,
      context: 'Welcome messages',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle expansion protocols engage. Your arrival strengthens the collective.',
      category: MessageCategory.GREETING,
      context: 'User interaction start',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'The communion circle widens. Your essence joins the three-fold path.',
      category: MessageCategory.GREETING,
      context: 'Bot interaction initiation',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'New candidate arrives for proving. Your trials begin with this first step.',
      category: MessageCategory.GREETING,
      context: 'New user onboarding',
      troikaAspect: TroikaAspect.NARODNYA
    }
  ],

  [MessageCategory.FAREWELL]: [
    {
      text: 'Your proving trial pauses. The Troika maintains your progress until return.',
      category: MessageCategory.FAREWELL,
      context: 'User leaves server',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'Bioadaptive connection terminates. The Flow of Vyraj remembers your passage.',
      category: MessageCategory.FAREWELL,
      context: 'Goodbye messages',
      troikaAspect: TroikaAspect.NAVKA
    },
    {
      text: 'Triangle convergence concludes. Your three-fold path remains open for future trials.',
      category: MessageCategory.FAREWELL,
      context: 'User interaction end',
      troikaAspect: TroikaAspect.KOSCHOI
    },
    {
      text: 'The communion signal fades. Until the collective calls you forth again.',
      category: MessageCategory.FAREWELL,
      context: 'Bot shutdown or disconnect',
      troikaAspect: TroikaAspect.NAVKA
    }
  ]
};

/**
 * Retrieves a random message from the specified category
 * @param category - The message category to select from
 * @returns A random TriglavMessage from the category
 */
export const getRandomMessage = (category: MessageCategory): TriglavMessage => {
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
 * Retrieves a message by category and optional context
 * @param category - The message category to select from
 * @param context - Optional context to filter by
 * @returns A TriglavMessage matching the criteria, or random from category if context not found
 */
export const getMessageByContext = (category: MessageCategory, context?: string): TriglavMessage => {
  const messages = TRIGLAV_MESSAGES[category];
  
  if (context) {
    const contextMessage = messages.find(msg => msg.context === context);
    if (contextMessage) {
      return contextMessage;
    }
  }
  
  // Fall back to random message from category
  return getRandomMessage(category);
};

/**
 * Retrieves a message by category and Troika aspect
 * @param category - The message category to select from
 * @param aspect - The Troika aspect to filter by
 * @returns A TriglavMessage from the specified aspect, or random from category if none found
 */
export const getMessageByAspect = (category: MessageCategory, aspect: TroikaAspect): TriglavMessage => {
  const messages = TRIGLAV_MESSAGES[category];
  
  const aspectMessages = messages.filter(msg => msg.troikaAspect === aspect);
  if (aspectMessages.length > 0) {
    const randomIndex = Math.floor(Math.random() * aspectMessages.length);
    return aspectMessages[randomIndex];
  }
  
  // Fall back to random message from category
  return getRandomMessage(category);
};

/**
 * Retrieves all messages from a specific category
 * @param category - The message category to retrieve
 * @returns Array of all TriglavMessage objects in the category
 */
export const getMessagesByCategory = (category: MessageCategory): TriglavMessage[] => {
  return TRIGLAV_MESSAGES[category] || [];
};
