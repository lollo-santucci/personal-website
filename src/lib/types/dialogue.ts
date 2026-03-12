import type { DialogueId, LineId, Slug } from './common';

/**
 * System action identifiers using snake_case.
 * These represent behaviors triggered by world interactions.
 */
export type ActionType =
  | 'open_page'
  | 'open_project'
  | 'start_dialogue'
  | 'start_chat'
  | 'open_agent_profile';

/** Action triggered by a dialogue choice or world interaction. */
export interface DialogueAction {
  type: ActionType;
  target: Slug;
}

/** A selectable option within a dialogue line. */
export interface DialogueChoice {
  text: string;
  nextLineId?: LineId;
  action?: DialogueAction;
}

/** A single line of dialogue within a conversation. */
export interface DialogueLine {
  id: LineId;
  /**
   * Character slug of the line's speaker.
   * Uses `Slug` because all speakers are currently Characters.
   * If future speakers exist outside the Character entity (e.g. system narrator),
   * this constraint will be revisited.
   */
  speaker: Slug;
  text: string;
  nextLineId?: LineId;
  choices?: DialogueChoice[];
  action?: DialogueAction;
  /**
   * Simple expression string evaluated at runtime (e.g. `"hasVisited:shop"`,
   * `"agentStatus:active"`). The expression grammar is deferred to the
   * dialogue engine spec.
   */
  condition?: string;
}

/** A structured conversation composed of lines, choices, and actions. */
export interface Dialogue {
  id: DialogueId;
  /**
   * Character slug of the primary speaker.
   * Uses `Slug` because all speakers are currently Characters.
   * If future speakers exist outside the Character entity (e.g. system narrator),
   * this constraint will be revisited.
   */
  speaker: Slug;
  lines: DialogueLine[];
}
