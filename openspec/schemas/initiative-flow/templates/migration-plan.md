---
status: draft
created: ${DATE}
---

# Migration Plan: ${TITLE}

## Overview
- **From**: [Current system/state]
- **To**: [Target system/state]
- **Timeline**: [Start date] to [End date]
- **Users Affected**: [Count]

## Migration Strategy

**Selected Strategy**: [ ] Big Bang / [ ] Phased / [ ] Parallel Run / [ ] Strangler

**Rationale**: 

## Scope

### Data to Migrate
| Data Type | Records | Source | Target | Transformation |
|-----------|---------|--------|--------|----------------|
| Users | | | | |
| [Entity] | | | | |

### Features to Migrate
| Feature | Priority | Status |
|---------|----------|--------|
| | P0 | Pending |
| | P1 | Pending |

## Migration Phases

### Phase 1: [Name]
- **Duration**: [X weeks]
- **Scope**: [What's included]
- **Success Criteria**: 
- **Rollback Point**: Yes/No

### Phase 2: [Name]
...

## Data Migration

### ETL Process
1. **Extract**: [Source and method]
2. **Transform**: [Transformations needed]
3. **Load**: [Target and method]
4. **Validate**: [Validation approach]

### Data Validation Rules
| Field | Rule | Action if Failed |
|-------|------|------------------|
| | | |

## Rollback Plan

### Triggers for Rollback
- [ ] Error rate > X%
- [ ] Data validation failures > Y%
- [ ] Critical functionality broken
- [ ] User-reported issues > Z

### Rollback Procedure
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Data Recovery
- Backup location: 
- Recovery time estimate: 
- Recovery procedure: 

## Communication Plan

| Milestone | Audience | Message | Channel | Timing |
|-----------|----------|---------|---------|--------|
| Announcement | All users | Migration coming | Email | -2 weeks |
| Reminder | All users | Migration tomorrow | Email + In-app | -1 day |
| Complete | All users | Migration done | Email | +1 day |
| Issues | Affected users | Known issues | Support | As needed |

## Success Criteria

- [ ] All data migrated with < 0.1% error rate
- [ ] Zero data loss
- [ ] All features functional
- [ ] Performance within acceptable range
- [ ] User acceptance verified
