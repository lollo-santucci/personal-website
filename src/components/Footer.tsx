import Image from 'next/image';
import TransitionLink from '@/components/TransitionLink';
import Button from '@/components/ui/Button';

interface FooterProps {
  variant?: 'rich' | 'minimal';
}

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'Agentdex', href: '/agentdex' },
  { label: 'Contact', href: '/contact' },
] as const;

function SocialIcons() {
  return (
    <div className="flex items-center gap-4">
      <a
        href="https://linkedin.com/in/lorenzosantucci"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/linkedin-icon-pixel.svg"
          alt=""
          className="pixel-art size-6 transition-transform duration-200 motion-reduce:transition-none hover:scale-125"
          aria-hidden="true"
        />
      </a>
      <a
        href="https://github.com/lollo-santucci"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center"
      >
        <Image
          src="/icons/github-pixel-icon.png"
          alt=""
          width={25}
          height={25}
          className="pixel-art transition-transform duration-200 motion-reduce:transition-none hover:scale-125"
          aria-hidden="true"
        />
      </a>
    </div>
  );
}

function MinimalFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-6 py-8 md:px-12 xl:px-page-px">
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

function RichFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-6 py-10 md:px-12 md:py-14 xl:px-page-px xl:py-16">
      <div className="mx-auto max-w-content-max bg-primary px-[50px] py-[25px] outline outline-3 outline-text">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_auto_auto] md:gap-16">
          <div className="flex flex-col gap-2">
            <span
              className="font-pixbob-bold text-2xl text-surface md:text-3xl xl:text-[46px]"
              style={{
                WebkitTextStrokeWidth: '10px',
                WebkitTextStrokeColor: 'var(--black)',
                paintOrder: 'stroke fill',
              }}
            >
              Lorenzo Santucci
            </span>
            <span className="font-pixbob-regular text-base text-text-muted md:text-lg xl:text-[28px]">
              Freelance tech builder
            </span>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="flex flex-col gap-2 md:gap-3">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <TransitionLink
                    href={href}
                    className="group relative inline-block font-pixbob-regular text-base text-text md:text-lg xl:text-[28px]"
                  >
                    {label}
                    <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-text transition-transform duration-200 motion-reduce:transition-none group-hover:scale-x-100" />
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-start">
            <SocialIcons />
          </div>
        </div>

        <div className="mt-10 border-t-2 border-text md:mt-14" />

        <div className="mt-4 flex flex-col items-center justify-between gap-2 md:flex-row md:mt-6">
          <span className="font-pixbob-lite text-sm text-text-muted md:text-base xl:text-[22px]">
            &copy; {year} Lorenzo Santucci
          </span>
          <span className="font-pixbob-lite text-sm text-text-muted md:text-base xl:text-[22px]">
            Built with &hearts;
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function Footer({ variant = 'rich' }: FooterProps) {
  if (variant === 'minimal') return <MinimalFooter />;
  return <RichFooter />;
}
