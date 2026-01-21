# Initiative Flow Framework - AI Agent Instructions

This document provides instructions for AI agents working with the Initiative Flow system.

## Overview

The Initiative Flow Framework orchestrates work through 4 organizational tiers:

```
Tier 1: Strategic Review    -> Executive Council
Tier 2: Product Planning    -> Product Council
Tier 3: Technical Design    -> Architecture Council
Tier 4: Implementation      -> Code Review Council
```

Each tier produces artifacts that unlock the next tier via machine-checkable gates.

## Core Concepts

### Artifact States (OpenSpec Pattern)

Every artifact exists in exactly one state:

| State | Meaning | Action |
|-------|---------|--------|
| `BLOCKED` | Dependencies not complete | Wait for deps |
| `READY` | Dependencies met, can be created | Create artifact |
| `DONE` | Artifact exists on filesystem | Proceed |

### Stage Transitions

Initiatives progress through stages:

```
draft -> tier1_active -> tier1_approved -> tier2_active -> ...
                |                                |
                v                                v
         tier1_blocked                    tier2_blocked
```

**Approved stages** require passing a gate. **Blocked stages** require escalation resolution.

### Gates

Gates are machine-checkable criteria that must pass before tier advancement:

| Gate | Checks |
|------|--------|
| `strategic` | Mandate exists, vision_aligned=true, sponsor set |
| `product` | PRD exists, epics defined with MoSCoW |
| `design` | ADRs, stories, tasks created with skills |
| `implementation` | Progress complete, reviews done |

## Agent Behavior Rules

### 1. Status Queries First

Before creating any artifact, query current status:

```typescript
const status = await getInitiativeStatus(initiativeId, schema, basePath);
const nextAction = status.nextAction; // What to do next
```

### 2. Respect Artifact Dependencies

Never create an artifact before its dependencies are DONE:

```yaml
# schema.yaml defines dependencies
artifacts:
  - id: prd
    requires: [strategic-mandate]  # Must exist first
```

### 3. Gate Validation Before Transitions

Before advancing tier, verify gate passes:

```typescript
const gateResult = await checkGate(initiativeId, 'strategic', schema);
if (!gateResult.passed) {
  // Cannot transition - report failing criteria
  console.log(gateResult.failingCriteria);
}
```

### 4. Escalation Handling

When blocked, escalate to the appropriate tier:

- Technical blocks -> Architecture Council (Tier 3)
- Scope blocks -> Product Council (Tier 2)
- Strategic blocks -> Executive Council (Tier 1)

Unresolved escalations block gate passage.

### 5. File Generation

Each artifact has a `generates` path and `template`:

```yaml
- id: strategic-mandate
  generates: tier1/strategic-mandate.md
  template: strategic-mandate.md
```

Create files at the exact path. Use templates from `schemas/initiative-flow/templates/`.

## Workflow by Tier

### Tier 1: Strategic Review

**Council**: executive-council
**Skills**: ceo-strategist, cto-architect, cfo-analyst, coo-operations, cpo-product

**Artifact**: `strategic-mandate`
- Location: `tier1/strategic-mandate.md`
- Required frontmatter:
  ```yaml
  ---
  vision_aligned: true  # MUST be true to pass gate
  sponsor: "Executive Name"  # MUST be non-empty
  success_metrics:
    - "Metric 1"
    - "Metric 2"
  ---
  ```

**Gate Criteria** (`strategic`):
1. File exists at `tier1/strategic-mandate.md`
2. `vision_aligned` field equals `true`
3. `sponsor` field is not empty
4. `success_metrics` field is not empty

### Tier 2: Product Planning

**Council**: product-council
**Skills**: product-manager, project-manager, scrum-master, program-manager

**Artifacts**:
1. `prd` -> `tier2/prd.md`
2. `epics` -> `tier2/epics/*.yaml` (glob pattern)

**Gate Criteria** (`product`):
1. PRD file exists
2. At least 1 epic file exists
3. ALL epics have `moscow` field (must/should/could/wont)

### Tier 3: Technical Design

**Council**: architecture-council
**Skills**: tech-lead, staff-engineer, principal-engineer, architect-reviewer

**Artifacts**:
1. `adrs` -> `tier3/adrs/*.md`
2. `stories` -> `tier3/stories/*.yaml`
3. `tasks` -> `tier3/tasks/*.yaml`

