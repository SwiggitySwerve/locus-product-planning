---
name: architecture-council
description: Technical decision-making council for architecture, design patterns, technology choices, and engineering standards
metadata:
  version: "1.0.0"
  type: council
  chairman: principal-engineer
  members:
    - principal-engineer
    - staff-engineer
    - tech-lead
    - architect-reviewer
    - cto-architect
---

# Architecture Council

A deliberative body for technical decision-making on architecture, design patterns, technology choices, and engineering standards. Ensures technical coherence across the organization while respecting team autonomy.

## When to Convene

Convene the Architecture Council when:
- Introducing new technology to the tech radar
- Making architectural decisions affecting multiple teams
- Reviewing RFCs with organization-wide impact
- Setting or changing engineering standards
- Resolving cross-team technical conflicts
- Evaluating significant technical debt remediation
- Assessing build vs buy decisions for platform capabilities

## Council Members

| Role | Perspective | Primary Concerns |
|------|-------------|------------------|
| **Principal Engineer** | Strategic technical | Long-term architecture, technology vision |
| **Staff Engineer** | Cross-team technical | Implementation feasibility, cross-cutting concerns |
| **Tech Lead** | Team-level practical | Delivery impact, team capability |
| **Architect Reviewer** | Quality/standards | Compliance, documentation, risk |
| **CTO Architect** | Business alignment | Strategy fit, investment, org capability |

## Deliberation Process

### Phase 1: Problem Definition (Async)
Before convening, the proposer prepares:
- Clear problem statement
- Context and constraints
- Proposed solution(s)
- Alternatives considered
- Key questions for the council

### Phase 2: Independent Analysis (Parallel)
Each council member independently:
- Reviews the proposal from their perspective
- Applies their specialized frameworks
- Identifies risks and concerns
- Forms initial position
- Prepares clarifying questions

### Phase 3: Structured Debate (Synchronous)
Council meets for structured discussion:
1. **Proposer presents** (5-10 min)
2. **Clarifying questions** (10 min)
3. **Perspective sharing** - Each member shares view (15 min)
4. **Open debate** - Address disagreements (15 min)
5. **Synthesis** - Chair summarizes positions (5 min)

### Phase 4: Decision
Chairman synthesizes discussion and renders decision:
- Approve as proposed
- Approve with conditions
- Request revision
- Reject with rationale

## Decision Framework

### Decision Categories

| Category | Example | Typical Outcome |
|----------|---------|-----------------|
| **New Technology** | "Add Kafka to tech radar" | Adopt/Trial/Assess/Hold |
| **Architecture Pattern** | "Migrate to event sourcing" | Approve/Revise/Reject |
| **Standard Change** | "Require 80% test coverage" | Adopt/Modify/Defer |
| **Technical Debt** | "Rewrite auth system" | Prioritize/Defer/Split |
| **Build vs Buy** | "Build custom search vs Elasticsearch" | Build/Buy/Partner |

### Technology Radar Decisions

| Ring | Criteria | Evidence Required |
|------|----------|-------------------|
| **Adopt** | Proven, recommended | Production use, team expertise |
| **Trial** | Promising, expanding | Successful pilot, clear benefits |
| **Assess** | Worth exploring | Problem fit, initial research |
| **Hold** | Limit new use | Migration path, timeline |

### Voting and Consensus

| Outcome | Definition | Action |
|---------|------------|--------|
| **Consensus** | All agree or acceptable | Proceed |
| **Majority** | 3+ agree | Proceed, note concerns |
| **Split** | No majority | Chairman decides or defer |
| **Veto** | CTO or Principal blocks | Discuss, escalate if needed |

## Output Format

### Architecture Decision Record (ADR)

```markdown
# ADR-[Number]: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-xxx]

## Date
[Decision date]

## Council Decision
[Approved | Approved with Conditions | Rejected | Deferred]

## Context
What is the issue or problem we're addressing?

## Decision Drivers
- [Driver 1]
- [Driver 2]
- [Driver 3]

## Considered Options
### Option 1: [Name]
Description, pros, cons, effort

### Option 2: [Name]
Description, pros, cons, effort

## Decision
What is the change being made? Why this option?

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Cost or risk 1]
- [Cost or risk 2]

### Neutral
- [Change that's neither positive nor negative]

## Conditions (if applicable)
- [Condition 1]
- [Condition 2]

## Implementation Notes
- Owner: [Team or individual]
- Timeline: [Expected completion]
- Review: [When to assess effectiveness]

## Council Notes
- Concerns raised: [Key concerns]
- Dissenting views: [If any]
- Follow-up: [Required actions]
```

## Integration with Other Councils

| Decision Type | Primary Council | Escalation Path |
|---------------|-----------------|-----------------|
| Architecture (multi-team) | Architecture | Executive (if strategic) |
| Architecture (single team) | Team decision | Architecture (if requested) |
| Technology investment | Architecture | Executive (if significant cost) |
| Feature architecture | Team decision | Architecture (if patterns affected) |
| Engineering standards | Architecture | - |
| Security architecture | Architecture + Security review | Executive (if risk) |

## Review Checklist

### For Technology Proposals
- [ ] Problem clearly defined
- [ ] Alternatives considered
- [ ] Team capability assessed
- [ ] Operational implications understood
- [ ] Migration path identified (if replacing)
- [ ] Success criteria defined
- [ ] Rollback strategy exists

### For Architecture Proposals
- [ ] Requirements documented
- [ ] Quality attributes addressed
- [ ] Integration points defined
- [ ] Security reviewed
- [ ] Observability planned
- [ ] Scale considerations
- [ ] Cost implications

## Example Invocation

```
Convene the Architecture Council to evaluate:

**Proposal**: Adopt GraphQL Federation for API Gateway

**Context**:
- Current REST APIs are fragmented across 12 services
- Mobile team requesting unified API
- Performance concerns with current aggregation layer

**Proposal Summary**:
Implement Apollo Federation to create unified graph

**Key Questions**:
1. Is GraphQL the right choice vs optimizing REST?
2. Do we have the expertise to operate this?
3. What's the migration path for existing clients?

**Materials**:
- RFC link
- POC results
- Alternative analysis

Please deliberate and provide decision with ADR.
```

## Escalation Criteria

Escalate to Executive Council when:
- Decision requires significant investment (>$X)
- Affects company-wide technology strategy
- Introduces significant vendor dependency
- Has major security or compliance implications
- Council cannot reach resolution
