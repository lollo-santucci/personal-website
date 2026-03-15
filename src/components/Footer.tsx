import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-6 py-8 md:px-12 xl:px-page-px">
      <div className="mx-auto flex max-w-content-max flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left section: copyright + social icons */}
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
                className="pixel-art size-6 transition-transform duration-200 hover:scale-125"
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
                className="pixel-art transition-transform duration-200 hover:scale-125"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        {/* Right section: contact CTA */}
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
