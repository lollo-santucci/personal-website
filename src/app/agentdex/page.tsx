import type { Metadata } from 'next';
import { getAgents } from '@/lib/content';
import { sortAgentsByName } from '@/lib/content/agent-utils';
import AgentCard from '@/components/AgentCard';

export const metadata: Metadata = {
  title: 'Agentdex',
  description:
    "Browse Lorenzo's AI agents — specialized entities built to assist with real-world tasks.",
  alternates: { canonical: '/agentdex' },
};

export default async function AgentdexPage() {
  const agents = sortAgentsByName(await getAgents());

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Agentdex</h1>
      <p className="mt-2 text-gray-600">
        Lorenzo&apos;s AI agents, built to assist with real-world tasks from
        code review to client intake.
      </p>
      {agents.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.slug} agent={agent} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-gray-500">No agents yet.</p>
      )}
    </article>
  );
}
