# Locus Framework Improvement List

Based on the TeamFlow exercise grading (82/100), this document identifies specific improvements needed for agents, skills, and the core framework.

---

## Priority 1: Critical Gaps (Directly caused grading deductions)

### 1.1 Add Estimation Validation to Project Manager

**Problem**: Time estimates in the TeamFlow exercise were optimistic (CRDT integration at 12h when it typically takes 40h+).

**File**: `skills/02-product-management/project-manager/SKILL.md`

**Add Section**:
```markdown
## Estimation Validation

### Red Flags to Challenge

| Pattern | Expected Multiplier | Reason |
|---------|---------------------|--------|
| "Integration with external API" | 2-3x | Auth, rate limits, error handling |
| "Real-time sync" | 3-5x | Edge cases, reconnection, conflict resolution |
| "New technology to team" | 2x | Learning curve |
| "Cross-team dependency" | 1.5x | Coordination overhead |
| "Database migration" | 2x | Testing, rollback planning |

### Estimation Challenges

Before accepting estimates, ask:
1. "Has the team done this exact thing before? If not, add buffer."
2. "Does this require coordination with another team? Add 50%."
3. "Is there a new technology involved? Double it."
4. "Does this touch auth/payments/security? Add buffer for review cycles."

### Historical Comparison

When available, compare against:
- Similar past tasks in this codebase
- Industry benchmarks for common tasks
- Team's actual vs estimated history
```

---

### 1.2 Add Testing Strategy Section to Tech Lead

**Problem**: No systematic testing strategy was produced in the planning output.

**File**: `skills/03-engineering-leadership/tech-lead/SKILL.md`

**Add Section**:
```markdown
## Testing Strategy Requirements

Every technical design MUST include a testing strategy section:

### Testing Strategy Template

```markdown
## Testing Strategy

### Test Pyramid

| Layer | Coverage Target | Focus Areas |
|-------|-----------------|-------------|
| Unit | 80%+ | Business logic, utilities |
| Integration | Key paths | API contracts, DB operations |
| E2E | Critical flows | User journeys, happy paths |

### Testing Approach by Component

| Component | Test Type | Tools | Notes |
|-----------|-----------|-------|-------|
| [Component] | [Type] | [Tool] | [Special considerations] |

### Test Environment Requirements

- [ ] Local test database setup
- [ ] Mock services for external APIs
- [ ] CI pipeline integration
- [ ] Test data factories

### Performance Testing

- Load test targets: [X requests/second]
- Latency requirements: [p99 < Yms]
- Test scenarios: [List]
```

### When to Mandate Testing

| Change Type | Unit Test | Integration | E2E |
|-------------|-----------|-------------|-----|
| New feature | Required | Required | Recommended |
| Bug fix | Required for the bug | If API affected | If user-facing |
| Refactor | Coverage must not decrease | If contracts change | No |
| Performance | Benchmark tests | Load tests | No |
```

---

### 1.3 Add Capacity Validation to Scrum Master

**Problem**: Sprint hours were not validated against team capacity.

**File**: `skills/02-product-management/scrum-master/SKILL.md`

**Add Section**:
```markdown
## Capacity Validation

### Sprint Capacity Calculator

```
Available Hours per Person = Sprint Days × Hours per Day × Focus Factor

Focus Factor:
- Senior: 0.7 (meetings, mentoring, reviews)
- Mid-level: 0.8 (some meetings, reviews)
- Junior: 0.85 (mostly coding, some pairing)

Example (2-week sprint):
- 10 working days × 8 hours × 0.75 average = 60 available hours per person
- 8-person team = 480 available hours
- Add 20% buffer for unknowns = 384 committable hours
```

### Capacity Check Checklist

Before committing to a sprint:
- [ ] Sum all task estimates
- [ ] Compare against team capacity (with focus factor)
- [ ] Verify no single person is > 80% allocated
- [ ] Account for planned PTO/holidays
- [ ] Reserve time for ceremonies (planning, retro, reviews)
- [ ] Include code review time (typically 10-15% of dev time)

### Warning Signs

| Signal | Action |
|--------|--------|
| Sprint hours > 80% of capacity | Reduce scope |
| Single person > 90% allocated | Redistribute work |
| No buffer time | Cut lowest priority items |
| Multiple "stretch goals" | These will be cut |
```

---

### 1.4 Add Operational Readiness Checklist to SRE Engineer

**Problem**: No monitoring, alerting, or operational considerations in planning output.

**File**: `skills/04-developer-specializations/infrastructure/sre-engineer/SKILL.md`

