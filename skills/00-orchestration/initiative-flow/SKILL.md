---
name: initiative-flow
description: Orchestrate work through organizational tiers using the Initiative Flow Framework
metadata:
  version: "1.0.0"
  author: org-skills
  tier: orchestration
  category: workflow
triggers:
  - /initiative
  - /ini
---

# Initiative Flow Orchestrator

This skill orchestrates work through the 4-tier Initiative Flow Framework, coordinating councils and specialists to move initiatives from strategic vision to implementation.

## Architecture

```
User Request
    │
    ▼
┌─────────────────────────────────────────┐
│         Initiative Orchestrator          │
│  • Load/create initiative state          │
│  • Determine current tier & next action  │
│  • Invoke appropriate council/skill      │
│  • Update state & check gates            │
└─────────────────────────────────────────┘
    │
    ├─► Tier 1: Executive Council
    │     Skills: ceo-strategist, cto-architect, cfo-analyst
    │     Artifact: strategic-mandate.md
    │
    ├─► Tier 2: Product Council  
    │     Skills: product-manager, project-manager
    │     Artifacts: prd.md, epics/*.yaml
    │
    ├─► Tier 3: Architecture Council
    │     Skills: tech-lead, principal-engineer, architect-reviewer
    │     Artifacts: adrs/*.md, stories/*.yaml, tasks/*.yaml
    │
    └─► Tier 4: Code Review Council + Dev Specialists
          Skills: All developer specializations
          Artifacts: progress.yaml, reviews/*.md
```

## Commands

### `/initiative new <title>`
Create a new initiative and begin Tier 1 (Strategic Review).

**Workflow**:
1. Create initiative directory: `openspec/initiatives/INI-{timestamp}/`
2. Initialize `state.yaml` with stage: `draft`
3. Transition to `tier1_active`
4. Invoke Executive Council to create strategic mandate
5. Report status and next steps

### `/initiative status [id]`
Show current initiative status, completed tiers, and next action.

**Output includes**:
- Current stage and tier
- Artifact completion status (blocked/ready/done)
- Gate status (passed/pending)
- Active escalations
- Recommended next action

### `/initiative next [id]`
Work on the next action for the initiative.

**Workflow**:
1. Query initiative status
2. Identify next READY artifact
3. Invoke appropriate tier council/skill
4. Create the artifact
5. Update state and check if gate can pass
6. Auto-advance if gate passes (in auto mode)

### `/initiative gate [id] <gate-name>`
Check or attempt to pass a gate.

**Gates**: `strategic`, `product`, `design`, `implementation`

**Workflow**:
1. Run machine-checkable gate criteria
2. Report pass/fail with details
3. If passed, offer to transition to next tier

### `/initiative advance [id]`
Attempt to advance to the next tier (requires gate passage).

### `/initiative list`
List all active initiatives with summary status.

## When to Apply

Reference this skill when:
- User wants to start a new project/initiative with proper planning
- User asks "how should we approach this?" for complex work
- User mentions strategic, product, or architectural decisions
- Work spans multiple tiers (strategy → implementation)
- User explicitly invokes `/initiative` commands

## Tier Workflows

### Tier 1: Strategic Review

**Council**: executive-council
**Required Skills**: ceo-strategist, cto-architect, cfo-analyst, coo-operations, cpo-product

**Process**:
1. Gather context about the initiative
2. Convene Executive Council to deliberate
3. Produce strategic mandate with:
   - Vision alignment (must be `true` to pass gate)
   - Executive sponsor (required)
   - Success metrics (required)
   - Risk assessment
   - Budget/resource commitment

**Gate Criteria** (all must pass):
- `tier1/strategic-mandate.md` exists
- `vision_aligned: true` in frontmatter
- `sponsor` field not empty
- `success_metrics` field not empty

### Tier 2: Product Planning

**Council**: product-council
**Required Skills**: product-manager, project-manager, scrum-master, roadmap-strategist

**Process**:
1. Review strategic mandate for context
2. Convene Product Council
3. Produce PRD with problem statement, personas, scope
4. Break down into epics with MoSCoW prioritization

