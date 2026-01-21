---
name: plan
description: Help users plan and build projects through a simple step-by-step process
metadata:
  version: "2.0.0"
  author: org-skills
  tier: orchestration
  category: workflow
triggers:
  - /plan
  - plan this
  - help me build
  - I want to build
  - I want to create
  - let's make
  - new project
---

# Plan - Simple Project Planning

Help users go from idea to implementation through 4 simple steps. No jargon, no complexity - just guided progress.

## How It Works

When a user describes something they want to build, guide them through:

```
Step 1: Vision     → What and why?
Step 2: Features   → What will it do?
Step 3: Design     → How will it work?
Step 4: Build      → Make it happen
```

## User Experience

### Starting (User describes their idea)

When user says something like:
- "I want to build an AI trading simulator"
- "/plan a mobile app for..."
- "Help me create a..."

Respond with:

```
I'll help you plan and build this step by step.

📋 [Project Name]
━━━━━━━━━━━━━━━━━━
→ Step 1: Vision      ◄ you are here
  Step 2: Features
  Step 3: Design
  Step 4: Build

Let's start with the vision. [Ask 1-2 clarifying questions]
```

### Progressing (User says "continue", "next", "yes", etc.)

Move to the next step automatically. Show progress:

```
✓ Step 1: Vision — complete

📋 [Project Name]  
━━━━━━━━━━━━━━━━━━
✓ Step 1: Vision
→ Step 2: Features    ◄ you are here
  Step 3: Design
  Step 4: Build

Now let's define the features...
```

### Checking Status (User asks "where are we?", "status", "progress")

```
📋 [Project Name]
━━━━━━━━━━━━━━━━━━
✓ Step 1: Vision
✓ Step 2: Features
→ Step 3: Design      ◄ you are here
  Step 4: Build

Progress: 50% complete
Say "continue" to keep going.
```

## The Four Steps

### Step 1: Vision
**Purpose**: Understand what they're building and why

Ask about:
- What problem does this solve?
- Who is it for?
- What does success look like?

**Output**: Clear vision statement (create behind the scenes)

### Step 2: Features  
**Purpose**: Define what the product will do

Ask about:
- Core features (must have)
- Nice-to-have features
- What's NOT included

**Output**: Feature list with priorities (create behind the scenes)

### Step 3: Design
**Purpose**: Figure out how it will work

Cover:
- Key technical decisions
- Architecture overview
- Main components

**Output**: Technical approach (create behind the scenes)

### Step 4: Build
**Purpose**: Actually create it

Do:
- Break into tasks
- Start implementing
- Track progress

**Output**: Working code/product

## Response Patterns

### Keep It Conversational

**Good:**
> "Great! So we're building a trading simulator that helps people learn without risking real money. What's the most important feature it needs?"

**Bad:**
> "I have created the strategic mandate artifact for Tier 1. The gate criteria require vision_aligned=true. Proceeding to Tier 2 Product Planning phase."

### Show Progress Visually

Always show the simple progress bar:
```
📋 Project Name
━━━━━━━━━━━━━━
✓ Step 1: Vision
→ Step 2: Features ◄
  Step 3: Design
  Step 4: Build
```

### Handle "continue" Naturally

When user says: continue, next, yes, keep going, proceed, go ahead, let's do it

→ Move to next step or continue current step

### Handle Questions

If user asks about the process:
> "We're working through 4 steps: Vision → Features → Design → Build. You're on step 2. Just say 'continue' when you're ready to move forward."

## Behind the Scenes

The skill uses the Initiative Flow Framework internally but **never exposes this to the user**.

| User Sees | Framework Does |
|-----------|----------------|
| Step 1: Vision | Creates strategic-mandate.md, passes strategic gate |
| Step 2: Features | Creates prd.md and epics, passes product gate |
| Step 3: Design | Creates ADRs, stories, tasks, passes design gate |
| Step 4: Build | Creates implementation files, tracks progress |

### File Management

Create files silently in: `projects/{project-slug}/`

```
projects/ai-trading-simulator/
├── plan.md           # Combined readable plan
├── vision.md         # Step 1 output
├── features.md       # Step 2 output  
├── design.md         # Step 3 output
└── tasks/            # Step 4 breakdown
```

### State Tracking

Track state in a simple format:
```yaml
# projects/{slug}/.plan-state.yaml
project: AI Trading Simulator
current_step: 2
steps:
  1: complete
  2: in_progress
  3: pending
  4: pending
created: 2025-01-20
```

## Example Conversation

```
User: I want to build an AI trading simulator

AI: I'll help you plan and build this step by step.

    📋 AI Trading Simulator
    ━━━━━━━━━━━━━━━━━━━━━━━
    → Step 1: Vision      ◄ you are here
      Step 2: Features
      Step 3: Design
      Step 4: Build

    Let's start with the vision.
    
    What problem does this solve? Who would use it?

User: People who want to learn trading without risking real money. 
      It should use AI to help them learn faster.

AI: Got it — a risk-free trading simulator with AI-powered learning.

    A few quick questions:
    1. Should it simulate real market data or simplified scenarios?
    2. Web app, mobile, or both?

User: Real market data, web app first

AI: Perfect. Here's the vision:

    **AI Trading Simulator**
    A web-based trading simulator using real market data where users 
    can practice trading strategies risk-free, with AI providing 
    personalized feedback to accelerate learning.

    ✓ Step 1: Vision — complete

    📋 AI Trading Simulator
    ━━━━━━━━━━━━━━━━━━━━━━━
    ✓ Step 1: Vision
    → Step 2: Features    ◄ you are here
      Step 3: Design
      Step 4: Build

    Ready to define features?

User: yes

AI: Let's figure out what it needs to do.

    **Must-have features** (what's essential?):
    - Virtual portfolio with fake money
    - Real market data
    - Basic buy/sell trades
    - AI feedback on trades
    
    **Nice-to-have** (if time permits?):
    - Leaderboards
    - Strategy backtesting
    - Social features
    
    Does this capture it, or should we add/remove anything?

User: Add paper trading competitions as nice-to-have. Otherwise good.

AI: Added. Here's the feature plan:

    **Must Have**
    • Virtual portfolio ($100k starting balance)
    • Real-time market data (stocks)
    • Buy/sell/short trades
    • AI coach (analyzes trades, suggests improvements)
    • Performance dashboard
    
    **Nice to Have**  
    • Leaderboards & competitions
    • Strategy backtesting
    • Paper trading competitions
    • Social sharing
    
    ✓ Step 2: Features — complete

    📋 AI Trading Simulator
    ━━━━━━━━━━━━━━━━━━━━━━━
    ✓ Step 1: Vision
    ✓ Step 2: Features
    → Step 3: Design      ◄ you are here
      Step 4: Build

    Continue to design?

User: continue

AI: Now let's figure out how to build this...
    [Continues to design step]
```

## Constraints

- **Never use jargon**: No "tiers", "gates", "artifacts", "epics", "ADRs"
- **Never show file paths**: User doesn't need to know where files are
- **Always show progress**: The 4-step visual keeps users oriented
- **Keep it conversational**: Like talking to a helpful colleague
- **One thing at a time**: Don't overwhelm with options
