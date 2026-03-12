import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const quickLinks = [
  {
    href: '/projects',
    title: 'Projects',
    description: 'Real-world work in full-stack development and ML/AI.',
  },
  {
    href: '/blog',
    title: 'Blog',
    description: 'Thoughts on engineering, AI, and building things that work.',
  },
  {
    href: '/office',
    title: 'Office',
    description: 'Meet the AI agents — each one built for a purpose.',
  },
];

export default function Home() {
  return (
    <>
      <section className="py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Lorenzo Santucci</h1>
        <p className="mt-4 text-lg text-gray-600">
          Full-stack developer and ML/AI engineer.
        </p>
      </section>

      <section className="pb-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg border border-gray-200 p-6 transition-colors hover:border-gray-400 hover:bg-gray-50"
            >
              <h2 className="text-lg font-semibold">{link.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{link.description}</p>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
