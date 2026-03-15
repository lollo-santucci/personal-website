import type { Metadata } from 'next';
import {
  getPageBySlug,
  getAgentBySlug,
  renderMDX,
  getBlogPosts,
  getProjects,
} from '@/lib/content';
import InnerPageLayout from '@/components/InnerPageLayout';
import Prose from '@/components/ui/Prose';
import SectionLabel from '@/components/ui/SectionLabel';
import StatBar, { StatBarGroup } from '@/components/ui/StatBar';
import RPGSelector from '@/components/ui/RPGSelector';
import Button from '@/components/ui/Button';
import type { CrossLinkSection } from '@/components/ui/CrossLinks';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('about');

  return {
    title: page?.title ?? 'About',
    ...(page?.description ? { description: page.description } : {}),
    alternates: { canonical: '/about' },
  };
}

/**
 * Character sprite crop from agent spritesheet.
 * Front-facing idle = column 3, row 0. Frame size: 32×64 (2 tiles tall).
 * Rendered as CSS background-position crop at 4× scale with pixelated rendering.
 */
function AgentSprite({ slug, name }: { slug: string; name: string }) {
  const frameW = 32;
  const frameH = 64;
  const scale = 4;
  const col = 3;
  const row = 0;
  const displayW = frameW * scale;
  const displayH = frameH * scale;

  return (
    <div
      role="img"
      aria-label={`${name} character sprite`}
      className="pixel-art mx-auto"
      style={{
        width: displayW,
        height: displayH,
        backgroundImage: `url(/assets/agents/${slug}/spritesheets/character_spritesheet.png)`,
        backgroundPosition: `-${col * displayW}px -${row * displayH}px`,
        backgroundSize: 'auto',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    />
  );
}

export default async function AboutPage() {
  const [page, agent, blogPosts, projects] = await Promise.all([
    getPageBySlug('about'),
    getAgentBySlug('lorenzo-santucci'),
    getBlogPosts(),
    getProjects(),
  ]);

  const title = page?.title ?? 'About';

  let mdxContent: React.ReactNode = null;
  if (page) {
    try {
      mdxContent = await renderMDX(page.content);
    } catch (error) {
      console.error('Failed to render about page MDX content:', error);
      mdxContent = <p>Content could not be rendered.</p>;
    }
  }

  const crossLinkSections: [CrossLinkSection, CrossLinkSection] = [
    {
      title: 'Blog',
      href: '/blog',
      items: blogPosts.slice(0, 3).map((post) => ({
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
      title={title}
      ctaHeadline="Have a project in mind?"
      ctaBody="Let's talk about how to turn it into something clear, useful and well built."
      crossLinkSections={crossLinkSections}
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12 xl:gap-16">
        {/* Left column: prose content */}
        <div className="lg:flex-1">
          {mdxContent ? (
            <Prose>{mdxContent}</Prose>
          ) : (
            <div />
          )}
        </div>

        {/* Right column: agentdex-style profile sidebar */}
        <aside className="flex flex-col gap-6 lg:w-80 xl:w-96 lg:shrink-0">
          {agent && (
            <>
              {/* Character sprite */}
              <AgentSprite slug={String(agent.slug)} name={agent.name} />

              {/* Role */}
              <div>
                <SectionLabel variant="dark" as="h2">role</SectionLabel>
                <p className="mt-2 flex items-start gap-2 font-pixbob-regular text-lg md:text-xl xl:text-[26px]">
                  <RPGSelector className="shrink-0" />
                  <span>{agent.role}</span>
                </p>
              </div>

              {/* Best for */}
              <div>
                <SectionLabel variant="dark" as="h2">best for</SectionLabel>
                <ul className="mt-2 flex flex-col gap-1">
                  {agent.bestFor.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 font-pixbob-regular text-lg md:text-xl xl:text-[26px]"
                    >
                      <RPGSelector className="shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mission */}
              <div>
                <SectionLabel variant="blue" as="h2">mission</SectionLabel>
                <div className="mt-2 border-standard border-black p-4">
                  <p className="font-pixbob-regular text-lg md:text-xl xl:text-[26px]">
                    {agent.mission}
                  </p>
                </div>
              </div>

              {/* Tone of Voice */}
              <div>
                <SectionLabel variant="lime" as="h2">tone of voice</SectionLabel>
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
            </>
          )}

          {/* Contact CTA — always visible regardless of agent data */}
          <Button variant="primary" size="md" href="/contact" className="w-full justify-center">
            contact me
          </Button>
        </aside>
      </div>
    </InnerPageLayout>
  );
}
