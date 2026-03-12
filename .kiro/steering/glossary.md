---
inclusion: always
---

# Glossary

Use these terms exactly. Consistent terminology across code, content, docs, and prompts.

## Views
- **Classic view** (not "normal mode", "website mode")
- **Play view** (not "game mode", "world mode")
- **Game-boy UI** = play view on mobile (not "game-boy view", "mobile view")
- **Content system** (not "CMS", "backend")

## Content
- **Page** (not "route", "screen")
- **Project** (not "work item")
- **Blog post** (not "news")
- **Service** (not "offering", "product")
- **Dialogue** (not "script")

## Characters
- **Player** = Lorenzo (not "hero", "protagonist")
- **Companion** = Totti (not "pet", "sidekick")
- **Agent** = triple nature entity (not "bot", "chatbot")
- **NPC** (not "non-player character" in regular use)
- **Merchant** = NPC subtype presenting content items

## World
- **Location** (not "level", "room", "scene")
- **Overworld** (not "map", "hub")
- **Casa** → About | **Edicola** → Blog | **Shop** → Projects | **Ufficio** → Office
- **Piazza** = central outdoor area
- **Transition** (not "portal", "warp")

## Agent Platform
- **Agentdex** (not "agent list", "agent directory")
- **Office** = agent operational hub (not "dashboard")
- **Agent profile** = detail page (not "agent card" — card is list-level)
- **Capabilities** (not "skills"; "tools" only in technical config)

## Architecture
- **Binding** = connection between world object and content entity (not "link")
- **Theatricalization** = world stages content, doesn't copy it
- **World engine** (not "game engine")
- **View** (not "mode" in precise usage)
- **Action** = system behavior: `open_page`, `open_project`, `start_dialogue`, `start_chat`, `open_agent_profile`

## Code Conventions
- Location names: Italian (`casa`, `edicola`, `shop`, `ufficio`, `piazza`)
- Entity slugs: kebab-case (`sales-agent`, `anomaly-detection-pipeline`)
- Action types: snake_case (`open_page`, `start_chat`)
- Character types: lowercase (`player`, `companion`, `agent`, `npc`, `merchant`)
