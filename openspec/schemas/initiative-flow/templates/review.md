---
pr: ${PR_NUMBER}
decision: pending  # pending | approved | changes_requested | rejected
reviewers:
  - ${REVIEWER_1}
  - ${REVIEWER_2}
reviewed_at: ${DATE}
---

# Code Review: PR #${PR_NUMBER}

## Context

- **Initiative**: ${INITIATIVE_ID}
- **Story**: ${STORY_ID}
- **Task**: ${TASK_ID}
- **Author**: ${AUTHOR}

## Decision

**${DECISION}**

## Review Summary

### ${REVIEWER_1} (${PERSPECTIVE_1})
<!-- e.g., tech-lead, security-engineer, performance-engineer -->

**Verdict**: Approved / Changes Requested

**Feedback**:
- 

### ${REVIEWER_2} (${PERSPECTIVE_2})

**Verdict**: Approved / Changes Requested

**Feedback**:
- 

## Required Changes

<!-- If changes_requested -->
- [ ] 

## Approved With Notes

<!-- If approved but with suggestions for future -->
- 

## Test Results

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Performance benchmarks met
- [ ] Security scan clean