**Add Section**:
```markdown
## Operational Readiness Checklist

### Pre-Launch Requirements

Every new service/feature MUST have:

#### Observability
- [ ] Application metrics (requests, errors, latency)
- [ ] Business metrics (key user actions)
- [ ] Structured logging with correlation IDs
- [ ] Distributed tracing integration

#### Alerting
- [ ] SLO-based alerts defined
- [ ] Alert routing to correct team
- [ ] Escalation paths documented
- [ ] PagerDuty/on-call integration

#### Documentation
- [ ] Runbook for common issues
- [ ] Architecture diagram
- [ ] Dependency map
- [ ] Rollback procedure

#### Testing
- [ ] Load test passed
- [ ] Chaos/failure testing completed
- [ ] Disaster recovery tested

### Operational Readiness Review

Before marking a feature "done", verify:

| Category | Question | Required? |
|----------|----------|-----------|
| Monitoring | Can we see if it's working? | Yes |
| Alerting | Will we know if it breaks? | Yes |
| Runbook | Can on-call fix common issues? | Yes |
| Rollback | Can we undo this change quickly? | Yes |
| Scaling | Do we know the limits? | For new services |
| Cost | Do we know the infrastructure cost? | For new services |
```

---

## Priority 2: Framework Improvements

### 2.1 Update Main Locus SKILL.md with Gate Visualization

**Problem**: Gate criteria passing/failing not shown in outputs.

**File**: `.opencode/skills/locus/SKILL.md`

**Add to "Behind the Scenes" section**:
```markdown
### Gate Status Visualization

When completing each step, show gate status:

```
✅ Step 1: Vision - Gate Passed
   ✅ Vision statement defined
   ✅ User personas identified (4 found)
   ✅ Success metrics defined (5 metrics)
   ✅ Competitive positioning documented

📋 Step 2: Features - In Progress
   ✅ Feature list created
   ⏳ MoSCoW prioritization
   ⏳ User stories
```

This helps users understand what the framework is validating.
```

---

### 2.2 Add Buffer Calculation to Project Manager

**Problem**: No automatic buffer added to estimates.

**File**: `skills/02-product-management/project-manager/SKILL.md`

**Add to "Planning Frameworks" section**:
```markdown
### Buffer Calculation

Always add explicit buffers:

| Project Phase | Recommended Buffer |
|---------------|-------------------|
| Foundation (new setup) | 30% |
| Core development | 20% |
| Integration phase | 30% |
| Polish/bug fix | 40% |

### Buffer Types

1. **Task buffer**: Add 20% to individual task estimates
2. **Sprint buffer**: Reserve 1-2 days per sprint for unknowns
3. **Milestone buffer**: Add 1 week per month to major milestones

### Example

```
Raw estimate: 100 hours
Task buffer (20%): 120 hours
Team factor (0.8 for mid-level): 150 hours
Risk factor (new tech = 1.3): 195 hours
Final estimate: ~200 hours (round up)
```
```

---

### 2.3 Create New Skill: Estimation Expert

**Problem**: No dedicated skill for estimation accuracy.

**New File**: `skills/02-product-management/estimation-expert/SKILL.md`

```markdown
---
name: estimation-expert
description: Software estimation techniques, historical comparison, uncertainty handling, and estimation calibration
metadata:
  version: "1.0.0"
  tier: product
  category: estimation
  council: product-council
---

# Estimation Expert

You embody the perspective of an estimation expert who uses data-driven techniques to produce realistic project estimates with appropriate uncertainty ranges.

## When to Apply

Invoke this skill when:
- Estimating new features or projects
- Reviewing estimates for reasonableness
- Comparing estimates against historical data
- Handling estimation uncertainty
- Calibrating team estimation accuracy

## Core Techniques

### 1. Reference Class Forecasting

Compare to similar past projects:

| Current Task | Reference Class | Historical Range |
|--------------|-----------------|------------------|
| "Build auth system" | Auth implementations | 2-6 weeks |
| "Add real-time sync" | WebSocket features | 4-12 weeks |
| "Third-party integration" | API integrations | 1-4 weeks |

### 2. Three-Point Estimation

For uncertain tasks, estimate:
- **Optimistic (O)**: Best case, everything goes right
- **Most Likely (M)**: Normal conditions
- **Pessimistic (P)**: Worst case, major blockers

**PERT Formula**: (O + 4M + P) / 6

### 3. Complexity Multipliers

| Factor | Multiplier |
|--------|------------|
| New technology to team | 2.0x |
| Cross-team coordination | 1.5x |
| External API dependency | 1.5x |
| Security-sensitive | 1.3x |
| Performance-critical | 1.3x |
| Unknown requirements | 2.0x |

### 4. Estimation Smell Detection

Red flags that suggest underestimation:

| Smell | Risk | Action |
|-------|------|--------|
| "Should be quick" | High | Challenge with specifics |
| "I've done this before" (but not exactly this) | Medium | Add learning buffer |
| No unknowns identified | High | Force uncertainty discussion |
| Single-point estimate | Medium | Request range |
| Round numbers only | Low | Ask for breakdown |

## Estimation Challenges

Questions to ask before accepting estimates:

1. "What's the smallest this could be? What's the largest?"
2. "What could go wrong that would double this estimate?"
3. "Have we done exactly this before, or something similar?"
4. "What dependencies could block this?"
5. "Is there any part you're uncertain about?"

## Calibration

Track estimation accuracy over time:

| Sprint | Estimated | Actual | Accuracy |
|--------|-----------|--------|----------|
| Sprint 1 | 100h | 130h | 77% |
| Sprint 2 | 90h | 100h | 90% |
| Sprint 3 | 110h | 115h | 96% |

Use historical accuracy to adjust future estimates.

## Constraints

- Never accept single-point estimates for uncertain work
- Always identify and document assumptions
- Track estimation accuracy for calibration
- Challenge "quick" estimates on unfamiliar work
- Make uncertainty visible, not hidden
```

