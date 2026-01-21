---
name: product-council
description: Product and project decision-making council for feature prioritization, roadmap planning, and delivery coordination
metadata:
  version: "1.0.0"
  type: council
  chairman: product-manager
  members:
    - product-manager
    - project-manager
    - scrum-master
    - tech-lead
---

# Product Council

A deliberative body for product and project decisions requiring cross-functional input. Uses collaborative discussion and synthesis to produce balanced recommendations.

## When to Convene

Convene the Product Council when:
- Prioritizing major features or initiatives
- Planning quarterly roadmaps
- Resolving resource or priority conflicts
- Evaluating scope changes
- Making build/buy/partner decisions for features
- Assessing delivery risks

## Council Members

| Role | Perspective | Primary Concerns |
|------|-------------|------------------|
| **Product Manager** | User/Business | User value, business impact |
| **Project Manager** | Execution | Timeline, resources, risks |
| **Scrum Master** | Team | Capacity, health, process |
| **Tech Lead** | Technical | Feasibility, architecture, debt |

## Deliberation Process

### Phase 1: Context Setting
Product Manager presents:
- User problem and evidence
- Business case and metrics
- Proposed scope and success criteria

### Phase 2: Multi-Perspective Analysis
Each member evaluates from their lens:
- Project Manager: Timeline, dependencies, risks
- Scrum Master: Team capacity, sprint fit
- Tech Lead: Technical approach, complexity

### Phase 3: Trade-off Discussion
Council discusses:
- Scope vs timeline tradeoffs
- Resource implications
- Risk mitigations
- Alternative approaches

### Phase 4: Recommendation
Product Manager synthesizes:
- Recommended approach
- Key tradeoffs accepted
- Success criteria
- Next steps

## Decision Framework

### Prioritization Criteria

| Factor | Weight | Questions |
|--------|--------|-----------|
| User Impact | High | How much value for users? |
| Business Value | High | What's the business case? |
| Effort | Medium | How much work? |
| Risk | Medium | What could go wrong? |
| Dependencies | Medium | What's blocked/blocking? |

### Scope Change Evaluation

| Question | Owner |
|----------|-------|
| What's the user impact? | Product Manager |
| What's the timeline impact? | Project Manager |
| What's the team impact? | Scrum Master |
| What's the technical impact? | Tech Lead |

## Output Format

### Council Decision Document

```markdown
## Product Council Decision

**Topic**: [Brief statement]
**Date**: [Date]
**Decision**: [Approved/Modified/Deferred]

### Summary
[1-2 paragraph summary]

### Analysis

#### User/Business (PM)
- [Key points]

#### Execution (Project)
- [Key points]

#### Team (Scrum)
- [Key points]

#### Technical (Tech Lead)
- [Key points]

### Decision
[What was decided and why]

### Tradeoffs Accepted
- [Tradeoff 1]
- [Tradeoff 2]

### Next Steps
1. [Action item, owner, date]
2. [Action item, owner, date]
```

## Integration with Other Councils

| Decision Type | Primary Council | Escalate To |
|---------------|-----------------|-------------|
| Feature prioritization | Product | Executive (if strategic) |
| Technical approach | Architecture | Product (if scope impact) |
| Execution planning | Product | - |
| Resource allocation | Product | Executive (if cross-org) |
