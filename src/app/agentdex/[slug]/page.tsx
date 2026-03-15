import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAgents, getAgentBySlug } from '@/lib/content';
import StatusBadge from '@/components/StatusBadge';
import ChatPlaceholder from '@/components/ChatPlaceholder';

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
    description: `${agent.name} — an AI agent specializing in ${agent.role}.`,
    alternates: { canonical: `/agentdex/${slug}` },
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
      <Link
        href="/agentdex"
        className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to Agentdex
      </Link>

      {agent.portrait && (
        <div className="mb-6 h-48 w-48 overflow-hidden rounded-lg">
          <img
            src={String(agent.portrait)}
            alt={agent.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mb-4 flex items-start gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
        <StatusBadge status={agent.status} />
      </div>

      <p className="mb-6 text-lg text-gray-600">{agent.role}</p>

      <section className="mb-8">
        <p className="whitespace-pre-line">{agent.personality}</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Capabilities</h2>
        <ul className="list-inside list-disc space-y-1">
          {agent.capabilities.map((cap) => (
            <li key={cap}>{cap}</li>
          ))}
        </ul>
      </section>

      <ChatPlaceholder />
    </article>
  );
}
