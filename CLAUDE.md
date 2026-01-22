# Locus

Your center point for planning and building projects with AI.

## Quick Start

Just describe what you want to build:

```
User: I want to build an AI trading simulator

AI: I'll help you plan and build this step by step.
    [Guides you through 4 simple steps]
```

Or use the `/locus` command:
```
/locus a mobile app for tracking workouts
```

## How It Works

Projects go through 4 steps:

```
Step 1: Vision    → What are we building and why?
Step 2: Features  → What will it do?
Step 3: Design    → How will it work?
Step 4: Build     → Let's make it
```

Just say **"continue"** to move forward.

## Commands

| Command | Description |
|---------|-------------|
| `/locus` | Start or resume a project |
| `/locus-skills` | List available skills |
| `/locus-skill <name>` | Load a specific skill |
| `/locus-agents` | List available agents |

Or just say "I want to build..." to get started.

## Skills

Locus includes 40+ specialized skills for different perspectives:

| Category | Examples |
|----------|----------|
| Executive | ceo-strategist, cto-architect, cpo-product |
| Product | product-manager, project-manager, scrum-master |
| Engineering | tech-lead, staff-engineer, principal-engineer |
| Developer | frontend, backend, devops, data-engineer, ml-engineer |
| Quality | qa-expert, security-auditor, performance-engineer |

To load a skill, read its file:
```
Read skills/02-product-management/product-manager/SKILL.md
```

## Example

```
You: I want to build a recipe app

AI: 📋 Recipe App
    ━━━━━━━━━━━━━
    → Step 1: Vision ◄
      Step 2: Features
      Step 3: Design
      Step 4: Build

    What problem does this solve?

You: I can never remember my family recipes

AI: Got it - an app to save and organize family recipes.
    Who else would use it?

You: Just me and my family

AI: ✓ Step 1 complete
    
    📋 Recipe App
    ━━━━━━━━━━━━━
    ✓ Step 1: Vision
    → Step 2: Features ◄
      Step 3: Design
      Step 4: Build

    What features does it need?

You: continue

AI: [Moves to features discussion...]
```

---

## For Advanced Users

The framework underneath supports:
- Detailed planning artifacts
- Gate-based quality checks  
- Multi-tier organizational workflows
- 40+ specialized skills
- 14 agent definitions

See `openspec/` for the full framework, or `skills/` for all available skills.
