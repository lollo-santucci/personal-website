---
inclusion: always
---

# Tech Stack

## Stack

| Area | Choice |
|---|---|
| Language | TypeScript (strict mode) |
| Framework | Next.js (App Router) |
| World engine | Phaser |
| Content | MDX (long-form) + YAML/JSON (structured entities) |
| Styling | Tailwind CSS |
| AI/Agents | Vercel AI SDK + Anthropic API (primary provider, switchable) |
| State | Zustand (cross-layer communication) |
| Hosting | Vercel |
| Package manager | pnpm |

## Next.js + Phaser Integration

```
┌────────────────────────────────┐
│  React UI Layer (z-index 2)    │  Tailwind: dialogue, menus, panels,
│  All UI lives here             │  agentdex, navigation, content
├────────────────────────────────┤
│  Phaser Canvas (z-index 1)     │  World only: tilemap, sprites,
│  World rendering only          │  movement, collision, triggers
└────────────────────────────────┘
        ↕ Zustand store ↕
┌────────────────────────────────┐
│  Content System                │  MDX + YAML/JSON files
└────────────────────────────────┘
```

**Rules:**
- Phaser handles ONLY world rendering and game logic
- ALL UI (classic view + play view overlays) is React + Tailwind
- Communication via Zustand store — Phaser emits events, React responds
- Dialogue boxes positioned with CSS (fixed/absolute), NOT Phaser coordinates
- Phaser wrapped in a single dynamic-import React component (no SSR for canvas)

## Content Layer

- MDX for: blog posts, about page, project details, service descriptions
- YAML/JSON for: agent definitions, location config, dialogue trees, character config, world placement
- Type-safe content validation at build time (Contentlayer2 or equivalent)

## Agent Architecture

- Vercel AI SDK as abstraction layer (streaming, tool use, provider switching)
- Each agent defined in config: personality, system prompt, capabilities, tool bindings
- API routes handle chat requests with streaming responses
- Chat UI is a shared React component across agentdex and office

## Context7 MCP — Documentazione aggiornata delle librerie

Il progetto ha accesso al server MCP **Context7** che fornisce documentazione aggiornata per qualsiasi libreria o framework.

**Quando usarlo:**
- Prima di implementare un'integrazione con una libreria dello stack (Next.js App Router, Tailwind, Phaser, Vercel AI SDK, Zustand, next-mdx-remote, gray-matter, js-yaml)
- Quando un'API ha cambiato comportamento tra versioni (es. Next.js 14 → 15, Tailwind v3 → v4)
- Quando un pattern non funziona come previsto e potrebbe essere dovuto a breaking changes
- Quando si usa una libreria per la prima volta nel progetto
- Per verificare la sintassi corretta di configurazione (es. `tailwind.config.ts` vs CSS-based config in v4, ESLint flat config)

**Quando NON usarlo:**
- Per TypeScript puro, logica applicativa, o codice interno al progetto
- Per concetti generali già noti (HTML, CSS base, git)
- Se la risposta è già chiara dalla documentazione di progetto in `context/docs/` o dagli steering files
- Per micro-domande risolvibili leggendo il codice esistente

**Come usarlo:**
1. Chiamare `resolve-library-id` per trovare l'ID della libreria (es. "next.js", "phaser", "tailwindcss")
2. Chiamare `get-library-docs` con l'ID e un topic specifico (es. "app router dynamic routes", "generateStaticParams")
3. Usare la documentazione restituita per implementare con le API corrette e aggiornate

**Regola pratica:** se stai per scrivere codice che dipende da un'API esterna e non sei sicuro al 100% della sintassi/comportamento nella versione installata, consulta Context7 prima di procedere.

→ Full doc: `context/docs/tech-stack.md`
