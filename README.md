# Locus Product Planning

**Your center point for planning and building products with AI.**

Locus guides you from idea to implementation through a simple 4-step process. No complicated commands to learn - just describe what you want to build.

## Quick Start

```
You: I want to build an AI trading simulator

Locus: I'll help you plan and build this step by step.

       📋 AI Trading Simulator
       ━━━━━━━━━━━━━━━━━━━━━━━
       → Step 1: Vision ◄
         Step 2: Features
         Step 3: Design
         Step 4: Build

       What problem does this solve?
```

Say **"continue"** to move forward. That's it.

## How It Works

```
Step 1: Vision    → What are we building and why?
Step 2: Features  → What will it do?
Step 3: Design    → How will it work?
Step 4: Build     → Let's make it
```

## Commands

| Command | Description |
|---------|-------------|
| `/locus` | Start or resume a project |
| `/locus-status` | Show current project progress |
| `/locus-list` | List all projects |

Or just describe what you want: "I want to build..."

## Installation

### npm (Recommended)

Add to your `opencode.json`:

```json
{
  "plugin": ["locus-product-planning"]
}
```

That's it! OpenCode will automatically install the plugin on startup.

### Manual Installation

Clone the repo and copy the skill:

```bash
git clone https://github.com/SwiggitySwerve/locus-product-planning.git
cp -r locus-product-planning/.opencode/skills/locus ~/.config/opencode/skills/
```

Or reference it directly in `opencode.json`:

```json
{
  "instructions": ["~/.config/opencode/skills/locus/SKILL.md"]
}
```

### Development Setup

```bash
git clone https://github.com/SwiggitySwerve/locus-product-planning.git
cd locus-product-planning
npm install
npm test  # 79 tests
```

## For Power Users

Under the hood, Locus uses a full organizational workflow framework with:

- **Machine-checkable gates** ensuring quality at each stage
- **State machine** managing project transitions
- **79 tests** ensuring reliability

### CLI Access

```bash
npm run cli -- status INI-EXAMPLE-001
npm run cli -- gate INI-EXAMPLE-001 product
npm run cli -- next INI-EXAMPLE-001
```

### Project Structure

```
.opencode/
└── skills/
    └── locus/
        └── SKILL.md     # Main planning skill

openspec/
├── lib/                 # TypeScript framework
└── initiatives/         # Project artifacts

opencode.json            # Command definitions
```

## Why "Locus"?

**Locus** (noun): A center point; a place where something is situated or occurs.

Your projects need a center point - a place where vision, planning, and execution converge. That's Locus.

## License

MIT
