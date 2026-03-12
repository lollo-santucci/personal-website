# Requirements Document

## Introduction

Project bootstrap for Lorenzo Santucci's personal website. This spec produces a working, buildable Next.js App Router project with the foundational tooling and directory structure that all future specs build upon. No application logic, content libraries, or UI beyond a placeholder page.

Stack and structure decisions are defined in the project's steering files (`steering/tech.md`, `steering/structure.md`) and are authoritative — this document references them rather than duplicating their content.

## Traceability

| Requirement | Backlog Task |
|---|---|
| R1: Type-Safe Project Foundation | P3-T01 |
| R2: Utility-First Styling | P3-T01 |
| R3: Code Quality Tooling | P3-T01 |
| R4: Clean Import Paths | P3-T01 |
| R5: Directory Skeleton | P3-T02 |
| R6: Renderable Root Page | P3-T01 |

## Glossary

- **Project**: The Next.js application being bootstrapped
- **Build_System**: The toolchain (Next.js compiler, TypeScript, pnpm) that produces the production build
- **Directory_Skeleton**: The folder structure defined in `steering/structure.md`, preserved in version control via placeholder files
- **Path_Alias**: The `@/` import shortcut resolving to `src/`, as specified in `steering/structure.md`
- **Root_Layout**: The top-level layout Server Component that wraps all pages
- **Placeholder_Page**: The minimal Server Component rendered at the root route
- **Content_Directory**: The `content/` folder at the project root (not inside `src/`)

## Requirements

### Requirement 1: Type-Safe Project Foundation

**User Story:** As a developer, I want a Next.js App Router project with TypeScript strict mode and the package manager defined in the tech stack, so that I have a type-safe, buildable foundation.

#### Acceptance Criteria

1. THE Project SHALL use Next.js with the App Router, at the version specified in `steering/tech.md`
2. THE Project SHALL use the package manager specified in `steering/tech.md`
3. THE Build_System SHALL enforce TypeScript strict mode
4. WHEN dependencies are installed, THE Build_System SHALL complete without errors

### Requirement 2: Utility-First Styling

**User Story:** As a developer, I want Tailwind CSS configured so that utility classes are available across source and content files from the start.

#### Acceptance Criteria

1. THE Project SHALL include Tailwind CSS as a dependency
2. THE Build_System SHALL be configured to scan files under `src/` and `content/` for Tailwind utility classes
3. THE Root_Layout SHALL load the global stylesheet so that Tailwind classes render on all pages

### Requirement 3: Code Quality Tooling

**User Story:** As a developer, I want linting and formatting enforced via CLI scripts, so that code quality is consistent from the first commit.

#### Acceptance Criteria

1. THE Project SHALL include a linter configured with the framework-recommended ruleset
2. THE Project SHALL include a formatter with a repository-level configuration file
3. THE Project SHALL expose `lint` and `format` scripts in `package.json`
4. WHEN the lint script is executed on the initial codebase, it SHALL report zero errors

### Requirement 4: Clean Import Paths

**User Story:** As a developer, I want the `@/` import alias resolving to `src/`, so that imports follow the convention in `steering/structure.md`.

#### Acceptance Criteria

1. THE Build_System SHALL resolve `@/` imports to the `src/` directory
2. WHEN a source file uses an `@/` import, THE Build_System SHALL resolve it to the corresponding file under `src/`

### Requirement 5: Directory Skeleton

**User Story:** As a developer, I want the complete directory structure from `steering/structure.md` created and tracked in version control, so that the project layout is established before any feature work begins.

#### Acceptance Criteria

1. THE Directory_Skeleton SHALL contain every directory listed in the "Directory Layout" section of `steering/structure.md`, specifically: `src/app/`, `src/components/`, `src/lib/`, `src/world/`, `src/styles/`, `content/pages/`, `content/projects/`, `content/blog/`, `content/agents/`, `content/locations/`, `content/characters/`, `content/dialogues/`, `content/services/`, and `public/assets/`
2. WHEN a skeleton directory contains no source files, it SHALL contain a placeholder file to preserve the directory in version control
3. THE Directory_Skeleton SHALL NOT modify or remove existing `context/`, `.kiro/`, or `CLAUDE.md` files

### Requirement 6: Renderable Root Page

**User Story:** As a developer, I want a minimal root layout and placeholder home page, so that the application renders a valid page and is ready for future UI work.

#### Acceptance Criteria

1. THE Root_Layout SHALL be a Server Component that renders valid `<html>` and `<body>` elements with a `lang` attribute
2. THE Root_Layout SHALL export metadata with the title "Lorenzo Santucci"
3. THE Placeholder_Page SHALL be a Server Component that renders a visible heading containing "Lorenzo Santucci"

## Out of Scope

Features deferred to later specs per the project backlog:

- Navigation and footer (Spec 5)
- Dark/light theme toggle — the site uses a single palette per `steering/brand.md`

## Technical Exclusions

Dependencies that belong to later specs and SHALL NOT be installed in this bootstrap:

- Phaser (world engine — later spec)
- Zustand (state management — later spec)
- Vercel AI SDK (agent platform — later spec)
- Contentlayer or equivalent (content processing — later spec)

## Verification Gates

The following checks confirm the bootstrap is complete. These are cross-cutting verification steps, not standalone requirements.

1. Dependency installation completes without errors
2. The dev server starts and serves the placeholder page without errors
3. The production build compiles with zero errors
4. The lint script reports zero errors
