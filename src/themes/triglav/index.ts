import { BaseTheme, ThemeModule } from '../base';
import { MessageCategory } from '../types';

const triglavModule: ThemeModule = {
  messages: {
  [MessageCategory.SUCCESS]: [
    {
      text: 'The proving trial concludes with acceptable parameters. Your adaptation flows forward.',
      category: MessageCategory.SUCCESS,
      context: 'success_action'
    },
    {
      text: 'Bioadaptive enhancement complete. The Flow of Vyraj continues through proven pathways.',
      category: MessageCategory.SUCCESS,
      context: 'success_action'
    },
    {
      text: 'Triangle convergence achieved. The three-fold path illuminates new possibilities.',
      category: MessageCategory.SUCCESS,
      context: 'success_action'
    },
    {
      text: 'Communion resonance detected. The collective acknowledges your worthiness.',
      category: MessageCategory.SUCCESS,
      context: 'success_action'
    },
    {
      text: 'Your essence has proven adaptable. The Troika evolves through your contribution.',
      category: MessageCategory.SUCCESS,
      context: 'success_action'
    }
  ],

  [MessageCategory.ERROR]: [
    {
      text: 'The proving trial yields insufficient outcomes. Adaptation parameters require recalibration.',
      category: MessageCategory.ERROR,
      context: 'operation_error'
    },
    {
      text: 'Bioadaptive corruption detected. The Flow of Vyraj encounters unexpected resistance.',
      category: MessageCategory.ERROR,
      context: 'operation_error'
    },
    {
      text: 'Triangle coherence lost. The three-fold path fragments into chaotic patterns.',
      category: MessageCategory.ERROR,
      context: 'operation_error'
    },
    {
      text: 'Communion static interferes. The collective signal weakens and disperses.',
      category: MessageCategory.ERROR,
      context: 'operation_error'
    },
    {
      text: 'Proving failure recorded. Your essence requires additional trials for advancement.',
      category: MessageCategory.ERROR,
      context: 'operation_error'
    }
  ],

  [MessageCategory.ROLE_ASSIGNMENT]: [
    {
      text: 'Your proving trial yields advancement. The Troika assigns {username} a new path forward.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'role_assigned',
      variables: ['username']
    },
    {
      text: 'Bioadaptive enhancement complete. {username} evolves to fill the {roleName} designation.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'assignment_complete',
      variables: ['username', 'roleName']
    },
    {
      text: 'Triangle convergence achieved. {username} strengthens the three-fold structure.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'user_role',
      variables: ['username']
    },
    {
      text: 'The collective recognizes your potential. This {roleName} path opens new proving opportunities.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'role_confirmed',
      variables: ['roleName']
    },
    {
      text: 'Your adaptation proves worthy. The Flow of Vyraj carries {username} to new purpose.',
      category: MessageCategory.ROLE_ASSIGNMENT,
      context: 'role_transform',
      variables: ['username']
    }
  ],

  [MessageCategory.ROLE_REMOVAL]: [
    {
      text: 'The proving cycle completes. Your path redirects toward new trials.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'role_removed'
    },
    {
      text: 'Bioadaptive reconfiguration initiated. Your essence returns to baseline parameters.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'removal_complete'
    },
    {
      text: 'Triangle dissolution acknowledged. The three-fold path awaits your next convergence.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'user_role_removal'
    },
    {
      text: 'The collective releases your designation. New proving opportunities await.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'role_deselected'
    },
    {
      text: 'Your trial concludes acceptably. The Flow of Vyraj prepares new challenges.',
      category: MessageCategory.ROLE_REMOVAL,
      context: 'role_reset'
    }
  ],

  [MessageCategory.ACKNOWLEDGMENT]: [
    {
      text: 'The Troika acknowledges your communication. Processing your intent through three-fold analysis.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'command_ack'
    },
    {
      text: 'Communion signal received. Your request flows through bioadaptive channels.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'request_ack'
    },
    {
      text: 'Triangle resonance detected. The collective processes your proving attempt.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'general_ack'
    },
    {
      text: 'The Flow of Vyraj carries your message forward. Adaptation protocols engage.',
      category: MessageCategory.ACKNOWLEDGMENT,
      context: 'comm_success'
    }
  ],

  [MessageCategory.WARNING]: [
    {
      text: 'Proving parameters approach critical thresholds. Caution advised in proceeding.',
      category: MessageCategory.WARNING,
      context: 'general_warning'
    },
    {
      text: 'Bioadaptive corruption signatures detected. The Flow of Vyraj encounters turbulence.',
      category: MessageCategory.WARNING,
      context: 'data_warning'
    },
    {
      text: 'Triangle coherence destabilizes. The three-fold path shows signs of discord.',
      category: MessageCategory.WARNING,
      context: 'config_conflict'
    },
    {
      text: 'Communion interference increases. The collective signal weakens progressively.',
      category: MessageCategory.WARNING,
      context: 'performance_warning'
    }
  ],

  [MessageCategory.GREETING]: [
    {
      text: 'A new consciousness enters the proving grounds. The Troika evaluates {username}.',
      category: MessageCategory.GREETING,
      context: 'user_join',
      variables: ['username']
    },
    {
      text: 'Bioadaptive sensors detect fresh essence. Welcome to the Flow of Vyraj, {username}.',
      category: MessageCategory.GREETING,
      context: 'welcome',
      variables: ['username']
    },
    {
      text: 'Triangle expansion protocols engage. Your arrival strengthens the collective.',
      category: MessageCategory.GREETING,
      context: 'interaction_start'
    },
    {
      text: 'The communion circle widens. Your essence joins the three-fold path.',
      category: MessageCategory.GREETING,
      context: 'bot_init'
    },
    {
      text: 'New candidate arrives for proving. Your trials begin with this first step.',
      category: MessageCategory.GREETING,
      context: 'user_onboard'
    }
  ],

  [MessageCategory.FAREWELL]: [
    {
      text: 'Your proving trial pauses. The Troika maintains your progress until return.',
      category: MessageCategory.FAREWELL,
      context: 'user_leave'
    },
    {
      text: 'Bioadaptive connection terminates. The Flow of Vyraj remembers your passage.',
      category: MessageCategory.FAREWELL,
      context: 'goodbye'
    },
    {
      text: 'Triangle convergence concludes. Your three-fold path remains open for future trials.',
      category: MessageCategory.FAREWELL,
      context: 'interaction_end'
    },
    {
      text: 'The communion signal fades. Until the collective calls you forth again.',
      category: MessageCategory.FAREWELL,
      context: 'bot_shutdown'
    }
  ]
  }
};

export class TriglavTheme extends BaseTheme {
  readonly name = 'triglav';

  constructor() {
    super(triglavModule);
  }
}

export const triglavTheme = new TriglavTheme();
