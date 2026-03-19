import { MDXRemote } from 'next-mdx-remote/rsc';
import type { AnchorHTMLAttributes, JSX } from 'react';
import ProjectMedia from '@/components/mdx/ProjectMedia';

/**
 * Custom anchor that opens external links in a new tab.
 */
function MdxAnchor(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal =
    typeof props.href === 'string' &&
    (props.href.startsWith('http://') || props.href.startsWith('https://'));

  if (isExternal) {
    return <a {...props} target="_blank" rel="noopener noreferrer" />;
  }

  return <a {...props} />;
}

const components = { a: MdxAnchor, ProjectMedia };

/**
 * Render a raw MDX string as a React Server Component element.
 * External links automatically open in a new tab.
 */
export async function renderMDX(source: string): Promise<JSX.Element> {
  return MDXRemote({ source, components });
}