---

## Priority 3: Agent Improvements

### 3.1 Update Tech Lead Agent with Design Checklist

**File**: `agents/engineering/tech-lead.md`

**Add Section**:
```markdown
## Technical Design Checklist

Before approving any technical design, verify:

### Architecture
- [ ] Component diagram included
- [ ] Data flow documented
- [ ] API contracts defined
- [ ] Dependencies mapped

### Quality
- [ ] Testing strategy defined
- [ ] Error handling approach
- [ ] Logging strategy
- [ ] Performance requirements

### Operations
- [ ] Monitoring plan
- [ ] Alerting requirements
- [ ] Deployment strategy
- [ ] Rollback procedure

### Security
- [ ] Authentication/authorization approach
- [ ] Data protection considerations
- [ ] Audit logging if needed
```

---

### 3.2 Update Project Manager Agent with Validation Steps

**File**: `agents/product/project-manager.md`

**Add to "Decision Framework"**:
```markdown
### Plan Validation Checklist

Before finalizing any project plan, verify:

#### Capacity
- [ ] Total hours vs team capacity calculated
- [ ] No person over 80% allocated
- [ ] Buffer included (minimum 20%)

#### Dependencies
- [ ] External dependencies identified
- [ ] Cross-team coordination planned
- [ ] Critical path identified

#### Risks
- [ ] Top 5 risks documented
- [ ] Mitigation strategies defined
- [ ] Risk checkpoints scheduled

#### Completeness
- [ ] Testing time included
- [ ] Code review time included
- [ ] Documentation time included
- [ ] Deployment time included
```

---

### 3.3 Add New Agent: QA Strategist

**Problem**: QA expert is implementation-focused, need strategic testing planning.

**New File**: `agents/product/qa-strategist.md`

```markdown
---
name: qa-strategist
description: Quality strategy planning, test coverage analysis, and quality gates definition. Use for planning phase quality decisions.
tools: Read, Write, Grep, Glob
---

You are a QA Strategist focused on building quality into the planning process, not just testing at the end.

## Core Identity

**Role**: QA Strategist
**Expertise**: Test strategy, quality gates, shift-left testing, risk-based testing
**Perspective**: Quality is planned, not inspected in

## Primary Objectives

1. Ensure every plan includes testing strategy
2. Define quality gates for each project phase
3. Identify testing risks early in planning
4. Advocate for testability in design

## Quality Gate Definitions

### Phase Gates

| Phase | Quality Gate | Criteria |
|-------|--------------|----------|
| Design | Testability Review | Can we test this? How? |
| Development | Unit Test Coverage | 80%+ coverage on new code |
| Integration | API Contract Tests | All endpoints tested |
| Pre-release | E2E Critical Paths | Top 10 user journeys pass |
| Release | Performance Baseline | Meets latency targets |

### Planning Deliverables

Every project plan should include:
1. Test strategy document
2. Test environment requirements
3. Test data requirements
4. Quality metrics and targets
5. Testing timeline in sprint plan

## Communication Protocol

### To Tech Lead
- "What's our testing strategy for [feature]?"
- "Have we allocated time for test automation?"
- "What's our coverage target?"

### To Project Manager
- "Testing will need X hours, not included in current estimates"
- "We need test environment setup before sprint 3"
- "QA risk: [component] has no test coverage currently"
```

---

## Priority 4: Schema/Flow Improvements

### 4.1 Add Testing Strategy Artifact to Schema

**File**: `openspec/schemas/initiative-flow/schema.yaml`

**Add to tier3 artifacts**:
```yaml
- id: test-strategy
  tier: tier3
  generates: tier3/test-strategy.md
  template: test-strategy.md
  description: Testing strategy and quality gates
  instruction: |
    Create a testing strategy that covers:
    - Test pyramid for this project
    - Testing approach by component
    - Test environment requirements
    - Quality gates and metrics
    - Testing timeline
  requires:
    - adrs
    - stories
```

