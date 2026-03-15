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
| `software` | object | Chat config: `availability`, `model`, `systemPrompt`, `tools` |

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

## Chat

- Chat is the operational layer where software capabilities are exposed
- Agent maintains personality in chat (same tone as profile and world dialogue)
- Accessible from: agentdex profile page, office world interaction
- Chat implementation is Phase 8 (Agent Platform) — until then, profile shows a visual placeholder with greeting message

## Key Rules

- **Never say "bot" or "chatbot"** — always "agent"
- **Personality is not optional** — agents are characters, not tools
- **One definition, multiple views** — never duplicate agent data across views
- **Slug is king** — all cross-references (content ↔ assets ↔ routes) use the slug
- **Config over code** — new agent = new YAML + new sprite folder, zero code changes

→ Full doc: `context/docs/characters.md` (triple nature details, design notes)
