import SectionLabel from '@/components/ui/SectionLabel';
import Button from '@/components/ui/Button';

export interface ChatSectionProps {
  agentName: string;
  greeting?: string;
}

export default function ChatSection({ agentName, greeting }: ChatSectionProps) {
  const displayGreeting =
    greeting ?? `Hi! I'm ${agentName}. Chat coming soon.`;

  return (
    <section aria-label="Chat">
      <SectionLabel variant="accent" as="h3">
        chat
      </SectionLabel>

      <div className="mt-4 flex flex-col gap-4">
        {/* Greeting area */}
        <div className="border-standard border-black bg-surface p-4 font-pixbob-regular text-base md:text-lg xl:text-[28px]">
          <p>
            <span className="font-pixbob-bold">{agentName}:</span>{' '}
            {displayGreeting}
          </p>
        </div>

        {/* Input area */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="You:"
            readOnly
            tabIndex={-1}
            className="flex-1 border-standard border-black bg-surface px-4 py-2 font-pixbob-regular text-base md:text-lg xl:text-[28px] placeholder:text-text-muted"
          />
          <Button
            variant="primary"
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
