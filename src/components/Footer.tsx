import Image from 'next/image';
import TransitionLink from '@/components/TransitionLink';
import Button from '@/components/ui/Button';
import FooterInvaders from '@/components/FooterInvaders';
import TottiLayingSprite from '@/components/TottiLayingSprite';
import RPGSelector from '@/components/ui/RPGSelector';

interface FooterProps {
  variant?: 'rich' | 'minimal';
}

const NAV_LINKS = [
  { label: 'ABOUT', href: '/about' },
  { label: 'PROJECTS', href: '/projects' },
  { label: 'AGENTDEX', href: '/agentdex' },
  { label: 'BLOG', href: '/blog' },
] as const;

function SocialIcons({ fluid }: { fluid?: boolean }) {
  const gap = fluid ? 'gap-[0.8cqw]' : 'gap-4';
  const iconClass = fluid
    ? 'pixel-art transition-transform duration-200 motion-reduce:transition-none hover:scale-125'
    : 'pixel-art size-6 transition-transform duration-200 motion-reduce:transition-none hover:scale-125';
  const iconStyle = fluid ? { width: '3.5cqw', height: '3.5cqw' } : undefined;
  const tapTarget = fluid ? '' : 'min-h-[44px] min-w-[44px]';

  return (
    <div className={`flex items-center ${gap}`}>
      <a
        href="https://linkedin.com/in/lorenzosantucci"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        className={`flex items-center justify-center ${tapTarget}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/linkedin-icon-pixel.svg"
          alt=""
          className={iconClass}
          style={iconStyle}
          aria-hidden="true"
        />
      </a>
      <a
        href="https://github.com/lollo-santucci"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className={`flex items-center justify-center ${tapTarget}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/github-pixel-icon.png"
          alt=""
          className={iconClass}
          style={iconStyle}
          aria-hidden="true"
        />
      </a>
    </div>
  );
}

function MinimalFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-6 py-8 md:px-12 xl:px-[120px] 2xl:px-page-px">
      <div className="mx-auto flex max-w-content-max flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <span className="flex items-center gap-1.5 font-pixbob-lite text-sm text-text md:text-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/copyright.svg"
              alt=""
              className="pixel-art size-5"
              aria-hidden="true"
            />
            Lorenzo Santucci {year}
          </span>
          <SocialIcons />
        </div>
        <Button
          variant="primary"
          size="sm"
          href="/contact"
          className="outline outline-[3px] outline-black md:text-xl"
          icon={
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/icons/email-mail-chat-pixel.svg"
              alt=""
              className="pixel-art size-[1em]"
              aria-hidden="true"
            />
          }
        >
          contact me
        </Button>
      </div>
    </footer>
  );
}

function ArcadeFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-6 py-10 md:px-12 md:py-14 lg:px-20 xl:px-60 xl:py-20 2xl:px-95">
      <div className="mx-auto max-w-content-max">
        {/* ── Room illustration — @container for fluid scaling ─── */}
        <div className="@container relative mx-auto w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/imgs/isometric-room.svg"
            alt="Isometric pixel-art room illustration"
            className="pixel-art w-full"
            loading="lazy"
          />

          {/* ── "Lorenzo Santucci" — left wall ────────────────── */}
          <span
            className="absolute left-[9%] top-[19%] origin-bottom-left rotate-[-27deg] font-pixbob-bold text-[5cqw] text-surface"
            style={{
              WebkitTextStrokeWidth: '0.7cqw',
              WebkitTextStrokeColor: 'var(--black)',
              paintOrder: 'stroke fill',
            }}
          >
            Lorenzo Santucci
          </span>

          {/* ── "Freelance tech builder" — right wall ─────────── */}
          <span className="absolute right-[12%] top-[18%] origin-bottom-right rotate-[28deg] font-pixbob-regular text-[3.5cqw] text-text">
            Freelance tech builder
          </span>

          {/* ── Totti on the couch ────────────────────────────── */}
          <TottiLayingSprite
            className="absolute left-[52%] top-[26%]"
            style={{
              width: '19cqw',
              height: '19cqw',
              transform: 'rotate(26deg) skewX(15deg)',
            }}
          />

          {/* ── FooterInvaders on the TV ──────────────────────── */}
          <div
            className="absolute left-[13.5%] top-[39.1%] hidden h-[35%] w-[25%] overflow-hidden md:block"
            style={{
              width: '20cqw',
              height: '12.2cqw',
              transform: 'rotate(-26.2deg) skewX(-26deg)',
              transformOrigin: 'center center',
            }}
          >
            <FooterInvaders />
          </div>

          {/* ── Copyright + social — bottom-left, follows left floor angle ── */}
          <div className="absolute bottom-[18%] left-[8%] origin-bottom-left rotate-[27deg]">
            <div className="flex items-center gap-[0.8cqw]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/copyright.svg"
                alt=""
                className="pixel-art"
                style={{ width: '2.5cqw', height: '2.5cqw' }}
                aria-hidden="true"
              />
              <span className="font-pixbob-lite text-[2.8cqw] text-text">
                Lorenzo Santucci {year}
              </span>
              <SocialIcons fluid />
            </div>
          </div>

          {/* ── Navigation — bottom-right, follows right floor angle ── */}
          <nav
            className="absolute bottom-[20%] right-[6%] origin-bottom-right rotate-[-28deg]"
            aria-label="Footer navigation"
          >
            <ul className="flex items-center gap-x-[1.5cqw]">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <TransitionLink
                    href={href}
                    className="group relative inline-flex items-center gap-[0.5cqw] font-pixbob-regular text-[3cqw] text-text"
                  >
                    <span className="inline font-pixbob-regular text-[3cqw] text-text opacity-0 -translate-x-2 transition-all duration-200 motion-reduce:transition-none group-hover:opacity-100 group-hover:translate-x-0">
                      {'>'}
                    </span>
                    {label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default function Footer({ variant = 'rich' }: FooterProps) {
  if (variant === 'minimal') return <MinimalFooter />;
  return <ArcadeFooter />;
}
