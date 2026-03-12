---
inclusion: always
---

# Project Structure

## Directory Layout

> This structure will be refined as the project is built. This is the initial convention.

```
/
├── .kiro/
│   ├── steering/          # Kiro steering files (context for AI)
│   └── hooks/             # Kiro automation hooks
├── context/
│   ├── docs/              # Full project documentation (11 docs)
│   └── personal_website_backlog.md
├── content/               # All content (MDX + YAML/JSON)
│   ├── pages/             # Static pages (about, contact, services)
│   ├── projects/          # Project entries
│   ├── blog/              # Blog posts
│   ├── agents/            # Agent definitions
│   ├── locations/         # World location configs
│   ├── characters/        # Character configs
│   ├── dialogues/         # Dialogue trees
│   └── services/          # Service descriptions
├── src/
│   ├── app/               # Next.js App Router pages and layouts
│   ├── components/        # Shared React components
│   ├── lib/               # Utilities, helpers, content loaders
│   ├── world/             # Phaser world engine code
│   └── styles/            # Global styles, Tailwind config
├── public/
│   └── assets/            # Sprites, tilesets, images
└── CLAUDE.md              # Claude Code instructions
```

## Naming Conventions

- **Files**: kebab-case (`sales-agent.yaml`, `anomaly-detection.mdx`)
- **Components**: PascalCase (`DialogueBox.tsx`, `AgentCard.tsx`)
- **Utilities**: camelCase (`loadContent.ts`, `parseDialogue.ts`)
- **Content slugs**: kebab-case, matching filename without extension
- **Location names in config**: Italian (`casa`, `edicola`, `shop`, `ufficio`, `piazza`)
- **Action types**: snake_case (`open_page`, `start_chat`)
- **Character types**: lowercase (`player`, `companion`, `agent`, `npc`, `merchant`)

## Import Patterns

- Use `@/` alias for `src/` imports
- Content loaded via content layer (type-safe), not raw file reads
- Phaser code imports from `@/world/`, never from `@/components/`
- Components never import Phaser directly — communication via Zustand store

## Key Architectural Rules

1. Content in `content/`, not in `src/` — content is data, not code
2. World engine code in `src/world/` — isolated from React components
3. All UI in React — Phaser renders only the canvas world
4. Shared state in Zustand — no prop drilling between Phaser and React
5. API routes for agent chat — no client-side API keys
