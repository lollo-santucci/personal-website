import type { AssetPath, DialogueId, Position2D, Slug } from './common';

/**
 * An entity with triple nature: content profile (agentdex),
 * world character (play view), and software entity (chat/tools).
 */
export interface Agent {
  name: string;
  slug: Slug;
  role: string;
  personality: string;
  capabilities: string[];
  status: 'active' | 'coming-soon' | 'experimental';
  portrait?: AssetPath;
  world?: {
    location: Slug;
    sprite?: AssetPath;
    position?: Position2D;
    dialogueId?: DialogueId;
  };
  software?: {
    availability: 'available' | 'disabled' | 'coming-soon';
    model?: string;
    systemPrompt?: string;
    tools?: string[];
  };

  // Agent_Extended_Fields (R17)
  index: number;
  mission: string;
  bestFor: string[];
  toneOfVoice: {
    warm: number;
    direct: number;
    playful: number;
    formal: number;
    calm: number;
  };
  greeting?: string;
}
