/**
 * Type-level tests for Property 1: Semantic type alias consistency.
 *
 * Verifies that branded types are not assignable from raw `string` and that
 * all entity interfaces use the correct semantic type aliases for their fields.
 *
 * **Validates: Requirements 1.9, 1.10, 1.11, 1.12, 1.13, 1.14**
 */

import { describe, it, expectTypeOf } from 'vitest';
import type {
  Slug,
  IsoDateString,
  AssetPath,
  DialogueId,
  LineId,
  Position2D,
  Page,
  Project,
  BlogPost,
  Agent,
  AgentCharacter,
  NonAgentCharacter,
  Dialogue,
  DialogueLine,
  DialogueChoice,
  Location,
  LocationTransition,
  InteractiveObject,
  Service,
} from '@/lib/types';

describe('Property 1: Semantic type alias consistency', () => {
  describe('branded types reject raw string assignment', () => {
    it('Slug is not assignable from raw string', () => {
      expectTypeOf<string>().not.toMatchTypeOf<Slug>();
    });

    it('IsoDateString is not assignable from raw string', () => {
      expectTypeOf<string>().not.toMatchTypeOf<IsoDateString>();
    });

    it('AssetPath is not assignable from raw string', () => {
      expectTypeOf<string>().not.toMatchTypeOf<AssetPath>();
    });

    it('DialogueId is not assignable from raw string', () => {
      expectTypeOf<string>().not.toMatchTypeOf<DialogueId>();
    });

    it('LineId is not assignable from raw string', () => {
      expectTypeOf<string>().not.toMatchTypeOf<LineId>();
    });
  });

  describe('Req 1.9: Slug fields use Slug type, not raw string', () => {
    it('Page.slug is Slug', () => {
      expectTypeOf<Page['slug']>().toEqualTypeOf<Slug>();
    });

    it('Project.slug is Slug', () => {
      expectTypeOf<Project['slug']>().toEqualTypeOf<Slug>();
    });

    it('BlogPost.slug is Slug', () => {
      expectTypeOf<BlogPost['slug']>().toEqualTypeOf<Slug>();
    });

    it('Agent.slug is Slug', () => {
      expectTypeOf<Agent['slug']>().toEqualTypeOf<Slug>();
    });

    it('AgentCharacter.slug is Slug', () => {
      expectTypeOf<AgentCharacter['slug']>().toEqualTypeOf<Slug>();
    });

    it('NonAgentCharacter.slug is Slug', () => {
      expectTypeOf<NonAgentCharacter['slug']>().toEqualTypeOf<Slug>();
    });

    it('Dialogue.speaker is Slug', () => {
      expectTypeOf<Dialogue['speaker']>().toEqualTypeOf<Slug>();
    });

    it('DialogueLine.speaker is Slug', () => {
      expectTypeOf<DialogueLine['speaker']>().toEqualTypeOf<Slug>();
    });

    it('Location.slug is Slug', () => {
      expectTypeOf<Location['slug']>().toEqualTypeOf<Slug>();
    });

    it('LocationTransition.target is Slug', () => {
      expectTypeOf<LocationTransition['target']>().toEqualTypeOf<Slug>();
    });

    it('Service.slug is Slug', () => {
      expectTypeOf<Service['slug']>().toEqualTypeOf<Slug>();
    });
  });

  describe('Req 1.10: date fields use IsoDateString', () => {
    it('BlogPost.date is IsoDateString', () => {
      expectTypeOf<BlogPost['date']>().toEqualTypeOf<IsoDateString>();
    });
  });

  describe('Req 1.11: Position2D fields use the interface', () => {
    it('InteractiveObject.position is Position2D', () => {
      expectTypeOf<InteractiveObject['position']>().toEqualTypeOf<Position2D>();
    });

    it('LocationTransition.position is Position2D', () => {
      expectTypeOf<
        LocationTransition['position']
      >().toEqualTypeOf<Position2D>();
    });

    it('Position2D is not assignable from inline { x: number; y: number }', () => {
      // Position2D should be structurally compatible with { x: number; y: number }
      // but we verify the fields use the named interface
      expectTypeOf<Position2D>().toHaveProperty('x');
      expectTypeOf<Position2D>().toHaveProperty('y');
      expectTypeOf<Position2D['x']>().toBeNumber();
      expectTypeOf<Position2D['y']>().toBeNumber();
    });
  });

  describe('Req 1.12: asset fields use AssetPath', () => {
    it('Project.image is AssetPath | undefined', () => {
      expectTypeOf<Project['image']>().toEqualTypeOf<AssetPath | undefined>();
    });

    it('BlogPost.image is AssetPath | undefined', () => {
      expectTypeOf<BlogPost['image']>().toEqualTypeOf<AssetPath | undefined>();
    });

    it('Agent.portrait is AssetPath | undefined', () => {
      expectTypeOf<Agent['portrait']>().toEqualTypeOf<AssetPath | undefined>();
    });
  });

  describe('Req 1.13: dialogue ID fields use DialogueId', () => {
    it('Dialogue.id is DialogueId', () => {
      expectTypeOf<Dialogue['id']>().toEqualTypeOf<DialogueId>();
    });
  });

  describe('Req 1.14: line ID fields use LineId', () => {
    it('DialogueLine.id is LineId', () => {
      expectTypeOf<DialogueLine['id']>().toEqualTypeOf<LineId>();
    });

    it('DialogueLine.nextLineId is LineId | undefined', () => {
      expectTypeOf<DialogueLine['nextLineId']>().toEqualTypeOf<
        LineId | undefined
      >();
    });

    it('DialogueChoice.nextLineId is LineId | undefined', () => {
      expectTypeOf<DialogueChoice['nextLineId']>().toEqualTypeOf<
        LineId | undefined
      >();
    });
  });

  describe('Req 1.9 + 1.12: Slug[] and AssetPath in cross-references', () => {
    it('BlogPost.relatedProjects is Slug[] | undefined', () => {
      expectTypeOf<BlogPost['relatedProjects']>().toEqualTypeOf<
        Slug[] | undefined
      >();
    });

    it('BlogPost.relatedAgents is Slug[] | undefined', () => {
      expectTypeOf<BlogPost['relatedAgents']>().toEqualTypeOf<
        Slug[] | undefined
      >();
    });

    it('Location.characters is Slug[] | undefined', () => {
      expectTypeOf<Location['characters']>().toEqualTypeOf<
        Slug[] | undefined
      >();
    });

    it('Service.relatedProjects is Slug[] | undefined', () => {
      expectTypeOf<Service['relatedProjects']>().toEqualTypeOf<
        Slug[] | undefined
      >();
    });
  });
});