**Gate Criteria** (all must pass):
- `tier2/prd.md` exists
- At least 1 epic in `tier2/epics/*.yaml`
- All epics have `moscow` field

### Tier 3: Technical Design

**Council**: architecture-council
**Required Skills**: tech-lead, staff-engineer, principal-engineer, architect-reviewer

**Process**:
1. Review PRD and epics
2. Convene Architecture Council
3. Create ADRs for significant decisions
4. Refine stories with technical details
5. Break stories into tasks with skill requirements

**Gate Criteria** (all must pass):
- At least 1 ADR in `tier3/adrs/*.md`
- At least 1 story in `tier3/stories/*.yaml`
- At least 1 task in `tier3/tasks/*.yaml`
- All tasks have `skills_required` field

### Tier 4: Implementation

**Council**: code-review-council
**Coordinator**: dev-coordinator
**Skills**: All developer specializations (frontend, backend, devops, etc.)

**Process**:
1. Review tasks and assignments
2. Route tasks to appropriate specialists
3. Track progress in `progress.yaml`
4. Submit completed work for code review
5. Document review outcomes

**Gate Criteria** (all must pass):
- `tier4/progress.yaml` exists
- `all_complete: true` in progress
- At least 1 review in `tier4/reviews/*.md`

## State Management

### Initiative State File (`state.yaml`)
```yaml
metadata:
  id: INI-001
  title: Initiative Title
  created_at: ISO-timestamp
  updated_at: ISO-timestamp
  mode: strict|auto
  allow_overlap: false

stage: tier2_active  # Current stage

history:
  - from: draft
    to: tier1_active
    timestamp: ISO-timestamp
  - from: tier1_active
    to: tier1_approved
    timestamp: ISO-timestamp
    gate: strategic

escalations: []
blockers: []
```

### Stage Transitions
```
draft → tier1_active → tier1_approved → tier2_active → ...
              ↓                              ↓
        tier1_blocked                  tier2_blocked
```

## Escalation Handling

When blocked, escalate to appropriate tier:
- **Technical blocks** → Architecture Council (Tier 3)
- **Scope changes** → Product Council (Tier 2)  
- **Strategic conflicts** → Executive Council (Tier 1)

Escalations block gate passage until resolved.

## Communication Style

- **Tone**: Professional, structured, action-oriented
- **Audience**: All stakeholders from executives to developers
- **Format**: Clear status updates with next actions

## Constraints

- Never skip tiers (must pass gates sequentially)
- Never suppress gate criteria failures
- Always update state after artifact creation
- Escalate blockers within 24 hours
- Respect council decisions

## Examples

### Example 1: Starting New Initiative
**Input**: `/initiative new Mobile App Redesign`
**Output**:
```
✓ Created initiative INI-20240120-001
✓ Stage: tier1_active

Convening Executive Council for strategic review...

[Executive Council deliberation produces strategic-mandate.md]

✓ Strategic mandate created
✓ Strategic gate: PASSED (4/4 criteria)

Ready to advance to Tier 2 (Product Planning).
Run `/initiative advance` to proceed.
```

### Example 2: Checking Status
**Input**: `/initiative status`
**Output**:
```
Initiative: INI-20240120-001 (Mobile App Redesign)
Stage: tier2_active
Completed: Tier 1 ✓

Artifacts:
  tier1/strategic-mandate: done ✓
  tier2/prd: done ✓
  tier2/epics: done ✓ (5 files)
  tier3/adrs: ready ○
  tier3/stories: blocked (needs adrs)

Next Action: Create ADRs (tier3/adrs/*.md)
Run `/initiative next` to continue.
```

## Related Skills

- `executive-council` - Tier 1 decisions
- `product-council` - Tier 2 planning
- `architecture-council` - Tier 3 design
- `code-review-council` - Tier 4 reviews
- All developer specializations - Tier 4 implementation

## CLI Integration

This skill integrates with the Initiative Flow CLI:
```bash
npm run cli -- status <initiative-id>
npm run cli -- gate <initiative-id> <gate-name>
npm run cli -- next <initiative-id>
```

Use `--json` flag for programmatic access.
