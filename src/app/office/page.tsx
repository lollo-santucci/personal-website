import type { Metadata } from 'next';
import { getAgents } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Office',
  alternates: { canonical: '/office' },
};

export default async function OfficePage() {
  const agents = await getAgents();

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Office</h1>
      <ul className="mt-6 space-y-6">
        {agents.map((agent) => (
          <li key={agent.slug}>
            <a
              href={`/office/${agent.slug}`}
              className="text-lg font-semibold underline-offset-2 hover:underline"
            >
              {agent.name}
            </a>
            <p className="mt-1 text-sm text-gray-600">{agent.role}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
