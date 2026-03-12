import { MDXRemote } from 'next-mdx-remote/rsc';
import type { JSX } from 'react';

/**
 * Render a raw MDX string as a React Server Component element.
 * Custom components deferred to UI spec.
 */
export async function renderMDX(source: string): Promise<JSX.Element> {
  return MDXRemote({ source });
}
