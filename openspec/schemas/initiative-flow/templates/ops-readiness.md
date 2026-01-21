---
status: draft
created: ${DATE}
author: null
---

# Operational Readiness: ${TITLE}

## Overview

<!-- Brief description of operational requirements for this initiative -->

## Readiness Level

**Target Level**: [ ] L1 - Experimental | [ ] L2 - Standard | [ ] L3 - Critical

| Level | Requirements |
|-------|--------------|
| L1 | Basic monitoring |
| L2 | Full observability, alerts, runbooks |
| L3 | L2 + chaos testing, DR tested |

## Monitoring

### Application Metrics

| Metric | Type | Alert Threshold | Dashboard |
|--------|------|-----------------|-----------|
| request_count | Counter | N/A | Yes |
| request_latency | Histogram | p99 > Xms | Yes |
| error_rate | Gauge | > Y% | Yes |
| | | | |

### Business Metrics

| Metric | Description | Alert? |
|--------|-------------|--------|
| | | |

### Dashboards

- [ ] Service health dashboard created
- [ ] Business metrics dashboard created
- [ ] Link: <!-- dashboard URL -->

## Alerting

| Alert Name | Condition | Severity | Routing | Runbook |
|------------|-----------|----------|---------|---------|
| | | | | |

### Escalation Path

1. L1: On-call engineer (PagerDuty)
2. L2: Team lead (after 15 min)
3. L3: Engineering Manager (after 30 min)
4. L4: CTO (critical outages only)

## Logging

### Log Format

```json
{
  "timestamp": "ISO8601",
  "level": "info|warn|error",
  "service": "service-name",
  "traceId": "correlation-id",
  "message": "Human readable message",
  "context": {}
}
```

### Log Retention

| Log Type | Retention | Storage |
|----------|-----------|---------|
| Application | 30 days | CloudWatch/Datadog |
| Audit | 1 year | S3 |
| Debug | 7 days | Local only |

## Runbooks

### Common Issues

| Issue | Symptoms | Resolution | Link |
|-------|----------|------------|------|
| | | | |

### Incident Response

1. Acknowledge alert
2. Check dashboard for scope
3. Follow runbook for issue type
4. Escalate if not resolved in 15 min
5. Post-incident review

## Deployment

### Deployment Procedure

1. [ ] Create PR with changes
2. [ ] Pass CI checks
3. [ ] Deploy to staging
4. [ ] Run smoke tests
5. [ ] Deploy to production (canary)
6. [ ] Monitor for 15 minutes
7. [ ] Full rollout

### Rollback Procedure

1. [ ] Identify issue requiring rollback
2. [ ] Run: `<!-- rollback command -->`
3. [ ] Verify rollback successful
4. [ ] Notify team
5. [ ] Create incident ticket

### Rollback Time Target: < 5 minutes

## Scaling

| Component | Current Capacity | Scaling Trigger | Scaling Action |
|-----------|------------------|-----------------|----------------|
| | | | |

### Auto-scaling Configuration

```yaml
# Example HPA configuration
minReplicas: 2
maxReplicas: 10
targetCPUUtilization: 70%
```

## Disaster Recovery

### Backup Strategy

| Data | Backup Frequency | Retention | Recovery Time |
|------|------------------|-----------|---------------|
| Database | | | |
| Files | | | |

### Recovery Procedures

- [ ] DR procedure documented
- [ ] DR tested on: <!-- date -->
- [ ] RTO: <!-- target -->
- [ ] RPO: <!-- target -->

## Cost Estimate

| Resource | Quantity | Monthly Cost |
|----------|----------|-------------|
| Compute | | |
| Database | | |
| Storage | | |
| Network | | |
| Monitoring | | |
| **Total** | | |

## Checklist

### Before Launch

- [ ] All L2 requirements met (or L1/L3 as appropriate)
- [ ] Monitoring configured and verified
- [ ] Alerts configured and tested
- [ ] Runbooks written and reviewed
- [ ] Deployment procedure tested
- [ ] Rollback procedure tested
- [ ] On-call team briefed
- [ ] Cost estimate approved

---
