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
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import AgentSprite from '@/components/AgentSprite';
import LogoMarquee from '@/components/ui/LogoMarquee';
import TransitionLink from '@/components/TransitionLink';
import type { CrossLinkSection } from '@/components/ui/CrossLinks';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('about');

  return {
    title: page?.title ?? 'About',
    ...(page?.description ? { description: page.description } : {}),
    alternates: { canonical: '/about' },
  };
}


const TRUSTED_BY_LOGOS = [
  { src: '/assets/logos/logo-indigo.svg', alt: 'indigo.ai', href: 'https://indigo.ai', height: 28, className: 'h-7 md:h-18' },
  { src: '/assets/logos/logo-openeconomics.svg', alt: 'OpenEconomics', href: 'https://openeconomics.eu', height: 28, className: 'h-7 md:h-18' },
  { src: '/assets/logos/logo-romatropicale.svg', alt: 'Roma Tropicale', href: 'https://romatropicale.com', height: 80, className: 'h-16 md:h-28' },
  { src: '/assets/logos/logo-odda.svg', alt: 'Odda', href: 'https://www.oddastudio.com/', height: 28, className: 'h-7 md:h-18' },
] as const;

export default async function AboutPage() {
  const [page, agent, blogPosts, projects] = await Promise.all([
    getPageBySlug('about'),
    getAgentBySlug('lorenzo-santucci'),
    getBlogPosts(),
    getProjects(),
  ]);

  const title = page?.title ?? 'About me';

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
      afterContent={
        <div>
          <div className="px-6 md:px-12 xl:px-[120px] 2xl:px-page-px">
            <div className="mx-auto max-w-content-max">
              <h2 className="font-pixbob-bold text-2xl md:text-3xl xl:text-[38px] 2xl:text-[48px]">Trusted by</h2>
            </div>
          </div>
          <div className="mt-12">
            <LogoMarquee logos={TRUSTED_BY_LOGOS} />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-8 lg:flex-row xl:gap-5 2xl:gap-[25px]">
        {/* Left column: prose content */}
        <div className="lg:flex-[50] lg:min-w-0">
          {mdxContent ? (
            <Prose>{mdxContent}</Prose>
          ) : (
            <div />
          )}
        </div>

        {/* Right column: agentdex-style profile sidebar */}
        <aside className="flex flex-col gap-6 xl:gap-5 2xl:gap-[25px] lg:flex-[50] lg:min-w-0 md:px-20">
          {agent && (
            <>
              {/* Header row: agentdex badge (with arrow icon) + ID label */}
              <div className="flex items-center justify-center gap-4 xl:gap-[10px]">
                <TransitionLink href="/agentdex" className="group">
                  <Badge variant="accent">
                    agentdex
                    <ArrowUpRight className="ml-1 size-2.5 xl:size-[10px]" />
                  </Badge>
                </TransitionLink>
                <span className="border-standard border-black outline outline-3 outline-text bg-surface px-3 py-1.5 font-pixbob-regular text-lg md:text-2xl xl:text-[32px] 2xl:text-[40px] leading-[32px]">
                  001 - {agent.name}
                </span>
              </div>

              {/* Sprite + Role/BestFor side by side */}
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between xl:px-15">
                {/* Animated character sprite */}
                <div className="shrink-0">
                  <AgentSprite
                    slug="lorenzo-santucci"
                    name={agent.name}
                    scale={6}
                    animations={['read-book', 'walk-up', 'walk-right']}
                    autoPlay
                  />
                </div>

                {/* Role + Best for */}
                <div className="flex flex-col gap-6 xl:gap-5 2xl:gap-[25px]">
                  <div className="flex flex-col gap-4 xl:gap-5 2xl:gap-[25px]">
                    <SectionLabel variant="dark" as="h2">Role</SectionLabel>
                    <p className="flex items-center font-pixbob-regular text-lg md:text-xl xl:text-[26px] 2xl:text-[32px]">
                      <span className="w-[1em] text-[40px] leading-none shrink-0">{'>'}</span>
                      <span className="leading-[32px]">{agent.role}</span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 xl:gap-5 2xl:gap-[25px]">
                    <SectionLabel variant="dark" as="h2">Best for</SectionLabel>
                    <ul className="flex flex-col gap-1">
                      {agent.bestFor.map((item) => (
                        <li
                          key={item}
                          className="flex items-center font-pixbob-regular text-lg md:text-xl xl:text-[26px] 2xl:text-[32px]"
                        >
                          <span className="w-[1em] text-[40px] leading-none shrink-0">{'>'}</span>
                          <span className="leading-[32px]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Mission */}
              <div className="flex flex-col gap-4 xl:gap-5 2xl:gap-[25px] xl:px-10 xl:my-12">
                <SectionLabel variant="blue" as="h2">Mission</SectionLabel>
                <div className="border-standard border-black outline outline-3 outline-text px-4 py-3 xl:px-[25px] xl:py-4">
                  <p className="font-pixbob-regular text-lg md:text-xl xl:text-[24px] 2xl:text-[28px] leading-[32px]">
                    {agent.mission}
                  </p>
                </div>
              </div>

              {/* Tone of Voice */}
              <div className="flex flex-col gap-4 xl:gap-5 2xl:gap-[25px] xl:px-10">
                <SectionLabel variant="lime" as="h2">Tone of Voice</SectionLabel>
                <StatBarGroup>
                  <StatBar label="Warm" value={agent.toneOfVoice.warm} />
                  <StatBar label="Direct" value={agent.toneOfVoice.direct} />
                  <StatBar label="Playful" value={agent.toneOfVoice.playful} />
                  <StatBar label="Formal" value={agent.toneOfVoice.formal} />
                  <StatBar label="Calm" value={agent.toneOfVoice.calm} />
                </StatBarGroup>
              </div>
            </>
          )}

          {/* CTA — right-aligned */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              href="/agentdex/lorenzo-santucci"
              className="xl:text-[26px] 2xl:text-[32px] xl:px-3 xl:py-1.5"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 34 34"
                  fill="currentColor"
                  className="size-[34px]"
                  aria-hidden="true"
                >
                  {/* Pixel-art chat bubble */}
                  <rect x="3" y="6" width="28" height="18" rx="0" />
                  <rect x="7" y="24" width="4" height="4" />
                  <rect x="3" y="24" width="4" height="4" />
                  {/* Dots */}
                  <rect x="10" y="12" width="4" height="4" fill="var(--accent)" />
                  <rect x="15" y="12" width="4" height="4" fill="var(--accent)" />
                  <rect x="20" y="12" width="4" height="4" fill="var(--accent)" />
                </svg>
              }
            >
              let&apos;s talk
            </Button>
          </div>
        </aside>
      </div>

    </InnerPageLayout>
  );
}
