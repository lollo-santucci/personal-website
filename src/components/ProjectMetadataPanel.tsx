import SectionLabel from '@/components/ui/SectionLabel';
import RPGSelector from '@/components/ui/RPGSelector';
import Button from '@/components/ui/Button';

export interface ProjectMetadataPanelProps {
  integrations?: Array<{ name: string; category: string }>;
  stack: string[];
  metrics?: Array<{ label: string; value: string }>;
  liveUrl?: string;
}

export default function ProjectMetadataPanel({
  integrations,
  stack,
  metrics,
  liveUrl,
}: ProjectMetadataPanelProps) {
  return (
    <aside className="flex flex-col gap-6">
      {/* Integrations */}
      {integrations && integrations.length > 0 && (
        <div>
          <SectionLabel variant="dark" as="h3">
            integrations
          </SectionLabel>
          <ul className="mt-3 flex flex-col gap-2">
            {integrations.map((item) => (
              <li
                key={item.name}
                className="flex items-center gap-2 font-pixbob-regular text-base md:text-lg xl:text-[28px]"
              >
                <RPGSelector />
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tech Stack */}
      {stack.length > 0 && (
        <div>
          <SectionLabel variant="accent" as="h3">
            tech stack
          </SectionLabel>
          <ul className="mt-3 flex flex-col gap-2">
            {stack.map((tech) => (
              <li
                key={tech}
                className="flex items-center gap-2 font-pixbob-regular text-base md:text-lg xl:text-[28px]"
              >
                <RPGSelector />
                <span>{tech}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats */}
      {metrics && metrics.length > 0 && (
        <div>
          <SectionLabel variant="dark" as="h3">
            stats
          </SectionLabel>
          <ul className="mt-3 flex flex-col gap-2">
            {metrics.map((metric) => (
              <li
                key={metric.label}
                className="flex items-center gap-2 font-pixbob-regular text-base md:text-lg xl:text-[28px]"
              >
                <RPGSelector />
                <span>
                  {metric.label}: <strong>{metric.value}</strong>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Launch button */}
      {liveUrl && (
        <Button
          variant="primary"
          size="md"
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full justify-center"
        >
          Launch
        </Button>
      )}
    </aside>
  );
}
