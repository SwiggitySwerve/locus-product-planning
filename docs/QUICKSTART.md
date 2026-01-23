# Locus Quick Start Guide

Get started with Locus in 5 minutes.

## Installation

### OpenCode (Recommended)

Add to your `opencode.json`:

```json
{
  "plugin": ["locus-product-planning"]
}
```

That's it! OpenCode will install the plugin automatically.

### Claude Code

```bash
# Clone to your plugins directory
git clone https://github.com/SwiggitySwerve/locus-product-planning.git ~/.claude/plugins/locus
```

The session hooks will automatically load Locus skills when you start a new session.

## Your First Project

### Step 1: Start a Project

Just describe what you want to build:

```
You: I want to build a task management app
```

Or use the command:

```
/locus a task management app
```

### Step 2: Follow the Workflow

Locus guides you through 4 steps:

```
Step 1: Vision    - What are we building and why?
Step 2: Features  - What will it do?
Step 3: Design    - How will it work?
Step 4: Build     - Let's make it!
```

Say "continue" to move through each step.

### Step 3: Get Specialized Help

Load specific skills when you need them:

```
# Load a skill for frontend work
/locus-skill frontend-developer

# Or use the tool directly
use_skill("locus:database-architect")
```

## Common Commands

| Command | What it does |
|---------|--------------|
| `/locus` | Start or resume a project |
| `/locus-skills` | List all 46 skills |
| `/locus-skill <name>` | Load a specific skill |
| `/locus-agents` | List available agents |

## Example Session

```
You: I want to build an AI-powered recipe app

Locus: Great! Let's plan your AI recipe app.

       Step 1: Vision (current)
       Step 2: Features
       Step 3: Design
       Step 4: Build

       What problem does this solve? Who is it for?

You: I keep forgetting family recipes. It's for me and my family.

Locus: Perfect - a personal family recipe keeper.

       Key insight: This is about preserving memories, not just storing recipes.

       [Asks a few more questions to refine the vision]

       Step 1: Vision (complete)
       Step 2: Features (current)
       Step 3: Design
       Step 4: Build

       What features does it need?

You: continue

Locus: Based on your vision, here are suggested features:

       Must Have:
       - Add/edit recipes with photos
       - Search by ingredient or name
       - Family sharing

       Nice to Have:
       - AI suggestion for missing ingredients
       - Voice-to-recipe transcription
       - Meal planning

       Which of these resonate? Anything to add or remove?

[... continues through Design and Build steps ...]
```

## Tips

1. **Use skills proactively** - If there's even a 1% chance a skill applies, load it
2. **Don't skip steps** - Each step builds on the previous one
3. **Ask for perspectives** - Load executive or engineering skills for different viewpoints
4. **Combine skills** - Use `product-manager` for requirements, then `database-architect` for data modeling

## Next Steps

- Browse the [full skills catalog](./SKILLS-CATALOG.md)
- See [example workflows](./examples/)
- Read individual skill files in `skills/`

## Getting Help

- [GitHub Issues](https://github.com/SwiggitySwerve/locus-product-planning/issues)
- [README](../README.md)
