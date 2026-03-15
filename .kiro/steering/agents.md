---
inclusion: fileMatch
fileMatchPattern: ["content/agents/**/*", "**/agent*/**/*", "**/agentdex/**/*", "src/lib/types/agent*"]
---

# Agents

## Triple Nature

Every agent is ONE entity that manifests in three ways:

1. **Content profile (Agentdex)** — browsable entry in `/agentdex/[slug]` with name, role, mission, stat bars, personality, chat
2. **World character (Play view)** — NPC sprite in the 2D world (ufficio), with dialogue and personality
3. **Software entity (Operational)** — functional AI with chat capabilities, model config, system prompt, tools

One agent definition → all three representations. The personality field informs world dialogue AND chat behavior. The capabilities field drives both the profile display and the chat tools.

## Agent Definition

Agents are defined in `content/agents/{slug}.yaml`. Template: `content/agents/_template.yaml`.

### Required fields

| Field | Type | Purpose |
|---|---|---|
| `name` | string | Display name |
| `slug` | Slug | URL-safe identifier, kebab-case. Links to assets via convention. |
| `index` | number | Display order in agentdex (renders as 001, 002, ...) |
| `role` | string | One-line role description |
| `personality` | string | Personality description — informs chat behavior and world dialogue |
| `mission` | string | One sentence — displayed in bordered box on agent profile |
| `bestFor` | string[] | Use cases — displayed with `>` prefix on profile |
| `toneOfVoice` | object | 5 stat bars (1-5): `warm`, `direct`, `playful`, `formal`, `calm` |
| `capabilities` | string[] | What the agent can do (kebab-case) |
| `status` | enum | `active` \| `coming-soon` \| `experimental` |

### Optional fields

| Field | Type | Purpose |
|---|---|---|
| `greeting` | string | Chat placeholder message on profile page |
| `world` | object | Play view presence: `location`, `sprite`, `position`, `dialogueId` |
| `software` | object | Chat config: `availability`, `model`, `systemPrompt`, `context`, `examples`, `tools` |

## Asset Convention

Agent visual assets live in `public/assets/agents/{slug}/`:

```
public/assets/agents/
  lorenzo-santucci/
    spritesheets/
      character_spritesheet.png    # Full spritesheet (32×64 frames)
  sales-agent/
    spritesheets/
      character_spritesheet.png
```

**The slug is the link.** Content: `content/agents/sales-agent.yaml` → Assets: `public/assets/agents/sales-agent/`.

Sprite path in code: `/assets/agents/${agent.slug}/spritesheets/character_spritesheet.png`

Character sprites are **32×64 frames** (2 tile rows tall). Front-facing idle = column 3, row 0. Render with `image-rendering: pixelated` at integer scale.

## Agentdex (Classic View)

The agentdex is the classic view's agent directory at `/agentdex`.

- **Index page** (`/agentdex`): collection list with agent rows — portrait, index number (001, 002...), name, "New" badge, "Meet ↗" button
- **Profile page** (`/agentdex/[slug]`): full agent profile — character sprite, Role, Best for, Mission, Tone of Voice (stat bars), chat section
- Agents are sorted by `index` field
- Adding a new agent = new YAML file + new asset folder. No code changes.

## World Presence (Play View)

Agents can appear in **any location** in the 2D world, not just the office. Each agent's `world.location` field determines where they are stationed. An agent at the edicola introduces blog posts; an agent at the shop presents projects; an agent at casa talks about Lorenzo. The office is just one possible location.

Agents in the world are stationary NPCs with:
- Assigned position in their location (`world.location` + `world.position`)
- Idle animations from their character sprite
- Dialogue on interaction (reflects personality and role)
- Dialogue actions: `open_agent_profile`, `start_chat`, `open_project`, `open_page`, etc.

## Chat — Software Architecture

### Overview

Each agent is a **monoprompt chatbot**: one system prompt (generated from YAML fields) + one Vercel AI SDK chat stream. No RAG, no multi-agent orchestration, no persistent memory.

Chat is a **classic view feature first**. It ships with the agentdex profile page (`/agentdex/[slug]`), before the play view exists. When the play view is built later, world interactions trigger `start_chat` which opens the same chat interface.

### API route

