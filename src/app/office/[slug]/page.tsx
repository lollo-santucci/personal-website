import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAgents, getAgentBySlug } from '@/lib/content';

export async function generateStaticParams() {
  const agents = await getAgents();
  return agents.map((a) => ({ slug: String(a.slug) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) return {};
  return {
    title: agent.name,
    description: agent.role,
    alternates: { canonical: `/office/${slug}` },
  };
}

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) notFound();

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
      <p className="mt-2 text-lg text-gray-600">{agent.role}</p>
      <p className="mt-4">{agent.personality}</p>
      <ul className="mt-4 list-disc pl-5 space-y-1">
        {agent.capabilities.map((cap) => (
          <li key={cap}>{cap}</li>
        ))}
      </ul>
    </article>
  );
}
