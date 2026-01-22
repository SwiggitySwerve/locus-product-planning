---
name: using-locus
description: Use when starting any conversation - establishes how to find and use skills for project planning and development
---

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## How to Access Skills

**In OpenCode:** Use the `use_skill` tool. When you invoke a skill, its content is loaded and presented to you - follow it directly.

**In Claude Code:** Use the `Skill` tool if available, or load from the skills directory.

**In other environments:** Check your platform's documentation for how skills are loaded.

# Using Skills

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.** Even a 1% chance a skill might apply means that you should invoke the skill to check. If an invoked skill turns out to be wrong for the situation, you don't need to use it.

## Red Flags

These thoughts mean STOP - you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check git/files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you HOW to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |

## Skill Categories

Locus provides skills across these categories:

### Executive Suite (01-executive-suite/)
Strategic leadership perspectives:
- `locus:ceo-strategist` - Strategic vision and decision making
- `locus:cto-architect` - Technical strategy and architecture
- `locus:cpo-product` - Product vision and roadmap
- `locus:cfo-analyst` - Financial analysis and planning
- `locus:coo-operations` - Operations and execution

### Product Management (02-product-management/)
Product planning and execution:
- `locus:product-manager` - Product planning and requirements
- `locus:project-manager` - Project execution and tracking
- `locus:scrum-master` - Agile process facilitation
- `locus:program-manager` - Multi-project coordination
- `locus:roadmap-strategist` - Long-term planning

### Engineering Leadership (03-engineering-leadership/)
Technical leadership and architecture:
- `locus:tech-lead` - Technical leadership
- `locus:staff-engineer` - Senior technical guidance
- `locus:principal-engineer` - Architecture decisions
- `locus:engineering-manager` - Team leadership
- `locus:architect-reviewer` - Architecture review

### Developer Specializations (04-developer-specializations/)
Domain expertise in:
- **Core**: frontend, backend, fullstack, mobile
- **Languages**: typescript, python, rust, golang, java
- **Infrastructure**: devops, cloud, kubernetes, platform, security, sre
- **Data & AI**: data-engineer, data-scientist, ml-engineer, llm-architect
- **Quality**: qa, performance, security-auditor, accessibility

### Specialists (05-specialists/)
Specialized domain expertise:
- `locus:compliance-specialist` - Regulatory compliance

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** (planning, debugging) - these determine HOW to approach the task
2. **Role skills second** (product-manager, tech-lead) - these provide domain perspective
3. **Implementation skills third** (frontend-developer, devops-engineer) - these guide execution

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip workflows.

## Project Planning with Locus

For project planning specifically, Locus guides you through 4 steps:

```
Step 1: Vision    -> What are we building and why?
Step 2: Features  -> What will it do?
Step 3: Design    -> How will it work?
Step 4: Build     -> Let's make it
```

Use `/locus` to start a planning session, or say "I want to build..."

## Commands

| Command | Description |
|---------|-------------|
| `/locus` | Start or resume a project |
| `/locus-status` | Show current project progress |
| `/locus-list` | List all projects |

## Tools

| Tool | Description |
|------|-------------|
| `use_skill` | Load a specific skill |
| `find_skills` | List all available skills |
| `find_agents` | List all available agents |
