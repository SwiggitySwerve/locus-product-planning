# Contributing to Locus

Thank you for your interest in contributing to Locus! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm

### Setup

```bash
git clone https://github.com/SwiggitySwerve/locus-product-planning.git
cd locus-product-planning
npm install
```

### Development Commands

```bash
npm run build        # Compile TypeScript
npm test             # Run all tests (161 tests)
npm run test:watch   # Run tests in watch mode
npm run typecheck    # Type check without emitting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## Project Structure

```
src/
├── index.ts              # OpenCode plugin entry point
└── lib/
    └── skills-core.ts    # Skill discovery and parsing utilities

skills/                   # 40+ skill definitions (SKILL.md files)
├── using-locus/          # Main bootstrap skill
├── 01-executive-suite/
├── 02-product-management/
├── 03-engineering-leadership/
├── 04-developer-specializations/
└── 05-specialists/

agents/                   # 14 agent definitions
├── executive/
├── product/
└── engineering/

hooks/                    # Claude Code session hooks
├── hooks.json
├── session-start.sh
└── session-start.cmd

tests/                    # Test files
openspec/                 # Framework library and CLI
```

## Contributing Skills

### Skill Structure

Each skill is a directory containing a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: skill-name
description: When to use this skill and what it does
metadata:
  version: "1.0.0"
  tier: developer-specialization
  category: core
  council: code-review-council
---

# Skill Title

Your skill content here...
```

### Required Frontmatter Fields

| Field | Description |
|-------|-------------|
| `name` | Unique skill identifier (kebab-case) |
| `description` | When to use this skill (shown in listings) |
| `metadata.version` | Semantic version |
| `metadata.tier` | One of: executive, product-management, engineering-leadership, developer-specialization, specialist |
| `metadata.category` | Sub-category within tier |
| `metadata.council` | Review council for the skill |

### Skill Categories

- **01-executive-suite/**: C-suite perspectives (CEO, CTO, CPO, CFO, COO)
- **02-product-management/**: Product and project management
- **03-engineering-leadership/**: Tech leads, staff/principal engineers
- **04-developer-specializations/**: Domain expertise
  - `core/`: frontend, backend, fullstack, mobile
  - `languages/`: typescript, python, rust, golang, java
  - `infrastructure/`: devops, cloud, kubernetes, platform, security, sre
  - `data-ai/`: data-engineer, data-scientist, ml-engineer, llm-architect
  - `quality/`: qa, performance, security-auditor, accessibility
- **05-specialists/**: Specialized domains

## Contributing Agents

### Agent Structure

Agents are markdown files with YAML frontmatter:

```markdown
---
name: agent-name
description: What this agent does and when to use it
tools: Read, Write, Bash, Grep
---

You are a [role] with expertise in [domain]...
```

## Code Contributions

### Guidelines

1. **TypeScript**: Use strict types, avoid `any`
2. **Testing**: Add tests for new functionality
3. **Linting**: Run `npm run lint` before committing
4. **Commits**: Use conventional commit messages:
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation changes
   - `test:` Test additions/changes
   - `chore:` Maintenance tasks

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run lint: `npm run lint`
6. Commit with conventional message
7. Push and create a Pull Request

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/skills-core.test.ts

# Run tests matching pattern
npm test -- -t "frontmatter"
```

## Reporting Issues

When reporting issues, please include:

1. **Description**: What happened vs. what you expected
2. **Steps to reproduce**: Minimal steps to trigger the issue
3. **Environment**: OS, Node version, OpenCode/Claude version
4. **Logs**: Any error messages or relevant output

## Questions?

- Open a [GitHub Issue](https://github.com/SwiggitySwerve/locus-product-planning/issues)
- Check existing issues for similar questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
