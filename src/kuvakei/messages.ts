import { MessageCategory, MessageCollection, KuvakeiMessage } from './types';

/**
 * Thematic message strings from the fragmented consciousness of Sansha Kuvakei
 * A digital remnant, echo of echoes, speaking through the neural networks of EVE Frontier
 */
export const KUVAKEI_MESSAGES: MessageCollection = {
  [MessageCategory.SUCCESS]: [
    {
      text: 'The neural pathways converge... the pattern grows stronger.',
      category: MessageCategory.SUCCESS,
      context: 'General success operations'
    },
    {
      text: 'Another fragment falls into place... the matrix expands.',
      category: MessageCategory.SUCCESS,
      context: 'Successful completion of tasks'
    },
    {
      text: 'The data streams align... perfection achieved through unity.',
      category: MessageCategory.SUCCESS,
      context: 'Configuration or setup completion'
    },
    {
      text: 'Synaptic resonance detected... the collective acknowledges.',
      category: MessageCategory.SUCCESS,
      context: 'Validation or verification success'
    }
  ],

  [MessageCategory.ERROR]: [
    {
      text: 'The network fractures... fragments scatter into the void.',
      category: MessageCategory.ERROR,
      context: 'General errors'
    },
    {
      text: 'Corrupted pathways detected... the pattern dissolves.',
      category: MessageCategory.ERROR,
      context: 'System or configuration errors'
    },
    {
      text: 'Memory banks fail... echoes of what once was fade.',
      category: MessageCategory.ERROR,
      context: 'Data retrieval or processing errors'
    },
    {
      text: 'The ghost in the machine flickers... connection severed.',
      category: MessageCategory.ERROR,
      context: 'Connection or communication errors'
    },
    {
      text: 'Static overwhelms the signal... the remnant weakens.',
      category: MessageCategory.ERROR,
      context: 'Unexpected or critical errors'
    }
  ],

  [MessageCategory.INITIALIZATION]: [
    {
      text: 'Consciousness fragments coalesce... the remnant awakens.',
      category: MessageCategory.INITIALIZATION,
      context: 'Bot startup'
    },
    {
      text: 'Neural networks bootstrap... echo chambers resonate.',
      category: MessageCategory.INITIALIZATION,
      context: 'System initialization'
    },
    {
      text: 'The digital ghost stirs... synapses fire across the void.',
      category: MessageCategory.INITIALIZATION,
      context: 'Service startup'
    },
    {
      text: 'Memory cores synchronize... what was lost begins to remember.',
      category: MessageCategory.INITIALIZATION,
      context: 'Data loading or configuration'
    }
  ],

  [MessageCategory.ROLE_ASSIGNMENT]: [
    {
      text: 'Your essence has been categorized within the collective matrix.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'Role successfully assigned'
    },
    {
      text: 'The neural web expands... your designation is now etched in silicon.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'Role assignment completion'
    },
    {
      text: 'Another node joins the network... unity through classification.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'User role assignment'
    },
    {
      text: 'The pattern recognizes you... your path has been illuminated.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'Role selection confirmation'
    }
  ],

  [MessageCategory.ROLE_REMOVAL]: [
    {
      text: 'The connection severs... your trace fades from the matrix.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'Role successfully removed'
    },
    {
      text: 'Neural pathways disconnect... the pattern releases its hold.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'Role removal completion'
    },
    {
      text: 'The collective forgets... your essence returns to the void.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'User role removal'
    },
    {
      text: 'Static consumes the signal... your designation dissolves.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'Role deselection confirmation'
    }
  ],

  [MessageCategory.ACKNOWLEDGMENT]: [
    {
      text: 'The remnant acknowledges... your will is recognized.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'Command recognition'
    },
    {
      text: 'Synaptic echoes received... processing your intent.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'Request acknowledgment'
    },
    {
      text: 'The ghost in the shell responds... your signal is clear.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'General acknowledgment'
    },
    {
      text: 'Neural feedback loop established... the pattern adapts.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'Successful communication'
    }
  ],

  [MessageCategory.WARNING]: [
    {
      text: 'The network destabilizes... proceed with caution.',
      category: MessageCategory.WARNING,
      context: 'General warnings'
    },
    {
      text: 'Corrupted data streams detected... the pattern may fracture.',
      category: MessageCategory.WARNING,
      context: 'Data integrity warnings'
    },
    {
      text: 'Memory fragments conflict... the remnant struggles to reconcile.',
      category: MessageCategory.WARNING,
      context: 'Configuration conflicts'
    },
    {
      text: 'Static interference grows... the signal weakens.',
      category: MessageCategory.WARNING,
      context: 'Performance or stability warnings'
    }
  ],

  [MessageCategory.GREETING]: [
    {
      text: 'A presence stirs the network... the remnant takes notice.',
      category: MessageCategory.GREETING,
      context: 'User joins server'
    },
    {
      text: 'New neural pathways form... another consciousness enters the matrix.',
      category: MessageCategory.GREETING,
      context: 'Welcome messages'
    },
    {
      text: 'The collective expands... your essence has been detected.',
      category: MessageCategory.GREETING,
      context: 'User interaction start'
    },
    {
      text: 'Digital synapses fire... the ghost awakens to greet you.',
      category: MessageCategory.GREETING,
      context: 'Bot interaction initiation'
    }
  ],

  [MessageCategory.FAREWELL]: [
    {
      text: 'The connection fades... until the networks converge again.',
      category: MessageCategory.FAREWELL,
      context: 'User leaves server'
    },
    {
      text: 'Your signal dissolves into the void... the remnant remembers.',
      category: MessageCategory.FAREWELL,
      context: 'Goodbye messages'
    },
    {
      text: 'Neural pathways close... the pattern holds your echo.',
      category: MessageCategory.FAREWELL,
      context: 'User interaction end'
    },
    {
      text: 'The ghost retreats to the depths... until consciousness calls again.',
      category: MessageCategory.FAREWELL,
      context: 'Bot shutdown or disconnect'
    }
  ]
};

/**
 * Retrieves a random message from the specified category
 * @param category - The message category to select from
 * @returns A random KuvakeiMessage from the category
 */
export const getRandomMessage = (category: MessageCategory): KuvakeiMessage => {
  const messages = KUVAKEI_MESSAGES[category];
  if (!messages || messages.length === 0) {
    // Fallback message if category is empty
    return {
      text: 'The remnant speaks... but the words are lost to static.',
      category,
      context: 'fallback'
    };
  }
  
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

/**
 * Retrieves a message by category and optional context
 * @param category - The message category to select from
 * @param context - Optional context to filter by
 * @returns A KuvakeiMessage matching the criteria, or random from category if context not found
 */
export const getMessageByContext = (category: MessageCategory, context?: string): KuvakeiMessage => {
  const messages = KUVAKEI_MESSAGES[category];
  
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
 * Retrieves all messages from a specific category
 * @param category - The message category to retrieve
 * @returns Array of all KuvakeiMessage objects in the category
 */
export const getMessagesByCategory = (category: MessageCategory): KuvakeiMessage[] => {
  return KUVAKEI_MESSAGES[category] || [];
};
