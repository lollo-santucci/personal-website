'use client';

import { useState, useEffect, useRef } from 'react';
import SectionLabel from '@/components/ui/SectionLabel';
import Button from '@/components/ui/Button';

export interface ChatSectionProps {
  agentName: string;
  greeting?: string;
}

const CHAR_INTERVAL_MS = 35;

export default function ChatSection({ agentName, greeting }: ChatSectionProps) {
  const displayGreeting =
    greeting ?? `Hi! I'm ${agentName}. Chat coming soon.`;

  const [charIndex, setCharIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Start typing when section scrolls into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) {
      setCharIndex(displayGreeting.length);
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [displayGreeting.length]);

  // Advance characters
  useEffect(() => {
    if (!started || charIndex >= displayGreeting.length) return;

    const timer = setTimeout(() => {
      setCharIndex((i) => i + 1);
    }, CHAR_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [started, charIndex, displayGreeting.length]);

  const isTyping = started && charIndex < displayGreeting.length;

  return (
    <section aria-label="Chat" ref={ref}>
      <SectionLabel variant="accent" as="h3">
        chat
      </SectionLabel>

      <div className="mt-4 flex flex-col gap-4">
        {/* Greeting area */}
        <div className="border-standard border-black outline outline-3 outline-text bg-surface p-4 font-pixbob-regular text-base md:text-lg xl:text-[28px]">
          <p>
            <span className="font-pixbob-bold">{agentName}:</span>{' '}
            {displayGreeting.slice(0, charIndex)}
            <span className="inline-block w-[2px] h-[1em] bg-text align-middle ml-px animate-[blink_1s_step-end_infinite]" />
          </p>
        </div>

        {/* Input area */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="You:"
            readOnly
            tabIndex={-1}
            className="flex-1 border-standard border-black outline outline-3 outline-text bg-surface px-4 py-2 font-pixbob-regular text-base md:text-lg xl:text-[28px] placeholder:text-text-muted"
          />
          <Button
            variant="dark"
            size="md"
            aria-disabled="true"
            aria-label="Send message — coming soon"
            showIcon={false}
          >
            Send
          </Button>
        </div>
      </div>
    </section>
  );
}
