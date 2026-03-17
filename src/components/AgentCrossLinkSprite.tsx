const FRAME_W = 32;
const FRAME_H = 64;
const FRONT_COL = 3;
const FRONT_ROW = 0;
const SCALE = 1;

interface AgentCrossLinkSpriteProps {
  slug: string;
  name: string;
}

export default function AgentCrossLinkSprite({ slug, name }: AgentCrossLinkSpriteProps) {
  const src = `/assets/agents/${slug}/spritesheets/character_spritesheet.png`;
  const displayW = FRAME_W * SCALE;
  const displayH = FRAME_H * SCALE;

  return (
    <div
      role="img"
      aria-label={`${name} sprite`}
      className="shrink-0 mr-[15px]"
      style={{ width: displayW, height: displayH }}
    >
      <div
        className="pixel-art origin-top-left"
        style={{
          width: FRAME_W,
          height: FRAME_H,
          backgroundImage: `url(${src})`,
          backgroundPosition: `-${FRONT_COL * FRAME_W}px -${FRONT_ROW * FRAME_H}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          transform: `scale(${SCALE}) translateY(-10%)`,
        }}
      />
    </div>
  );
}
