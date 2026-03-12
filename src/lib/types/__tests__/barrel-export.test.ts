/**
 * Type-level tests for Property 4: Barrel export completeness.
 *
 * Verifies that every type exported from individual entity files is also
 * importable from the barrel export at `@/lib/types`, and that the types
 * match exactly.
 *
 * **Validates: Requirements 11.1**
 */

import { describe, it, expectTypeOf } from 'vitest';

// Barrel imports — all types from `@/lib/types`
import type {
  Slug as BarrelSlug,
  IsoDateString as BarrelIsoDateString,
  AssetPath as BarrelAssetPath,
  DialogueId as BarrelDialogueId,
  LineId as BarrelLineId,
  Position2D as BarrelPosition2D,
  TransitionDirection as BarrelTransitionDirection,
  Page as BarrelPage,
  Project as BarrelProject,
  BlogPost as BarrelBlogPost,
  Agent as BarrelAgent,
  CharacterType as BarrelCharacterType,
  BehaviorType as BarrelBehaviorType,
  AgentCharacter as BarrelAgentCharacter,
  NonAgentCharacter as BarrelNonAgentCharacter,
  Character as BarrelCharacter,
  ActionType as BarrelActionType,
  DialogueAction as BarrelDialogueAction,
  DialogueChoice as BarrelDialogueChoice,
  DialogueLine as BarrelDialogueLine,
  Dialogue as BarrelDialogue,
  LocationType as BarrelLocationType,
  InteractiveObject as BarrelInteractiveObject,
  LocationTransition as BarrelLocationTransition,
  Location as BarrelLocation,
  Service as BarrelService,
} from '@/lib/types';

// Individual module imports
import type {
  Slug,
  IsoDateString,
  AssetPath,
  DialogueId,
  LineId,
  TransitionDirection,
} from '@/lib/types/common';
import type { Position2D } from '@/lib/types/common';
import type { Page } from '@/lib/types/page';
import type { Project } from '@/lib/types/project';
import type { BlogPost } from '@/lib/types/blog-post';
import type { Agent } from '@/lib/types/agent';
import type {
  CharacterType,
  BehaviorType,
  AgentCharacter,
  NonAgentCharacter,
  Character,
} from '@/lib/types/character';
import type {
  ActionType,
  DialogueAction,
  DialogueChoice,
  DialogueLine,
  Dialogue,
} from '@/lib/types/dialogue';
import type {
  LocationType,
  InteractiveObject,
  LocationTransition,
  Location,
} from '@/lib/types/location';
import type { Service } from '@/lib/types/service';

describe('Property 4: Barrel export completeness', () => {
  describe('common.ts types match barrel exports', () => {
    it('Slug', () => {
      expectTypeOf<BarrelSlug>().toEqualTypeOf<Slug>();
    });

    it('IsoDateString', () => {
      expectTypeOf<BarrelIsoDateString>().toEqualTypeOf<IsoDateString>();
    });

    it('AssetPath', () => {
      expectTypeOf<BarrelAssetPath>().toEqualTypeOf<AssetPath>();
    });

    it('DialogueId', () => {
      expectTypeOf<BarrelDialogueId>().toEqualTypeOf<DialogueId>();
    });

    it('LineId', () => {
      expectTypeOf<BarrelLineId>().toEqualTypeOf<LineId>();
    });

    it('Position2D', () => {
      expectTypeOf<BarrelPosition2D>().toEqualTypeOf<Position2D>();
    });

    it('TransitionDirection', () => {
      expectTypeOf<BarrelTransitionDirection>().toEqualTypeOf<TransitionDirection>();
    });
  });

  describe('entity types match barrel exports', () => {
    it('Page', () => {
      expectTypeOf<BarrelPage>().toEqualTypeOf<Page>();
    });

    it('Project', () => {
      expectTypeOf<BarrelProject>().toEqualTypeOf<Project>();
    });

    it('BlogPost', () => {
      expectTypeOf<BarrelBlogPost>().toEqualTypeOf<BlogPost>();
    });

    it('Agent', () => {
      expectTypeOf<BarrelAgent>().toEqualTypeOf<Agent>();
    });

    it('Service', () => {
      expectTypeOf<BarrelService>().toEqualTypeOf<Service>();
    });
  });

  describe('character.ts types match barrel exports', () => {
    it('CharacterType', () => {
      expectTypeOf<BarrelCharacterType>().toEqualTypeOf<CharacterType>();
    });

    it('BehaviorType', () => {
      expectTypeOf<BarrelBehaviorType>().toEqualTypeOf<BehaviorType>();
    });

    it('AgentCharacter', () => {
      expectTypeOf<BarrelAgentCharacter>().toEqualTypeOf<AgentCharacter>();
    });

    it('NonAgentCharacter', () => {
      expectTypeOf<BarrelNonAgentCharacter>().toEqualTypeOf<NonAgentCharacter>();
    });

    it('Character', () => {
      expectTypeOf<BarrelCharacter>().toEqualTypeOf<Character>();
    });
  });

  describe('dialogue.ts types match barrel exports', () => {
    it('ActionType', () => {
      expectTypeOf<BarrelActionType>().toEqualTypeOf<ActionType>();
    });

    it('DialogueAction', () => {
      expectTypeOf<BarrelDialogueAction>().toEqualTypeOf<DialogueAction>();
    });

    it('DialogueChoice', () => {
      expectTypeOf<BarrelDialogueChoice>().toEqualTypeOf<DialogueChoice>();
    });

    it('DialogueLine', () => {
      expectTypeOf<BarrelDialogueLine>().toEqualTypeOf<DialogueLine>();
    });

    it('Dialogue', () => {
      expectTypeOf<BarrelDialogue>().toEqualTypeOf<Dialogue>();
    });
  });

  describe('location.ts types match barrel exports', () => {
    it('LocationType', () => {
      expectTypeOf<BarrelLocationType>().toEqualTypeOf<LocationType>();
    });

    it('InteractiveObject', () => {
      expectTypeOf<BarrelInteractiveObject>().toEqualTypeOf<InteractiveObject>();
    });

    it('LocationTransition', () => {
      expectTypeOf<BarrelLocationTransition>().toEqualTypeOf<LocationTransition>();
    });

    it('Location', () => {
      expectTypeOf<BarrelLocation>().toEqualTypeOf<Location>();
    });
  });
});
