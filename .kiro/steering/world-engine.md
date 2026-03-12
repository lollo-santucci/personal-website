---
inclusion: fileMatch
fileMatchPattern: ["**/world/**/*", "**/play/**/*", "**/phaser/**/*", "**/game/**/*"]
---

# World Engine

## Overview

The play view is a 2D pixel-art world built with Phaser, running in a canvas inside a React component. The world is a **narrative navigation layer** — it theatricalizes content, it does not duplicate it.

## Architecture

- Phaser handles: tilemap rendering, sprite animation, movement, collision, triggers, area transitions
- React handles: ALL UI overlays (dialogue boxes, menus, agentdex panel, content panels)
- Communication: Zustand store — Phaser emits events, React responds
- UI positioning: CSS fixed/absolute, NOT Phaser coordinates

## World Structure

- **Overworld**: Outdoor connective area (piazza, streets, paths)
- **Interiors**: Self-contained scenes entered via transitions (not seamless scroll)
- **Locations**: Casa → About, Edicola → Blog, Shop → Projects, Ufficio → Office/Agents

## Characters in the World

| Type | Behavior |
|---|---|
| Player (Lorenzo) | Controllable: movement, collision, interaction trigger |
| Companion (Totti) | Follow AI, idle states, interactable by visitor |
| Agent | Stationary at assigned location, dialogue + actions |
| NPC | Stationary or simple patrol, dialogue + optional actions |
| Merchant | Stationary at location, presents content items via dialogue |

## Simulation Boundaries

**Exists**: Movement, collision, interaction, dialogue, companion follow, area transitions, content-linked actions.

**Does NOT exist**: Combat, inventory, quests, progression, economy, procedural generation, multiplayer, save states.

## Action Types

Actions are triggered by world interactions and bridge to the content system:
- `open_page` — Open a content page in classic view
- `open_project` — Open a project detail
- `start_dialogue` — Load and run a dialogue tree
- `start_chat` — Open agent chat interface
- `open_agent_profile` — Open agentdex entry

## Depth Budget

- Each area: 1-3 minutes to fully explore
- Total world: 10-20 minutes in one session
- Small, dense, curated — not large and empty
- Every location, NPC, and object must serve a content function

## Location Design Rules

1. Every location maps to content — no decorative-only buildings
2. Dense, not large — single screen or close to it per interior
3. Each location has distinct visual identity and tone
4. Extensible via config — new content appears without code changes
5. Overworld is a piazza, not a landscape — compact and characterful

→ Full docs: `context/docs/world-design.md`, `context/docs/characters.md`, `context/docs/modes-and-views.md`
