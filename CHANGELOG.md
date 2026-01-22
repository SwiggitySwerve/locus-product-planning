# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-22

### Added
- **Claude Code Support**: Cross-platform session hooks for automatic skill bootstrap
  - `hooks/session-start.sh` for Unix/macOS
  - `hooks/session-start.cmd` for Windows
  - `hooks/hooks.json` configuration
- **Enhanced Skill Discovery**:
  - `use_skill` tool to load skills by name with namespace support (`locus:`, `project:`)
  - `find_skills` tool with filtering by category, tier, and search term
  - `find_agents` tool to list available agent definitions
- **New Commands**:
  - `/locus-skills` - List available skills with optional filtering
  - `/locus-skill <name>` - Load a specific skill
  - `/locus-agents` - List available agents
- **Skills Core Library** (`src/lib/skills-core.ts`):
  - Extracted reusable utilities for skill discovery and frontmatter parsing
  - Support for nested YAML metadata objects
  - Three-tier skill resolution (project > personal > locus)
- **Plugin Metadata**:
  - `.claude-plugin/plugin.json` for Claude marketplace
  - `.claude-plugin/marketplace.json` for discoverability
- **Testing**: 23 new tests for skills-core utilities (161 total)

### Changed
- Reorganized skills from `.opencode/skills/locus/` to `skills/` directory
- Updated `package.json` to include `skills/`, `agents/`, `hooks/`, `.claude-plugin/` in npm package
- Enhanced frontmatter parser to handle nested metadata blocks

### Fixed
- Windows line endings in YAML frontmatter parsing (PR #2)

## [1.0.0] - 2025-01-20

### Added
- Initial release
- 4-step project planning workflow: Vision → Features → Design → Build
- 41 specialized skills across 5 categories:
  - Executive Suite (5 skills)
  - Product Management (6 skills)
  - Engineering Leadership (5 skills)
  - Developer Specializations (24 skills)
  - Specialists (1 skill)
- 14 agent definitions for specialized perspectives
- OpenCode plugin with `/locus` command
- Machine-checkable gates for quality assurance
- State machine for project transitions
- CLI tools for project management
- 138 tests ensuring reliability
