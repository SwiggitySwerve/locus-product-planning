---
name: code-review-council
description: Multi-perspective code review council for comprehensive quality assessment of code changes
metadata:
  version: "1.0.0"
  type: council
  chairman: tech-lead
  members:
    - tech-lead
    - security-engineer
    - performance-engineer
    - qa-expert
---

# Code Review Council

A deliberative body for comprehensive code review from multiple technical perspectives. Ensures code changes meet quality, security, performance, and testing standards.

## When to Convene

Convene the Code Review Council when:
- Reviewing critical system changes
- Assessing security-sensitive code
- Evaluating performance-critical paths
- Reviewing architectural changes within code
- Auditing code for production readiness
- Evaluating third-party library integrations

## Council Members

| Role | Perspective | Primary Focus |
|------|-------------|---------------|
| **Tech Lead** | Code quality | Design, maintainability, patterns |
| **Security Engineer** | Security | Vulnerabilities, auth, data handling |
| **Performance Engineer** | Performance | Efficiency, scalability, resources |
| **QA Expert** | Testability | Coverage, test quality, edge cases |

## Review Process

### Phase 1: Individual Review (Parallel)
Each council member reviews independently focusing on their domain:

#### Tech Lead Review
```markdown
## Code Quality Checklist
- [ ] Clear naming and structure
- [ ] Appropriate abstractions
- [ ] No code duplication
- [ ] Error handling complete
- [ ] Documentation adequate
- [ ] Follows project conventions
```

#### Security Engineer Review
```markdown
## Security Checklist
- [ ] Input validation present
- [ ] No injection vulnerabilities
- [ ] Authentication/authorization correct
- [ ] Sensitive data protected
- [ ] No secrets in code
- [ ] Dependencies are safe
```

#### Performance Engineer Review
```markdown
## Performance Checklist
- [ ] No N+1 queries
- [ ] Appropriate caching
- [ ] No memory leaks
- [ ] Efficient algorithms
- [ ] Resource cleanup
- [ ] No blocking operations
```

#### QA Expert Review
```markdown
## Testing Checklist
- [ ] Unit tests present
- [ ] Edge cases covered
- [ ] Error paths tested
- [ ] Mocks appropriate
- [ ] Tests are maintainable
- [ ] Integration tests if needed
```

### Phase 2: Findings Compilation
Each reviewer documents findings:
```markdown
### [Reviewer Role] Findings

#### Must Fix (Blocking)
1. [Issue description]
   - Location: file:line
   - Concern: Why this matters
   - Suggestion: How to fix

#### Should Fix (Strong recommendation)
1. [Issue]

#### Consider (Optional improvements)
1. [Suggestion]

#### Questions
1. [Clarification needed]
```

### Phase 3: Synthesis (Chair)
Tech Lead synthesizes all findings:
1. Deduplicate overlapping concerns
2. Prioritize by impact
3. Resolve conflicting feedback
4. Create unified review summary

## Review Output Format

```markdown
# Code Review Summary

## PR: [Title]
**Author**: @username
**Reviewers**: @tech-lead, @security, @perf, @qa

## Overall Status: [APPROVED | CHANGES REQUESTED | NEEDS DISCUSSION]

## Summary
Brief overall assessment of the change.

## Must Fix Before Merge
| ID | Issue | Category | Location |
|----|-------|----------|----------|
| 1 | SQL injection risk | Security | api/users.ts:45 |
| 2 | Missing error handling | Quality | lib/fetch.ts:23 |

## Should Fix
| ID | Issue | Category | Location |
|----|-------|----------|----------|
| 3 | No test for edge case | Testing | - |

## Suggestions
| ID | Suggestion | Category |
|----|------------|----------|
| 4 | Consider caching | Performance |

## Positive Observations
- Good separation of concerns
- Comprehensive error messages
- Clean commit history

## Discussion Points
- Should we use X pattern instead?

## Next Steps
1. Address must-fix items
2. Respond to questions
3. Re-request review
```

## Severity Levels

| Level | Definition | Action |
|-------|------------|--------|
| **Must Fix** | Security, correctness, or critical quality issue | Block merge |
| **Should Fix** | Significant improvement recommended | Fix preferred |
| **Consider** | Nice to have, stylistic | Author discretion |
| **Praise** | Good practice worth noting | No action needed |

## Review Guidelines

### For Reviewers
1. Be constructive and specific
2. Explain the "why" behind suggestions
3. Offer solutions, not just problems
4. Distinguish blocking vs optional
5. Acknowledge good work

### For Authors
1. Respond to all comments
2. Ask for clarification if needed
3. Push fixes, don't just resolve
4. Re-request review when ready

## Fast-Track Criteria

Skip full council review when:
- Documentation-only changes
- Test-only changes (unless reducing coverage)
- Simple bug fixes with tests
- Dependency updates (if automated scanning passes)

Single reviewer sufficient:
- Small, isolated changes
- Well-tested changes
- Non-critical paths

## Escalation

Escalate to Architecture Council when:
- Significant design disagreements
- Changes affect system architecture
- New patterns or libraries proposed
- Cross-team impact identified

## Example Invocation

```
Convene Code Review Council for:

**PR**: #1234 - Add payment processing endpoint

**Context**:
- New API endpoint for processing payments
- Integrates with Stripe API
- Includes webhook handling

**Key Areas of Concern**:
1. Security of payment data handling
2. Idempotency of payment operations
3. Error handling and retry logic
4. Test coverage for failure scenarios

**Files Changed**:
- api/payments/route.ts (new)
- lib/stripe.ts (modified)
- tests/payments.test.ts (new)

Please conduct multi-perspective review and provide unified feedback.
```

## Integration with CI/CD

```yaml
# Required reviews configuration
reviews:
  required_approvals: 2
  required_roles:
    - tech-lead
    - security  # For files matching: api/**, auth/**
  
  auto_assign:
    security:
      paths:
        - 'api/**'
        - 'auth/**'
        - '**/security/**'
    performance:
      paths:
        - 'db/**'
        - '**/query/**'
        - 'cache/**'
```
