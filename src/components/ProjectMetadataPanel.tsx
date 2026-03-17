import ArrowUpRight from '@/components/ui/ArrowUpRight';


type CategoryVariant = 'accent' | 'violet' | 'blue' | 'green' | 'lime' | 'dark';

const categoryColors: Record<CategoryVariant, string> = {
  accent: 'bg-primary text-surface',
  violet: 'bg-secondary text-surface',
  blue: 'bg-blue text-surface',
  green: 'bg-green text-surface',
  lime: 'bg-lime text-text',
  dark: 'bg-text text-surface',
};

function CategoryBadge({ children, variant = 'accent' }: { children: React.ReactNode; variant?: string }) {
  const colors = categoryColors[variant as CategoryVariant] || categoryColors.accent;
  return (
    <span className={`shrink-0 border-standard border-black outline outline-3 outline-text px-3 py-1.5 font-pixbob-regular text-xs md:text-sm xl:text-[22px] ${colors}`}>
      {children}
    </span>
  );
}

function SectionBadge({ children, variant }: { children: React.ReactNode; variant: CategoryVariant }) {
  const colors = categoryColors[variant];
  return (
    <span className={`inline-flex self-start border-standard border-black outline outline-3 outline-text px-3 py-1.5 font-pixbob-regular text-sm md:text-lg xl:text-[32px] ${colors}`}>
      {children}
    </span>
  );
}

function Selector() {
  return (
    <span className="w-[18px] shrink-0 font-pixbob-regular text-lg md:w-[22px] md:text-2xl xl:w-[26px] xl:text-[40px]">
      {'>'}
    </span>
  );
}

const metricValueColors: Record<string, string> = {
  green: 'text-green',
  yellow: 'text-yellow',
  accent: 'text-primary',
};

export interface ProjectMetadataPanelProps {
  integrations?: Array<{ name: string; category: string; variant?: string }>;
  stack: string[];
  metrics?: Array<{ label: string; value: string; color?: string }>;
  liveUrl?: string;
}

export default function ProjectMetadataPanel({
  integrations,
  stack,
  metrics,
  liveUrl,
}: ProjectMetadataPanelProps) {
  return (
    <aside className="flex flex-col gap-[25px]">
      {/* Integrations */}
      {integrations && integrations.length > 0 && (
        <>
          <SectionBadge variant="blue">Integrations</SectionBadge>
          <div className="flex w-full flex-col gap-2.5 border-standard border-black outline outline-3 outline-text bg-surface px-5 py-4 xl:px-[25px]">
            {integrations.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center font-pixbob-regular text-base md:text-lg xl:text-[32px]">
                  <Selector />
                  <span>{item.name}</span>
                </div>
                <CategoryBadge variant={item.variant}>
                  {item.category}
                </CategoryBadge>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tech Stack */}
      {stack.length > 0 && (
        <>
          <SectionBadge variant="lime">Tech Stack</SectionBadge>
          <div className="flex w-full flex-col gap-2.5 border-standard border-black outline outline-3 outline-text bg-surface px-5 py-4 font-pixbob-regular text-base md:text-lg xl:px-[25px] xl:text-[32px]">
            {stack.map((tech) => (
              <div
                key={tech}
                className="flex items-center"
              >
                <Selector />
                <span>{tech}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Stats */}
      {metrics && metrics.length > 0 && (
        <>
          <SectionBadge variant="dark">Stats</SectionBadge>
          <div className="flex w-full flex-col gap-2.5 border-standard border-black outline outline-3 outline-text bg-text px-5 py-4 xl:px-[25px]">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center font-pixbob-regular text-base text-surface md:text-lg xl:text-[32px]">
                  <Selector />
                  <span>{metric.label}</span>
                </div>
                <span
                  className="font-pixbob-regular text-base md:text-lg xl:text-[32px]"
                  style={{ color: metric.color === 'yellow' ? 'var(--yellow)' : metric.color === 'accent' ? 'var(--accent)' : 'var(--green)' }}
                >
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Launch button */}
      {liveUrl && (
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full items-center justify-center gap-2.5 border-standard border-black outline outline-3 outline-text bg-secondary px-6 py-4 md:px-8 md:py-5 xl:px-[25px] xl:py-4 font-pixbob-regular text-lg text-surface md:text-xl xl:text-[36px] transition-transform duration-200 motion-reduce:transition-none hover:-translate-y-0.5 active:translate-y-0"
        >
          Launch project
          <ArrowUpRight className="size-[1em]" />
        </a>
      )}
    </aside>
  );
}
