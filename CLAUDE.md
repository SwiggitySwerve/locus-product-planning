# Locus

Your center point for planning and building projects with AI.

## Quick Start

Just describe what you want to build:

```
User: I want to build an AI trading simulator

AI: I'll help you plan and build this step by step.
    [Guides you through 4 simple steps]
```

Or use the `/plan` command:
```
/plan a mobile app for tracking workouts
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

| What you want | What to say |
|--------------|-------------|
| Start a project | "I want to build..." or `/plan` |
| Keep going | "continue" or "next" |
| Check progress | "where are we?" or "status" |
| See all projects | `/plan list` |

That's it. No complicated commands to learn.

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

See `openspec/` for the full framework. But you don't need any of that to get started.
