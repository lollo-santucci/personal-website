# Content Directory

Authoring guide for the content system. All content types are defined as files in this directory — adding content is configuration, not code.

## Directory Structure

```
content/
├── pages/          Static pages (Home, About, Contact, Services)
├── projects/       Portfolio entries with description, stack, and links
├── blog/           Articles, tutorials, and essays
├── services/       Professional service offerings with scope and CTAs
├── agents/         AI entity definitions (profile, personality, capabilities)
├── locations/      World areas (tileset, NPCs, objects, transitions)
├── characters/     World inhabitants (sprite, type, behavior, dialogue refs)
└── dialogues/      Conversation trees (lines, speakers, choices, actions)
```

MDX types (pages, projects, blog, services) have a body section for long-form content. YAML types (agents, locations, characters, dialogues) are structured data only.

## Naming Conventions

| Convention | Format | Examples |
|---|---|---|
| Filenames | kebab-case | `anomaly-detection.mdx`, `sales-agent.yaml` |
| Template files | `_` prefix (skipped by content loader) | `_template.mdx`, `_template.yaml` |
| Location slugs | Italian names | `casa`, `edicola`, `shop`, `ufficio`, `piazza` |
| Action types | snake_case | `open_page`, `open_project`, `start_dialogue`, `start_chat`, `open_agent_profile` |
| Character types | lowercase | `player`, `companion`, `agent`, `npc`, `merchant` |

## Authoring Workflow

1. Copy the `_template` file from the relevant subdirectory
2. Rename it using a kebab-case slug (e.g. `my-new-post.mdx`)
3. Fill in all required fields (marked `# REQUIRED` in the template)
4. Add optional fields as needed (marked `# OPTIONAL` in the template)

Each template contains inline comments documenting field types, formats, and allowed values.

## Field Reference

Each subdirectory contains a `_template` file with the complete field schema for that content type. Refer to the template for the full list of required and optional fields.

| Content Type | Template File | Format |
|---|---|---|
| Page | `pages/_template.mdx` | MDX (frontmatter + body) |
| Project | `projects/_template.mdx` | MDX (frontmatter + body) |
| Blog Post | `blog/_template.mdx` | MDX (frontmatter + body) |
| Service | `services/_template.mdx` | MDX (frontmatter + body) |
| Agent | `agents/_template.yaml` | YAML |
| Location | `locations/_template.yaml` | YAML |
| Character | `characters/_template.yaml` | YAML |
| Dialogue | `dialogues/_template.yaml` | YAML |

## Slug & Date Formats

**Slugs** are kebab-case, URL-safe identifiers that match the filename without extension:
- Allowed characters: lowercase letters, numbers, hyphens
- Examples: `about`, `sales-agent`, `anomaly-detection-pipeline`

**Dates** use ISO 8601 format: `YYYY-MM-DD` (e.g. `2025-01-15`).

## Cross-Reference Pattern

Content references other content by slug, never by file path.

```yaml
# Correct — reference by slug
relatedProjects:
  - "anomaly-detection-pipeline"
  - "portfolio-site"

# Wrong — never use file paths
relatedProjects:
  - "content/projects/anomaly-detection-pipeline.mdx"
```

This applies to all cross-references: project slugs, agent slugs, location slugs, character slugs, and dialogue IDs.
