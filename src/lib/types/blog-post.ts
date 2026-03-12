import type { AssetPath, IsoDateString, Slug } from './common';

/**
 * An article, essay, or tutorial written by Lorenzo.
 *
 * Cross-references (`relatedProjects`, `relatedAgents`) use `Slug` arrays.
 * Slug resolution to existing entities is validated by the content loader,
 * not at the type level.
 */
export interface BlogPost {
  title: string;
  slug: Slug;
  excerpt: string;
  content: string;
  date: IsoDateString;
  categories: string[];
  tags: string[];
  image?: AssetPath;
  relatedProjects?: Slug[];
  relatedAgents?: Slug[];
}