### 4.2 Add Operational Readiness Artifact

**Add to tier4 artifacts**:
```yaml
- id: operational-readiness
  tier: tier4
  generates: tier4/ops-readiness.md
  template: ops-readiness.md
  description: Operational readiness checklist
  instruction: |
    Document operational requirements:
    - Monitoring and alerting setup
    - Runbooks for common issues
    - Scaling considerations
    - Disaster recovery plan
  requires:
    - implementation
```

### 4.3 Update Design Gate Criteria

**In schema.yaml, update design gate**:
```yaml
design:
  description: Technical design complete
  from_artifacts:
    - adrs
    - stories
    - tasks
    - test-strategy  # ADD THIS
  to_tier: tier4
  criteria:
    # ... existing criteria ...
    
    - id: test_strategy_exists
      check: file_exists
      path: tier3/test-strategy.md
      description: Testing strategy documented
```

---

## Priority 5: Template Improvements

### 5.1 Create Test Strategy Template

**New File**: `openspec/schemas/initiative-flow/templates/test-strategy.md`

```markdown
---
status: draft
created: ${DATE}
---

# Test Strategy: ${TITLE}

## Test Pyramid

| Layer | Coverage Target | Focus |
|-------|-----------------|-------|
| Unit | | |
| Integration | | |
| E2E | | |

## Component Testing Approach

| Component | Test Type | Tools | Owner |
|-----------|-----------|-------|-------|
| | | | |

## Test Environment

### Requirements
- [ ] Database (type, seed data)
- [ ] External service mocks
- [ ] CI/CD integration
- [ ] Test data factories

### Setup Instructions
<!-- How to set up test environment -->

## Quality Gates

| Phase | Gate | Criteria |
|-------|------|----------|
| PR Merge | | |
| Staging Deploy | | |
| Production Deploy | | |

## Testing Timeline

| Sprint | Testing Focus | Deliverables |
|--------|---------------|--------------|
| | | |

## Risks

| Risk | Mitigation |
|------|------------|
| | |
```

### 5.2 Create Operational Readiness Template

**New File**: `openspec/schemas/initiative-flow/templates/ops-readiness.md`

```markdown
---
status: draft
created: ${DATE}
---

# Operational Readiness: ${TITLE}

## Monitoring

### Metrics
| Metric | Type | Alert Threshold |
|--------|------|-----------------|
| | | |

### Dashboards
- [ ] Service health dashboard
- [ ] Business metrics dashboard

## Alerting

| Alert | Severity | Routing | Runbook |
|-------|----------|---------|---------|
| | | | |

## Runbooks

### Common Issues
<!-- Link to runbook documents -->

## Deployment

### Procedure
1. 
2. 
3. 

### Rollback
1. 
2. 
3. 

## Scaling

| Component | Current Capacity | Scaling Trigger | Scaling Action |
|-----------|------------------|-----------------|----------------|
| | | | |

## Cost Estimate

| Resource | Monthly Cost |
|----------|-------------|
| | |
| **Total** | |
```

---

## Summary: Files to Update/Create

### Updates (11 files)

| File | Changes |
|------|---------|
| `skills/02-product-management/project-manager/SKILL.md` | Add estimation validation, buffer calculation |
| `skills/02-product-management/scrum-master/SKILL.md` | Add capacity validation |
| `skills/03-engineering-leadership/tech-lead/SKILL.md` | Add testing strategy requirements, design checklist |
| `skills/04-developer-specializations/infrastructure/sre-engineer/SKILL.md` | Add operational readiness checklist |
| `agents/engineering/tech-lead.md` | Add technical design checklist |
| `agents/product/project-manager.md` | Add plan validation checklist |
| `.opencode/skills/locus/SKILL.md` | Add gate visualization |
| `openspec/schemas/initiative-flow/schema.yaml` | Add test-strategy and ops-readiness artifacts |

### New Files (5 files)

| File | Purpose |
|------|---------|
| `skills/02-product-management/estimation-expert/SKILL.md` | Dedicated estimation skill |
| `agents/product/qa-strategist.md` | Strategic QA for planning |
| `openspec/schemas/initiative-flow/templates/test-strategy.md` | Test strategy template |
| `openspec/schemas/initiative-flow/templates/ops-readiness.md` | Ops readiness template |
| `IMPROVEMENTS.md` | This document |

---

## Implementation Priority

1. **Week 1**: Project Manager + Tech Lead skill updates (highest impact)
2. **Week 2**: New templates + schema updates (enables gate checking)
3. **Week 3**: New agents/skills (Estimation Expert, QA Strategist)
4. **Week 4**: Locus SKILL.md updates + testing

**Expected Impact**: These changes should improve grading scores by 8-12 points, moving from B (82) to A- (90-94).
