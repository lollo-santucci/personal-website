import type { Slug } from './common';

/** A static or semi-static content entry representing a major site section. */
export interface Page {
  title: string;
  slug: Slug;
  content: string;
  description?: string;
}