```
POST /api/chat/[slug]
```
- Reads `content/agents/{slug}.yaml`
- Composes system prompt from YAML fields (see below)
- Streams response via Vercel AI SDK `streamText()` + Anthropic provider
- Frontend: `useChat({ api: '/api/chat/${agent.slug}' })`

### System prompt generation

The system prompt is **generated at runtime from YAML fields**, not written manually:

```
You are {name}. {role}.

## Personality
{personality}

## Mission
{mission}

## Tone of Voice
Warm: {warm}/5 | Direct: {direct}/5 | Playful: {playful}/5
Formal: {formal}/5 | Calm: {calm}/5

## You are best for
{bestFor joined}

## Capabilities
{capabilities joined}

## Rules
- Stay in character at all times
- You work for Lorenzo Santucci's website
- If asked something outside your capabilities, redirect warmly
- Keep responses concise
```

### Enriching prompts

Beyond the generated base, agents can have richer context:

- **`software.systemPrompt`** (string): manual override/additions appended to the generated prompt. For agent-specific instructions that don't fit structured fields.
- **`software.context`** (string[], slugs): list of content entity slugs the agent "knows". Resolved at runtime via two-level context (see below).
- **`software.examples`** (array of {user, assistant}): few-shot examples that define tone and response style. Injected as conversation history before the user's first message.
- **Site-wide context**: a build-time summary of all projects, blog posts, and Lorenzo's info can be injected into every agent's prompt, so they all know the basics.

### Two-level context strategy

Agents that need knowledge of many content items (e.g., the edicola agent knowing all blog articles) use a **two-level approach** to stay fast and cost-effective:

1. **Summaries always in prompt** (~40 tokens per item): a lightweight manifest of all content the agent knows — slug, title, one-line description, tags. Even with 50 articles this is ~2000 tokens. The model can answer "what articles do you have about X?" from summaries alone.

2. **`get_content(slug)` tool for on-demand detail**: when the user asks about a specific item, the model calls a tool to retrieve the full content. This keeps the base prompt small and only loads heavy content when needed.

```typescript
// Built with Vercel AI SDK tool() — ~15 lines
const getContent = tool({
  description: 'Get full content of an item by type and slug',
  parameters: z.object({
    type: z.enum(['blog-posts', 'projects', 'services']),
    slug: z.string(),
  }),
  execute: async ({ type, slug }) => {
    return await loadContent(type, slug);
  },
});
```

The `software.context` field in YAML lists the slugs. At runtime:
- Summaries for all listed slugs are injected into the system prompt
- The `get_content` tool is registered so the model can fetch full content on demand
- If `context` is `["*"]` (wildcard), all items of the relevant content type are summarized

**Tools are built by us** using Vercel AI SDK's `tool()` function — a Zod schema for parameters + an `execute` function that reads from the content system. The model decides autonomously when to call the tool. No external tool infrastructure needed.

### Cost controls

| Control | Implementation |
|---|---|
| **Model per agent** | `software.model` field — Haiku for simple agents, Sonnet for key ones |
| **Max tokens/response** | `maxTokens` param in `streamText()` (e.g., 500-1000) |
| **Max messages/conversation** | Client-side counter — after N messages, show "Contact Lorenzo directly" |
| **Max conversations/IP/day** | Rate limiting middleware on `/api/chat/[slug]` |
| **Max tokens/conversation** | Server-side token counter — close chat at limit |
| **Global kill switch** | Env var `AGENTS_CHAT_ENABLED=true\|false` — disables all chat, shows placeholder |
| **Budget alerts** | Anthropic API usage tracking — external monitoring |

### Access points

- **Agentdex profile** (`/agentdex/[slug]`): primary chat interface, always available
- **Play view world**: `start_chat` dialogue action opens the same chat UI as an overlay
- **No standalone chat page** — chat lives within the agent's context (profile or world)

## Key Rules

- **Never say "bot" or "chatbot"** — always "agent"
- **Personality is not optional** — agents are characters, not tools
- **One definition, multiple views** — never duplicate agent data across views
- **Slug is king** — all cross-references (content ↔ assets ↔ routes) use the slug
- **Config over code** — new agent = new YAML + new sprite folder, zero code changes
- **Classic view first** — chat ships with agentdex before play view exists
- **Cost-aware** — every agent has a model tier, every chat has limits

→ Full doc: `context/docs/characters.md` (triple nature details, design notes)
