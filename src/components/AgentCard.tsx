import TransitionLink from '@/components/TransitionLink';
import AgentSprite from '@/components/AgentSprite';
import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import { formatAgentIndex } from '@/lib/format';
import type { Agent } from '@/lib/types';

interface AgentCardProps {
  agent: Agent;
}

const roleVariant: Record<string, BadgeVariant> = {
  host: 'yellow',
  friend: 'blue',
  employee: 'violet',
};

function roleBadge(role: string) {
  const variant = roleVariant[role.toLowerCase()] ?? 'dark';
  return <Badge variant={variant}>{role}</Badge>;
}

export default function AgentCard({ agent }: AgentCardProps) {
  return (
    <article className="flex flex-col items-center">
      <TransitionLink
        href={`/agentdex/${String(agent.slug)}`}
        className="group flex flex-col items-start"
      >
        <AgentSprite
          slug={String(agent.slug)}
          name={agent.name}
          scale={{ base: 3, md: 4, xl: 4, '2xl': 5 }}
          className="self-center"
        />
        <div className="flex items-left gap-2 md:gap-3 mt-4 md:mt-5">
          <span className="font-pixbob-regular text-2xl md:text-4xl xl:text-[38px] 2xl:text-[48px] text-text-muted">
            #{formatAgentIndex(agent.index)}
          </span>
          {roleBadge(agent.role)}
        </div>
        <span className="font-pixbob-regular text-3xl md:text-4xl xl:text-[38px] 2xl:text-[48px] text-text mt-1 md:mt-2">
          {agent.name}
        </span>
      </TransitionLink>
    </article>
  );
}
