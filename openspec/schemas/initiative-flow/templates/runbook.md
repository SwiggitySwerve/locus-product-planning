---
severity: P1|P2|P3|P4
last_updated: ${DATE}
author: null
---

# Runbook: ${TITLE}

## Metadata
- **On-Call Responsibility**: Yes / No
- **Estimated Resolution Time**: X minutes

## Symptoms
How to identify this issue:
- [ ] [Symptom 1 - e.g., "Error rate > 5% on /api/endpoint"]
- [ ] [Symptom 2]
- [ ] [Symptom 3]

## Impact
- **Users Affected**: [All / Subset / Internal only]
- **Business Impact**: [Description]
- **SLA Impact**: [Yes/No - which SLA]

## Diagnosis Steps

### Step 1: Verify the Issue
```bash
# Check current error rate
curl -s https://monitoring.example.com/api/errors | jq '.rate'
```
**Expected**: < 1%
**If higher**: Continue to Step 2

### Step 2: Check Application Logs
```bash
# Recent errors
kubectl logs -l app=api --tail=100 | grep ERROR
```
**Look for**: [Pattern to identify]

### Step 3: Check Dependencies
```bash
# Database connectivity
psql -h $DB_HOST -c "SELECT 1"

# Redis connectivity
redis-cli -h $REDIS_HOST ping
```

## Resolution Options

### Option A: Quick Mitigation
**When to use**: Immediate relief needed, root cause investigation later
1. [Step 1]
2. [Step 2]
3. **Verify**: [How to confirm mitigation worked]

### Option B: Full Resolution
**When to use**: Have time to properly fix
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. **Verify**: [How to confirm resolution]

### Option C: Rollback
**When to use**: Recent deployment suspected
1. Identify last good deployment: `kubectl rollout history deployment/api`
2. Rollback: `kubectl rollout undo deployment/api`
3. **Verify**: Error rate returning to normal

## Escalation

| Condition | Escalate To | Contact |
|-----------|-------------|---------|
| Not resolved in 15 min | Senior Engineer | @oncall-senior |
| Customer-facing P1 | Engineering Manager | @eng-manager |
| Data integrity risk | Database Team | @dba-oncall |

## Post-Incident

- [ ] Confirm service fully restored
- [ ] Document actual root cause
- [ ] Create ticket for permanent fix (if quick mitigation used)
- [ ] Update this runbook with learnings
- [ ] Schedule postmortem (if P1/P2)
