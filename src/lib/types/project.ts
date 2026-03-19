import type { AssetPath, Slug } from './common';

/** A portfolio entry representing work Lorenzo has built. */
export interface Project {
  title: string;
  slug: Slug;
  description: string;
  content: string;
  stack: string[];
  categories: string[];
  status: 'completed' | 'in-progress' | 'ongoing';
  highlight: boolean;
  links?: {
    live?: string;
    github?: string;
    demo?: string;
  };
  image?: AssetPath;
  video?: AssetPath;
  order?: number;
  integrations?: Array<{ name: string; category: string; variant?: string }>;
  metrics?: Array<{ label: string; value: string; color?: string }>;
}
