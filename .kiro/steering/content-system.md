---
inclusion: fileMatch
fileMatchPattern: ["content/**/*", "**/content/**/*", "**/*.mdx"]
---

# Content System

## Architecture

Content is the source of truth. Views consume content — content does not know about views. Adding content is a configuration task, not a code change.

## Content Types

| Type | Format | Purpose |
|---|---|---|
| Page | MDX | Static sections: Home, About, Contact, Services |
| Project | MDX + frontmatter | Portfolio entries with description, stack, links, visuals |
| Blog Post | MDX + frontmatter | Articles, tutorials, essays |
| Agent | YAML/JSON | AI entity definition: profile, personality, capabilities, world presence, software config |
| Location | YAML/JSON | World area: tileset, NPCs, objects, transitions, content bindings |
| Character | YAML/JSON | World inhabitant: sprite, type, position, dialogue refs, behavior |
| Dialogue | YAML/JSON | Conversation trees: lines, speakers, choices, action hooks |
| Service | MDX + frontmatter | Professional offerings with scope, related projects, CTAs |

## Content-World Relationship

The world **references** content, never duplicates it:
- Building → links to content section (not its own copy)
- NPC dialogue → introduces a blog post (post lives in content system)
- Agent world presence → references agent entity (profile data from shared source)
- Action types are the connective tissue: `open_page`, `open_project`, `start_dialogue`, `start_chat`, `open_agent_profile`

## Frontmatter Conventions

- All content files must have valid frontmatter
- Required fields are enforced at build time via type-safe content layer
- Slugs use kebab-case
- Dates use ISO 8601 format
- Tags/categories use lowercase kebab-case arrays

## Content Principles

1. **One truth**: Every piece of content is defined once. All views read from the same source.
2. **Config over code**: New content = new file with correct frontmatter. No app logic changes.
3. **Type safety**: All frontmatter validated at build time. Missing fields = build error.
4. **No placeholder content**: Every content file must contain real, final content.
5. **Cross-references by slug**: Content references other content by slug, never by file path.

→ Full doc: `context/docs/content-model.md`
