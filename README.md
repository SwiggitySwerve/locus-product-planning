# Locus

**Your center point for planning and building projects with AI.**

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

| What you want | What to say |
|--------------|-------------|
| Start a project | "I want to build..." or `/plan` |
| Keep going | "continue" or "next" |
| Check progress | "where are we?" |

## Installation

```bash
git clone https://github.com/SwiggitySwerve/locus.git
cd locus
npm install
```

## For Power Users

Under the hood, Locus uses a full organizational workflow framework with:

- **38 AI Skills** across 4 tiers (Executive → Developer)
- **4 Councils** for multi-agent decision making
- **Machine-checkable gates** for quality control
- **79 tests** ensuring reliability

### CLI Access

```bash
npm run cli -- status INI-EXAMPLE-001
npm run cli -- gate INI-EXAMPLE-001 product
```

### Framework Documentation

| Resource | Description |
|----------|-------------|
| [`openspec/AGENTS.md`](openspec/AGENTS.md) | AI agent instructions |
| [`openspec/config.yaml`](openspec/config.yaml) | Framework configuration |
| [`skills/`](skills/) | All 38 skills by tier |
| [`councils/`](councils/) | Multi-agent councils |

## Why "Locus"?

**Locus** (noun): A center point; a place where something is situated or occurs.

Your projects need a center point - a place where vision, planning, and execution converge. That's Locus.

## License

MIT
