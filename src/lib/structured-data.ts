const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export interface WebSiteJsonLd {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
}

export interface PersonJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  url: string;
  jobTitle: string;
  sameAs: string[];
}

export interface BlogPostingJsonLd {
  '@context': 'https://schema.org';
  '@type': 'BlogPosting';
  headline: string;
  description?: string;
  datePublished?: string;
  author: { '@type': 'Person'; name: string; url: string };
  url: string;
}

export interface CreativeWorkJsonLd {
  '@context': 'https://schema.org';
  '@type': 'CreativeWork';
  name: string;
  description?: string;
  url: string;
  author: { '@type': 'Person'; name: string; url: string };
}

const author = {
  '@type': 'Person' as const,
  name: 'Lorenzo Santucci',
  url: siteUrl,
};

export function generateWebSiteJsonLd(): WebSiteJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lorenzo Santucci',
    url: siteUrl,
  };
}

export function generatePersonJsonLd(): PersonJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Lorenzo Santucci',
    url: siteUrl,
    jobTitle: 'Freelance Full-Stack Developer & ML/AI Engineer',
    sameAs: [
      'https://linkedin.com/in/lorenzosantucci',
      'https://github.com/lollo-santucci',
    ],
  };
}

export function generateBlogPostingJsonLd(post: {
  title: string;
  excerpt?: string;
  date?: string | Date;
  slug: string;
}): BlogPostingJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date ? new Date(String(post.date)).toISOString() : undefined,
    author,
    url: `${siteUrl}/blog/${post.slug}`,
  };
}

export function generateCreativeWorkJsonLd(project: {
  title: string;
  description?: string;
  slug: string;
}): CreativeWorkJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: `${siteUrl}/projects/${project.slug}`,
    author,
  };
}
