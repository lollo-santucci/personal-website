/**
 * Type-level tests for Property 7: Export syntax correctness.
 *
 * Verifies that all type files under `src/lib/types/` are type-only modules —
 * no runtime values are exported. When a module uses only `export type` and
 * `export interface`, `import * as Module` yields an empty object at runtime.
 *
 * **Validates: Requirements 12.5**
 */

import { describe, it, expect } from 'vitest';

import * as CommonModule from '@/lib/types/common';
import * as PageModule from '@/lib/types/page';
import * as ProjectModule from '@/lib/types/project';
import * as BlogPostModule from '@/lib/types/blog-post';
import * as AgentModule from '@/lib/types/agent';
import * as CharacterModule from '@/lib/types/character';
import * as DialogueModule from '@/lib/types/dialogue';
import * as LocationModule from '@/lib/types/location';
import * as ServiceModule from '@/lib/types/service';
import * as BarrelModule from '@/lib/types/index';

describe('Property 7: Export syntax correctness', () => {
  it('common.ts exports no runtime values', () => {
    expect(Object.keys(CommonModule)).toHaveLength(0);
  });

  it('page.ts exports no runtime values', () => {
    expect(Object.keys(PageModule)).toHaveLength(0);
  });

  it('project.ts exports no runtime values', () => {
    expect(Object.keys(ProjectModule)).toHaveLength(0);
  });

  it('blog-post.ts exports no runtime values', () => {
    expect(Object.keys(BlogPostModule)).toHaveLength(0);
  });

  it('agent.ts exports no runtime values', () => {
    expect(Object.keys(AgentModule)).toHaveLength(0);
  });

  it('character.ts exports no runtime values', () => {
    expect(Object.keys(CharacterModule)).toHaveLength(0);
  });

  it('dialogue.ts exports no runtime values', () => {
    expect(Object.keys(DialogueModule)).toHaveLength(0);
  });

  it('location.ts exports no runtime values', () => {
    expect(Object.keys(LocationModule)).toHaveLength(0);
  });

  it('service.ts exports no runtime values', () => {
    expect(Object.keys(ServiceModule)).toHaveLength(0);
  });

  it('index.ts barrel export exports no runtime values', () => {
    expect(Object.keys(BarrelModule)).toHaveLength(0);
  });
});
