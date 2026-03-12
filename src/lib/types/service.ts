import type { Slug } from './common';

/** A professional service offering with conversion-oriented content. */
export interface Service {
  title: string;
  slug: Slug;
  description: string;
  content: string;
  relatedProjects?: Slug[];
  cta?: {
    text: string;
    href: string;
  };
  order?: number;
}
