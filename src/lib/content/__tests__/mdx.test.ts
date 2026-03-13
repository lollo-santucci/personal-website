import { describe, it, expect, vi } from 'vitest';

/**
 * Property 15: MDX rendering accepts string and produces output
 * **Validates: Requirements 8.3**
 *
 * MDXRemote from next-mdx-remote/rsc requires a React Server Component
 * environment. In Vitest we mock the module and verify renderMDX delegates
 * correctly with the source string.
 */

vi.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: vi.fn(({ source }: { source: string }) => ({
    type: 'mdx-output',
    props: { source },
  })),
}));

import { renderMDX } from '../mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';

const MDX_INPUTS = [
  { label: 'heading', source: '# Hello' },
  { label: 'paragraph', source: 'A paragraph.' },
  { label: 'list', source: '- item 1\n- item 2' },
];

describe('MDX rendering utility', () => {
  it.each(MDX_INPUTS)(
    'renderMDX does not throw and returns truthy output for $label',
    ({ source }) => {
      const result = renderMDX(source);
      expect(result).toBeTruthy();
    },
  );

  it.each(MDX_INPUTS)(
    'renderMDX passes source string to MDXRemote for $label',
    ({ source }) => {
      renderMDX(source);
      expect(MDXRemote).toHaveBeenCalledWith(
        expect.objectContaining({ source }),
      );
    },
  );

  it('passes custom components including anchor override to MDXRemote', () => {
    renderMDX('test');
    const call = vi.mocked(MDXRemote).mock.calls.at(-1)?.[0] as Record<
      string,
      unknown
    >;
    expect(call).toHaveProperty('components');
    const comps = call.components as Record<string, unknown>;
    expect(comps).toHaveProperty('a');
    expect(typeof comps.a).toBe('function');
  });
});