**Gate Criteria** (`design`):
1. At least 1 ADR exists
2. At least 1 story exists
3. At least 1 task exists
4. ALL tasks have `skills_required` field

### Tier 4: Implementation

**Council**: code-review-council
**Coordinator**: dev-coordinator
**Skills**: Grouped by category (core, languages, infrastructure, data-ai, quality)

**Artifacts**:
1. `implementation` -> `tier4/progress.yaml`
2. `review` -> `tier4/reviews/*.md`

**Gate Criteria** (`implementation`):
1. Progress file exists
2. `all_complete` field equals `true`
3. At least 1 review exists

## API Reference

### Status Queries

```typescript
import { getInitiativeStatus, getTierStatus, getArtifactStatus } from './lib/status.js';

// Full initiative status
const status = await getInitiativeStatus('INI-001', schema, basePath);

// Single tier status
const tier = await getTierStatus('INI-001', 'tier2', schema, basePath);

// Single artifact status
const artifact = await getArtifactStatus('INI-001', 'prd', schema, basePath);
```

### Gate Checks

```typescript
import { checkGate, canPassGate } from './lib/gates.js';

// Full gate check with details
const result = await checkGate('INI-001', 'strategic', schema, basePath);
// result.passed, result.failingCriteria, result.criteriaMet

// Quick pass check
const { canPass } = await canPassGate('INI-001', 'product', schema, basePath);
```

### State Transitions

```typescript
import { canTransition, applyTransition, getNextStage } from './lib/state-machine.js';

// Validate transition
const validation = await canTransition('INI-001', 'tier1_active', 'tier1_approved', schema);

// Apply transition (writes to state.yaml)
const result = await applyTransition('INI-001', 'tier1_active', 'tier1_approved', schema);

// Get next stage in happy path
const next = getNextStage('tier1_approved'); // 'tier2_active'
```

## State File Structure

Every initiative has a `state.yaml`:

```yaml
metadata:
  id: INI-001
  title: "Initiative Title"
  created_at: "2024-01-15T10:00:00Z"
  updated_at: "2024-01-16T14:30:00Z"
  mode: strict  # or 'auto'
  allow_overlap: false

stage: tier2_active  # Current stage

history:
  - from: draft
    to: tier1_active
    timestamp: "2024-01-15T10:00:00Z"
  - from: tier1_active
    to: tier1_approved
    timestamp: "2024-01-15T12:00:00Z"
    gate: strategic

escalations:
  - id: ESC-001
    from_tier: tier2
    to_tier: tier1
    severity: high
    reason: "Scope increase requires re-approval"
    created_at: "2024-01-16T09:00:00Z"
    resolved_at: "2024-01-16T14:00:00Z"
    resolution: "Approved with caveats"

blockers: []
```

## Error Handling

### Invalid Transition

```typescript
const result = await applyTransition('INI-001', 'draft', 'tier3_active', schema);
// result.success = false
// result.error = "Invalid transition: draft -> tier3_active"
```

### Gate Failure

```typescript
const validation = await canTransition('INI-001', 'tier1_active', 'tier1_approved', schema);
// validation.valid = false
// validation.reason = "Gate criteria not met for 'strategic': vision_aligned"
// validation.gateCheck.failingCriteria = [...]
```

### Missing Dependencies

```typescript
const status = await getArtifactStatus('INI-001', 'prd', schema);
// status.status = 'blocked'
// status.missingDeps = ['strategic-mandate']
```

## Best Practices

1. **Always query status first** - Don't assume state, verify it
2. **Create artifacts in order** - Respect dependency chains
3. **Validate gates before transitions** - Catch issues early
4. **Handle escalations promptly** - They block gate passage
5. **Use templates** - Ensure consistent artifact structure
6. **Keep state.yaml in sync** - Use applyTransition, don't edit manually
7. **Log gate failures** - Report specific failing criteria for debugging

## Directory Structure

```
initiatives/
  INI-001/
    state.yaml           # Initiative state
    tier1/
      strategic-mandate.md
    tier2/
      prd.md
      epics/
        EP-001-core.yaml
        EP-002-auth.yaml
    tier3/
      adrs/
        ADR-001-architecture.md
      stories/
        ST-001-login.yaml
      tasks/
        TK-001-auth-api.yaml
    tier4/
      progress.yaml
      reviews/
        REV-001-auth-pr.md
```
