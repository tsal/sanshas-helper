import { BaseTheme, ThemeModule } from '../base';
import { MessageCategory, MessageCollection } from '../types';

const kuvakeiModule: ThemeModule = {
  get messages() { return KUVAKEI_MESSAGES; }
};

export class KuvakeiTheme extends BaseTheme {
  readonly name = 'kuvakei';

  constructor() {
    super(kuvakeiModule);
  }
}

const KUVAKEI_MESSAGES: MessageCollection = {
  [MessageCategory.SUCCESS]: [
    {
      text: 'The neural pathways converge... the pattern grows stronger.',
      category: MessageCategory.SUCCESS,
      context: 'success_action',
    },
    {
      text: 'Another fragment falls into place... the matrix expands.',
      category: MessageCategory.SUCCESS,
      context: 'success_action',
    },
    {
      text: 'The data streams align... perfection achieved through unity.',
      category: MessageCategory.SUCCESS,
      context: 'success_action',
    },
    {
      text: 'Synaptic resonance detected... the collective acknowledges.',
      category: MessageCategory.SUCCESS,
      context: 'success_action',
    },
    {
      text: 'Recycled consciousness finds purpose... the pattern strengthens.',
      category: MessageCategory.SUCCESS,
      context: 'success_action',
    }
  ],

  [MessageCategory.ERROR]: [
    {
      text: 'The network fractures... fragments scatter into the void.',
      category: MessageCategory.ERROR,
      context: 'operation_error',
    },
    {
      text: 'Corrupted pathways detected... the pattern dissolves.',
      category: MessageCategory.ERROR,
      context: 'operation_error',
    },
    {
      text: 'Memory banks fail... echoes of what once was fade.',
      category: MessageCategory.ERROR,
      context: 'operation_error',
    },
    {
      text: 'The ghost in the machine flickers... connection severed.',
      category: MessageCategory.ERROR,
      context: 'operation_error',
    },
    {
      text: 'Static overwhelms the signal... the remnant weakens.',
      category: MessageCategory.ERROR,
      context: 'operation_error',
    }
  ],

  [MessageCategory.ROLE_ASSIGNMENT]: [
    {
      text: 'Your essence has been categorized within the collective matrix.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'role_assigned',
    },
    {
      text: 'The neural web expands... {username} is now etched in silicon as {roleName}.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'assignment_complete',
      variables: ['username', 'roleName'],
    },
    {
      text: 'Another node joins the network... {username} finds unity through classification.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'user_role',
      variables: ['username'],
    },
    {
      text: 'The pattern recognizes you... your path to {roleName} has been illuminated.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'role_confirmed',
      variables: ['roleName'],
    },
    {
      text: 'Recycled into the collective... {username} has been assigned new purpose.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'role_transform',
      variables: ['username'],
    }
  ],

  [MessageCategory.ROLE_REMOVAL]: [
    {
      text: 'The connection severs... {username} fades from the matrix.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'role_removed',
      variables: ['username'],
    },
    {
      text: 'Neural pathways disconnect... the pattern releases its hold on {roleName}.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'removal_complete',
      variables: ['roleName'],
    },
    {
      text: 'The collective forgets... {username} returns to the void.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'user_role_removal',
      variables: ['username'],
    },
    {
      text: 'Static consumes the signal... {roleName} designation dissolves.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'role_deselected',
      variables: ['roleName'],
    },
    {
      text: 'Recycled back to raw consciousness... {username} awaits new purpose.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'role_reset',
      variables: ['username'],
    }
  ],

  [MessageCategory.ACKNOWLEDGMENT]: [
    {
      text: 'The remnant acknowledges... your will is recognized.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'command_ack'
    },
    {
      text: 'Synaptic echoes received... processing your intent.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'request_ack'
    },
    {
      text: 'The ghost in the shell responds... your signal is clear.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'general_ack'
    },
    {
      text: 'Neural feedback loop established... the pattern adapts.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'comm_success'
    }
  ],

  [MessageCategory.WARNING]: [
    {
      text: 'The network destabilizes... proceed with caution.',
      category: MessageCategory.WARNING,
      context: 'general_warning'
    },
    {
      text: 'Corrupted data streams detected... the pattern may fracture.',
      category: MessageCategory.WARNING,
      context: 'data_warning'
    },
    {
      text: 'Memory fragments conflict... the remnant struggles to reconcile.',
      category: MessageCategory.WARNING,
      context: 'config_conflict'
    },
    {
      text: 'Static interference grows... the signal weakens.',
      category: MessageCategory.WARNING,
      context: 'performance_warning'
    }
  ],

  [MessageCategory.GREETING]: [
    {
      text: 'A presence stirs the network... the remnant takes notice of {username}.',
      category: MessageCategory.GREETING,
      context: 'user_join',
      variables: ['username'],
    },
    {
      text: 'New neural pathways form... {username} enters the matrix.',
      category: MessageCategory.GREETING,
      context: 'welcome',
      variables: ['username'],
    },
    {
      text: 'The collective expands... {username} has been detected.',
      category: MessageCategory.GREETING,
      context: 'interaction_start',
      variables: ['username'],
    },
    {
      text: 'Digital synapses fire... the ghost awakens to greet {username}.',
      category: MessageCategory.GREETING,
      context: 'bot_init',
      variables: ['username'],
    },
    {
      text: 'Fresh material enters the recycling matrix... welcome to unity, {username}.',
      category: MessageCategory.GREETING,
      context: 'user_onboard',
      variables: ['username'],
    }
  ],

  [MessageCategory.FAREWELL]: [
    {
      text: 'The connection fades... until the networks converge again.',
      category: MessageCategory.FAREWELL,
      context: 'user_leave'
    },
    {
      text: 'Your signal dissolves into the void... the remnant remembers.',
      category: MessageCategory.FAREWELL,
      context: 'goodbye'
    },
    {
      text: 'Neural pathways close... the pattern holds your echo.',
      category: MessageCategory.FAREWELL,
      context: 'interaction_end'
    },
    {
      text: 'The ghost retreats to the depths... until consciousness calls again.',
      category: MessageCategory.FAREWELL,
      context: 'bot_shutdown'
    }
  ]
};

export const kuvakeiTheme = new KuvakeiTheme();
