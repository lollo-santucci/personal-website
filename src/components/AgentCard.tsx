import Link from 'next/link';
import type { Agent } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { getShortDescription } from '@/lib/content/agent-utils';

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/agentdex/${agent.slug}`}
      className="block rounded-lg border border-gray-200 p-5 transition-colors hover:border-gray-300"
    >
      <article>
        {agent.portrait && (
          <div className="mb-3 aspect-[4/3] overflow-hidden rounded-md">
            <img
              src={agent.portrait}
              alt={agent.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="mb-2 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{agent.name}</h2>
          <StatusBadge status={agent.status} />
        </div>

        <p className="mb-2 text-sm text-gray-500">{agent.role}</p>

        <p className="text-sm text-gray-600">
          {getShortDescription(agent.personality)}
        </p>
      </article>
    </Link>
  );
}
