import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getAgents,
  getAgentBySlug,
  getBlogPosts,
  getProjects,
} from '@/lib/content';
import { formatAgentIndex } from '@/lib/format';
import InnerPageLayout from '@/components/InnerPageLayout';
import Breadcrumb from '@/components/Breadcrumb';
import ChatSection from '@/components/ChatSection';
import SectionLabel from '@/components/ui/SectionLabel';
import RPGSelector from '@/components/ui/RPGSelector';
import StatBar from '@/components/ui/StatBar';
import { StatBarGroup } from '@/components/ui/StatBar';
import type { CrossLinkSection } from '@/components/ui/CrossLinks';

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
    description: `${agent.role}. ${agent.mission}`,
    alternates: { canonical: `/agentdex/${slug}` },
  };
}

/** Frame dimensions for agent spritesheets (32×64 per frame). */
const FRAME_W = 32;
const FRAME_H = 64;
/** Front-facing idle frame: column 3, row 0. */
const FRONT_COL = 3;
const FRONT_ROW = 0;
/** Profile page uses 4× scale for a large character sprite. */
const PROFILE_SCALE = 4;

function AgentSprite({ slug, name }: { slug: string; name: string }) {
  const src = `/assets/agents/${slug}/spritesheets/character_spritesheet.png`;
  const displayW = FRAME_W * PROFILE_SCALE;
  const displayH = FRAME_H * PROFILE_SCALE;
  const bgX = FRONT_COL * displayW;
  const bgY = FRONT_ROW * displayH;

  return (
    <div
      role="img"
      aria-label={`${name} character sprite`}
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

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) notFound();

  const [posts, projects] = await Promise.all([
    getBlogPosts(),
    getProjects(),
  ]);

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
      title={agent.name}
      ctaHeadline="Want to build an Agent?"
      ctaBody="Hire me!"
      crossLinkSections={crossLinkSections}
      beforeTitle={
        <Breadcrumb
          items={[{ label: 'Agentdex', href: '/agentdex' }]}
          current={agent.name}
        />
      }
    >

      <span className="mt-2 block font-pixbob-regular text-2xl md:text-3xl text-text-muted opacity-60">
        #{formatAgentIndex(agent.index)}
      </span>

      {/* Two-column layout: sprite left, metadata right */}
      <div className="mt-6 flex flex-col lg:flex-row gap-8 md:gap-10">
        {/* Left column — large character sprite */}
        <div className="flex justify-center lg:justify-start shrink-0">
          <AgentSprite slug={String(agent.slug)} name={agent.name} />
        </div>

        {/* Right column — metadata sections */}
        <div className="flex flex-col gap-6 md:gap-8 flex-1">
          {/* Role */}
          <div>
            <SectionLabel variant="dark" as="h2">
              role
            </SectionLabel>
            <p className="mt-2 flex items-center gap-2 font-pixbob-regular text-lg md:text-xl xl:text-[28px]">
              <RPGSelector />
              <span>{agent.role}</span>
            </p>
          </div>

          {/* Best for */}
          <div>
            <SectionLabel variant="dark" as="h2">
              best for
            </SectionLabel>
            <ul className="mt-2 flex flex-col gap-1">
              {agent.bestFor.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 font-pixbob-regular text-lg md:text-xl xl:text-[28px]"
                >
                  <RPGSelector />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mission */}
          <div>
            <SectionLabel variant="blue" as="h2">
              mission
            </SectionLabel>
            <div className="mt-2 border-standard border-black bg-surface p-4 font-pixbob-regular text-lg md:text-xl xl:text-[28px]">
              {agent.mission}
            </div>
          </div>

          {/* Tone of Voice */}
          <div>
            <SectionLabel variant="lime" as="h2">
              tone of voice
            </SectionLabel>
            <div className="mt-2">
              <StatBarGroup>
                <StatBar label="warm" value={agent.toneOfVoice.warm} />
                <StatBar label="direct" value={agent.toneOfVoice.direct} />
                <StatBar label="playful" value={agent.toneOfVoice.playful} />
                <StatBar label="formal" value={agent.toneOfVoice.formal} />
                <StatBar label="calm" value={agent.toneOfVoice.calm} />
              </StatBarGroup>
            </div>
          </div>
        </div>
      </div>

      {/* Chat section below the two-column area */}
      <div className="mt-8 md:mt-10">
        <ChatSection agentName={agent.name} greeting={agent.greeting} />
      </div>
    </InnerPageLayout>
  );
}
