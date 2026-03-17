import type { Metadata } from 'next';
import { getAgents, getBlogPosts, getProjects } from '@/lib/content';
import { formatAgentIndex } from '@/lib/format';
import { sortAgentsByIndex } from '@/lib/content/agent-utils';
import InnerPageLayout from '@/components/InnerPageLayout';
import CollectionContainer from '@/components/ui/CollectionContainer';
import CollectionRow from '@/components/ui/CollectionRow';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import RPGSelector from '@/components/ui/RPGSelector';
import Reveal from '@/components/Reveal';
import type { CrossLinkSection } from '@/components/ui/CrossLinks';

export const metadata: Metadata = {
  title: 'Agentdex',
  description:
    "Browse Lorenzo's AI agents — specialized entities built to assist with real-world tasks.",
  alternates: { canonical: '/agentdex' },
};

/** Frame dimensions for agent spritesheets (32x64 per frame). */
const FRAME_W = 32;
const FRAME_H = 64;
/** Front-facing idle frame: column 3, row 0. */
const FRONT_COL = 3;
const FRONT_ROW = 0;
const PORTRAIT_SCALE = 2;

function AgentPortrait({ slug, name }: { slug: string; name: string }) {
  const src = `/assets/agents/${slug}/spritesheets/character_spritesheet.png`;
  const displayW = FRAME_W * PORTRAIT_SCALE;
  const displayH = FRAME_H * PORTRAIT_SCALE;
  const bgX = FRONT_COL * displayW;
  const bgY = FRONT_ROW * displayH;

  return (
    <div
      role="img"
      aria-label={`${name} portrait`}
      className="pixel-art shrink-0"
      style={{
        width: displayW,
        height: displayH,
        backgroundImage: `url(${src})`,
        backgroundPosition: `-${bgX}px -${bgY}px`,
        backgroundSize: 'auto',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    />
  );
}

function statusBadge(status: string) {
  if (status === 'coming-soon') {
    return (
      <Badge variant="violet" className="shrink-0">
        Coming Soon
      </Badge>
    );
  }
  if (status === 'experimental') {
    return (
      <Badge variant="lime" className="shrink-0">
        Experimental
      </Badge>
    );
  }
  return null;
}

export default async function AgentdexPage() {
  const [agents, posts, projects] = await Promise.all([
    getAgents(),
    getBlogPosts(),
    getProjects(),
  ]);

  const sortedAgents = sortAgentsByIndex(agents);

  const crossLinkSections: [CrossLinkSection, CrossLinkSection] = [
    {
      title: 'Blog',
      href: '/blog',
      items: posts.slice(0, 3).map((post) => ({
        label: post.title,
        href: `/blog/${String(post.slug)}`,
      })),
    },
    {
      title: 'Projects',
      href: '/projects',
      items: projects.slice(0, 3).map((project) => ({
        label: project.title,
        href: `/projects/${String(project.slug)}`,
      })),
    },
  ];

  return (
    <InnerPageLayout
      title="Agentdex"
      ctaHeadline="Want to build an Agent?"
      ctaBody="Hire me!"
      crossLinkSections={crossLinkSections}
    >
      {sortedAgents.length > 0 ? (
        <CollectionContainer>
          <div className="flex flex-col gap-3 md:gap-4">
            {sortedAgents.map((agent, index) => (
              <Reveal key={String(agent.slug)} delay={index * 80}>
                <CollectionRow
                  action={
                    <Button
                      variant="secondary"
                      size="sm"
                      href={`/agentdex/${String(agent.slug)}`}
                    >
                      Meet
                    </Button>
                  }
                >
                  <div className="flex items-center gap-3 font-pixbob-regular text-xl md:text-2xl xl:text-[32px]">
                    <AgentPortrait
                      slug={String(agent.slug)}
                      name={agent.name}
                    />
                    <span className="shrink-0 text-text-muted">
                      {formatAgentIndex(agent.index)}
                    </span>
                    <RPGSelector className="shrink-0 -mr-4" />
                    <span className="truncate">{agent.name}</span>
                    {statusBadge(agent.status)}
                  </div>
                </CollectionRow>
              </Reveal>
            ))}
          </div>
        </CollectionContainer>
      ) : (
        <CollectionContainer>
          <p className="font-pixbob-regular text-lg md:text-xl xl:text-[26px] text-text-muted">
            No agents yet. Check back soon!
          </p>
        </CollectionContainer>
      )}
    </InnerPageLayout>
  );
}
