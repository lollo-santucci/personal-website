import type { BlogPost, Project, Service, Page } from '@/lib/types';

/** Blog posts: date descending, then title ascending (case-insensitive). */
export function compareBlogPosts(a: BlogPost, b: BlogPost): number {
  const dateCompare = b.date.localeCompare(a.date);
  if (dateCompare !== 0) return dateCompare;
  return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
}

/** Projects: order ascending (0 valid, undefined last), then title ascending (case-insensitive). */
export function compareProjects(a: Project, b: Project): number {
  const aOrder = a.order ?? Infinity;
  const bOrder = b.order ?? Infinity;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
}

/** Services: order ascending (0 valid, undefined last), then title ascending (case-insensitive). */
export function compareServices(a: Service, b: Service): number {
  const aOrder = a.order ?? Infinity;
  const bOrder = b.order ?? Infinity;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
}

/** Pages: title ascending (case-insensitive). */
export function comparePages(a: Page, b: Page): number {
  return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
}
