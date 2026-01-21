# org-skills Project Instructions

This project contains the **Initiative Flow Framework** - an organizational workflow orchestration system.

## Quick Reference

### Commands
| Command | Description |
|---------|-------------|
| `/initiative new <title>` | Create new initiative, begin Tier 1 |
| `/initiative status [id]` | Show current status |
| `/initiative next [id]` | Work on next action |
| `/initiative gate [id] <gate>` | Check gate criteria |
| `/initiative advance [id]` | Move to next tier |
| `/initiative list` | List all initiatives |

### CLI (for programmatic access)
```bash
npm run cli -- status INI-EXAMPLE-001
npm run cli -- gate INI-EXAMPLE-001 product --json
npm run cli -- next INI-EXAMPLE-001
```

## Initiative Flow Architecture

```
Tier 1: Strategic Review    [Executive Council]
    ↓ strategic gate (vision_aligned, sponsor, metrics)
Tier 2: Product Planning    [Product Council]
    ↓ product gate (prd, epics with moscow)
Tier 3: Technical Design    [Architecture Council]
    ↓ design gate (adrs, stories, tasks with skills)
Tier 4: Implementation      [Code Review Council]
    ↓ implementation gate (progress complete, reviews)
    ✓ Complete
```

## When to Use Initiative Flow

Use `/initiative new` when:
- Starting a significant project that needs planning
- Work requires multiple stakeholders (exec → dev)
- You need documented decisions and artifacts
- The user asks "how should we approach this?"

## Artifact Locations

```
openspec/initiatives/{id}/
├── state.yaml              # Initiative state
├── tier1/
│   └── strategic-mandate.md
├── tier2/
│   ├── prd.md
│   └── epics/*.yaml
├── tier3/
│   ├── adrs/*.md
│   ├── stories/*.yaml
│   └── tasks/*.yaml
└── tier4/
    ├── progress.yaml
    └── reviews/*.md
```

## Gate Criteria (Machine-Checkable)

### Strategic Gate
- `tier1/strategic-mandate.md` exists
- `vision_aligned: true` in frontmatter
- `sponsor` field not empty
- `success_metrics` field not empty

### Product Gate
- `tier2/prd.md` exists
- At least 1 file in `tier2/epics/*.yaml`
- All epics have `moscow` field

### Design Gate
- At least 1 file in `tier3/adrs/*.md`
- At least 1 file in `tier3/stories/*.yaml`
- At least 1 file in `tier3/tasks/*.yaml`
- All tasks have `skills_required` field

### Implementation Gate
- `tier4/progress.yaml` exists
- `all_complete: true` in progress file
- At least 1 file in `tier4/reviews/*.md`

## Skills by Tier

### Tier 1: Executive Suite
- `ceo-strategist` - Vision and strategy
- `cto-architect` - Technical vision
- `cfo-analyst` - Financial analysis
- `coo-operations` - Operations
- `cpo-product` - Product vision

### Tier 2: Product Management
- `product-manager` - Feature prioritization
- `project-manager` - Planning
- `scrum-master` - Agile facilitation
- `roadmap-strategist` - Long-term planning

### Tier 3: Engineering Leadership
- `tech-lead` - Technical direction
- `staff-engineer` - Cross-team architecture
- `principal-engineer` - Org-wide patterns
- `architect-reviewer` - Design review

### Tier 4: Developer Specializations
- Core: frontend, backend, fullstack, mobile
- Languages: typescript, python, golang, rust, java
- Infrastructure: devops, sre, platform, cloud, k8s, security
- Data/AI: data-engineer, ml-engineer, data-scientist, llm-architect
- Quality: qa-expert, performance, accessibility, security-auditor

## Example Workflow

```
User: I want to build a new mobile app feature

AI: Let me start an initiative for this.
    /initiative new Mobile App Feature

    [Creates INI-20240120-001]
    [Begins Tier 1: Strategic Review]
    [Invokes Executive Council skills]
    [Creates strategic-mandate.md]
    
    ✓ Strategic gate passed (4/4 criteria)
    Ready to advance to Tier 2.
    
    /initiative advance INI-20240120-001
    
    [Advances to tier2_active]
    [Invokes Product Council skills]
    [Creates PRD and epics]
    ...continues through tiers...
```

## Important Rules

1. **Never skip tiers** - Must pass gates sequentially
2. **Use templates** - Located in `openspec/schemas/initiative-flow/templates/`
3. **Update state** - After creating artifacts, state.yaml must be updated
4. **Check gates** - Before advancing, verify gate criteria pass
5. **Escalate blockers** - Add to escalations array in state.yaml

## Testing

```bash
# Run all tests (79 tests)
npm test

# Type check
npm run typecheck

# CLI demo
npm run cli -- status INI-EXAMPLE-001
```
