# Locus Framework Improvement List - Version 2

Based on grading both TeamFlow (82/100) and HealthBridge (91/100) exercises, this document identifies remaining gaps to reach 95+ scores.

---

## Gap Analysis Summary

### Gaps Identified Across Both Exercises

| Gap | TeamFlow | HealthBridge | Category |
|-----|----------|--------------|----------|
| Vendor evaluation process | ❌ Missing | ❌ Missing | Design |
| Test data strategy | ❌ Missing | ⚠️ Mentioned only | Testing |
| Runbook templates | ❌ Missing | ⚠️ Referenced only | Operations |
| Domain-specific compliance | N/A | ⚠️ Missed state licensing | Compliance |
| Migration/transition planning | ❌ Missing | ❌ Missing | Product |
| Documentation planning | ❌ Missing | ❌ Missing | Product |
| Support/training planning | ❌ Missing | ❌ Missing | Product |
| Cost estimation detail | ⚠️ Basic | ⚠️ Basic | Operations |
| Accessibility planning | ❌ Missing | ❌ Missing | Design |
| Feature flag strategy | ❌ Missing | ❌ Missing | Engineering |
| Technical debt tracking | ⚠️ Mentioned | ⚠️ Mentioned | Engineering |
| Stakeholder communication plan | ❌ Missing | ❌ Missing | Product |

---

## Priority 1: High-Impact Gaps (4-6 points each)

### 1.1 Add Vendor Evaluation to Tech Lead / Architect

**Problem**: Both exercises mentioned vendors (Twilio, Daily.co, Yjs, Redox) but no systematic evaluation documented.

**Files to Update**:
- `skills/03-engineering-leadership/tech-lead/SKILL.md`
- `skills/03-engineering-leadership/principal-engineer/SKILL.md`

**Add Section**:
```markdown
## Vendor/Technology Evaluation

### When to Evaluate
- Any new external dependency
- Build vs buy decisions
- Platform/framework choices

### Evaluation Template

| Criterion | Weight | Vendor A | Vendor B | Build |
|-----------|--------|----------|----------|-------|
| **Functionality** |||||
| Core feature fit | 25% | | | |
| API quality | 10% | | | |
| **Reliability** |||||
| Uptime SLA | 15% | | | |
| Support responsiveness | 5% | | | |
| **Cost** |||||
| Pricing model | 15% | | | |
| Scale economics | 10% | | | |
| **Risk** |||||
| Vendor stability | 10% | | | |
| Lock-in risk | 5% | | | |
| Exit strategy | 5% | | | |

### Required Documentation
For any vendor selection, ADR must include:
1. Evaluation criteria and weights
2. At least 2 alternatives considered
3. Proof of concept results (if applicable)
4. Contract/pricing summary
5. Exit strategy if vendor fails
```

---

### 1.2 Add Test Data Strategy to QA Expert

**Problem**: "Synthetic data" mentioned but no strategy for generating realistic test data.

**File to Update**: `skills/04-developer-specializations/quality/qa-expert/SKILL.md`

**Add Section**:
```markdown
## Test Data Strategy

### Data Categories

| Category | Strategy | Tools | Considerations |
|----------|----------|-------|----------------|
| **Unit Tests** | Factories | Faker.js, Factory Bot | Fast, deterministic |
| **Integration** | Fixtures + Factories | Seed scripts | Referential integrity |
| **E2E** | Seeded database | DB snapshots | Reset between runs |
| **Performance** | Generated at scale | Custom scripts | Realistic volumes |
| **Compliance** | Anonymized production | Data masking tools | NO real PII/PHI |

### Test Data Requirements Document

Every test strategy should specify:

```markdown
## Test Data Requirements

### Volume Requirements
| Entity | Unit Tests | Integration | E2E | Load Test |
|--------|------------|-------------|-----|-----------|
| Users | 10 | 100 | 1,000 | 100,000 |
| [Entity] | | | | |

### Data Generation Approach
- [ ] Factories defined for all entities
- [ ] Seed scripts for integration environment
- [ ] Anonymization rules for any production data
- [ ] Data refresh schedule

### Sensitive Data Handling
- [ ] NO production PII/PHI in any test environment
- [ ] Synthetic data generators for sensitive fields
- [ ] Data masking rules documented
- [ ] Compliance officer sign-off (if regulated industry)

### Edge Cases to Generate
- [ ] Boundary values
- [ ] Unicode/i18n characters
- [ ] Large payloads
- [ ] Invalid/malformed data
```

### Data Generation Tools by Domain

| Domain | Recommended Tools |
|--------|-------------------|
| General | Faker.js, Chance.js |
| Healthcare | Synthea, FHIR test data |
| Financial | ISO 20022 test generators |
| E-commerce | Mockaroo, custom scripts |
```

---

### 1.3 Add Runbook Templates to SRE Engineer

**Problem**: Ops-readiness references runbooks but doesn't provide templates.

**File to Update**: `skills/04-developer-specializations/infrastructure/sre-engineer/SKILL.md`

**Add Section**:
```markdown
## Runbook Requirements

### Runbook Template

```markdown
# Runbook: [Issue Name]

## Metadata
- **Severity**: P1/P2/P3/P4
- **On-Call Responsibility**: Yes/No
- **Last Updated**: [Date]
- **Author**: [Name]

## Symptoms
- [ ] [Observable symptom 1]
- [ ] [Observable symptom 2]

## Impact
- Users affected: [Scope]
- Business impact: [Description]

## Diagnosis Steps

### Step 1: Check [Component]
```bash
# Command to run
```
**Expected output**: [What normal looks like]
**If abnormal**: Go to Step 2

### Step 2: Check [Next Component]
...

## Resolution Steps

### Option A: [Quick Fix]
1. [Step 1]
2. [Step 2]
3. Verify: [How to confirm fix]

### Option B: [Full Resolution]
1. [Step 1]
...

## Escalation
- If not resolved in [X] minutes, escalate to [Team/Person]
- Page: [Contact method]

## Post-Incident
- [ ] Confirm service restored
- [ ] Update monitoring if needed
- [ ] Schedule postmortem if P1/P2
```

### Required Runbooks for Launch

| Runbook | Priority | Owner |
|---------|----------|-------|
| Service down (complete outage) | P1 | SRE |
| High error rate | P1 | SRE |
| Database connection issues | P1 | SRE |
| Third-party integration failure | P2 | Backend |
| High latency | P2 | SRE |
| Certificate expiration | P2 | DevOps |
| Disk space low | P3 | DevOps |
| Memory leak suspected | P3 | Backend |
```

---

### 1.4 Add Migration Planning to Product Manager

**Problem**: Neither exercise addressed how to migrate existing users/data or transition from current systems.

**File to Update**: `skills/02-product-management/product-manager/SKILL.md`

**Add Section**:
```markdown
## Migration & Transition Planning

### When Migration Planning is Required
- Replacing existing system
- Migrating users from competitor
- Major version upgrade with breaking changes
- Data model changes affecting existing data

### Migration Planning Template

```markdown
## Migration Plan: [From] → [To]

### Scope
- Users affected: [Count]
- Data to migrate: [Types and volumes]
- Timeline: [Start] to [End]

### Migration Strategy

| Strategy | When to Use |
|----------|-------------|
| **Big Bang** | Small user base, can afford downtime |
| **Phased** | Large user base, feature-by-feature |
| **Parallel Run** | Critical systems, need fallback |
| **Strangler** | Legacy replacement, gradual |

**Selected Strategy**: [Choice with rationale]

### Data Migration

| Data Type | Source | Target | Transformation | Validation |
|-----------|--------|--------|----------------|------------|
| | | | | |

### Rollback Plan
- Trigger: [What would cause rollback]
- Procedure: [Steps]
- Data recovery: [How to restore]

### Communication Plan
| Audience | Message | Channel | Timing |
|----------|---------|---------|--------|
| End users | [What they need to know] | | |
| Support team | [Training needs] | | |
| Stakeholders | [Status updates] | | |

### Success Criteria
- [ ] [Metric 1]
- [ ] [Metric 2]
```
```

---

## Priority 2: Medium-Impact Gaps (2-3 points each)

### 2.1 Add Documentation Planning to Product Manager

**Problem**: No planning for user documentation, API docs, training materials.

**File to Update**: `skills/02-product-management/product-manager/SKILL.md`

**Add Section**:
```markdown
## Documentation Planning

### Documentation Types

| Type | Audience | Owner | Timeline |
|------|----------|-------|----------|
| User guides | End users | Tech Writer | Before launch |
| API documentation | Developers | Backend team | With each endpoint |
| Admin guides | Operators | SRE team | Before launch |
| Training materials | Support/Sales | PM + Training | Before launch |
| Architecture docs | Engineers | Tech Lead | Ongoing |

### Documentation Checklist

Before launch, verify:
- [ ] User onboarding guide
- [ ] FAQ / Knowledge base articles
- [ ] API reference (if applicable)
- [ ] Admin/operations guide
- [ ] Troubleshooting guide
- [ ] Video tutorials (if applicable)
- [ ] Release notes process defined
```

---

### 2.2 Add Accessibility Requirements to Frontend Developer

**Problem**: Neither exercise mentioned WCAG compliance or accessibility testing.

**File to Update**: `skills/04-developer-specializations/core/frontend-developer/SKILL.md`

**Add Section**:
```markdown
## Accessibility Requirements

### WCAG 2.1 Compliance Levels

| Level | Requirement | Target |
|-------|-------------|--------|
| A | Minimum | Required for all projects |
| AA | Standard | Required for public-facing |
| AAA | Enhanced | Required for government/healthcare |

### Accessibility Checklist

#### Perceivable
- [ ] All images have alt text
- [ ] Videos have captions
- [ ] Color is not the only indicator
- [ ] Text has sufficient contrast (4.5:1 minimum)

#### Operable
- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Skip links for navigation
- [ ] Focus indicators visible

#### Understandable
- [ ] Language declared
- [ ] Consistent navigation
- [ ] Error messages are clear
- [ ] Labels for form inputs

#### Robust
- [ ] Valid HTML
- [ ] ARIA used correctly
- [ ] Works with screen readers

### Testing Tools
- axe DevTools (automated)
- WAVE (browser extension)
- VoiceOver/NVDA (manual screen reader testing)
- Keyboard-only navigation testing

### Include in Sprint Planning
- Accessibility review: 2-4 hours per major feature
- Screen reader testing: 1-2 hours per release
```

---

### 2.3 Add Feature Flag Strategy to Tech Lead

**Problem**: No strategy for gradual rollouts or feature toggles.

**File to Update**: `skills/03-engineering-leadership/tech-lead/SKILL.md`

**Add Section**:
```markdown
## Feature Flag Strategy

### When to Use Feature Flags

| Scenario | Flag Type | Lifetime |
|----------|-----------|----------|
| Gradual rollout | Release flag | Days-weeks |
| A/B testing | Experiment flag | Weeks |
| Kill switch | Ops flag | Permanent |
| Premium features | Permission flag | Permanent |
| Unfinished work | Development flag | Days |

### Feature Flag Requirements

For any flagged feature:
```markdown
## Feature Flag: [flag_name]

**Type**: Release / Experiment / Ops / Permission
**Owner**: [Team/Person]
**Created**: [Date]
**Expected Removal**: [Date or "Permanent"]

**Rollout Plan**:
- [ ] 1% - Internal testing
- [ ] 10% - Beta users
- [ ] 50% - Half of production
- [ ] 100% - Full rollout
- [ ] Flag removed

**Rollback Trigger**: [What would cause rollback]
**Metrics to Watch**: [What indicates success/failure]
```

### Flag Hygiene
- Review flags monthly
- Remove release flags within 30 days of 100% rollout
- Document permanent flags
- Test both flag states
```

---

### 2.4 Add Technical Debt Tracking to Tech Lead

**Problem**: Technical debt mentioned but not systematically tracked.

**File to Update**: `skills/03-engineering-leadership/tech-lead/SKILL.md`

**Enhance Existing Section**:
```markdown
## Technical Debt Tracking

### Debt Register Template

| ID | Description | Type | Interest Rate | Payback Cost | Priority |
|----|-------------|------|---------------|--------------|----------|
| TD-001 | [Description] | [Type] | High/Med/Low | [Hours] | [P1-P4] |

### Debt Types

| Type | Examples | Typical Interest |
|------|----------|------------------|
| **Code** | Duplication, poor naming, missing tests | Medium |
| **Architecture** | Wrong patterns, scaling limits | High |
| **Infrastructure** | Manual processes, outdated deps | Medium |
| **Documentation** | Missing/outdated docs | Low |
| **Test** | Low coverage, flaky tests | Medium |

### Debt Budget

Allocate technical debt payback in each sprint:
- 10-15% of sprint capacity for debt payback
- Track debt added vs paid down
- Escalate if debt is growing faster than payback

### Sprint Debt Review

Each sprint planning should include:
- [ ] Review debt register
- [ ] Select 1-2 debt items for payback
- [ ] Estimate interest saved
- [ ] Update register with new debt from last sprint
```

---

### 2.5 Add Cost Estimation to DevOps/Cloud Architect

**Problem**: Infrastructure costs mentioned but not systematically estimated.

**File to Update**: `skills/04-developer-specializations/infrastructure/cloud-architect/SKILL.md`

**Add Section**:
```markdown
## Infrastructure Cost Estimation

### Cost Estimation Template

```markdown
## Infrastructure Cost Estimate: [Project]

### Compute
| Service | Spec | Quantity | Monthly Cost |
|---------|------|----------|--------------|
| API servers | t3.large | 3 | $XXX |
| Workers | t3.medium | 2 | $XXX |

### Database
| Service | Spec | Storage | Monthly Cost |
|---------|------|---------|--------------|
| RDS | db.r5.large | 100GB | $XXX |
| Redis | cache.r5.large | - | $XXX |

### Storage & CDN
| Service | Volume | Monthly Cost |
|---------|--------|--------------|
| S3 | 500GB | $XXX |
| CloudFront | 1TB transfer | $XXX |

### Monitoring & Logging
| Service | Monthly Cost |
|---------|--------------|
| DataDog | $XXX |
| CloudWatch | $XXX |

### Third-Party Services
| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Auth0 | Pro | $XXX |
| Twilio | Pay-as-you-go | $XXX |

### Summary
| Category | Monthly | Annual |
|----------|---------|--------|
| Compute | $XXX | $XXX |
| Database | $XXX | $XXX |
| Storage | $XXX | $XXX |
| Monitoring | $XXX | $XXX |
| Third-Party | $XXX | $XXX |
| **Total** | $XXX | $XXX |

### Scaling Projections
| Users | Monthly Cost | Notes |
|-------|--------------|-------|
| 1,000 | $XXX | Current |
| 10,000 | $XXX | +X% |
| 100,000 | $XXX | +Y% |
```

### Cost Optimization Checklist
- [ ] Right-sized instances
- [ ] Reserved instances for baseline load
- [ ] Spot instances for batch work
- [ ] Storage lifecycle policies
- [ ] CDN for static assets
```

---

## Priority 3: Domain-Specific Additions

### 3.1 Create Compliance Specialist Skill

**Problem**: Domain-specific compliance (healthcare, fintech, etc.) not systematically addressed.

**New File**: `skills/05-specialists/compliance-specialist/SKILL.md`

```markdown
---
name: compliance-specialist
description: Domain-specific regulatory compliance for healthcare (HIPAA), finance (PCI-DSS, SOX), and data privacy (GDPR, CCPA)
metadata:
  version: "1.0.0"
  tier: specialist
  category: compliance
---

# Compliance Specialist

## When to Apply

Invoke this skill when building for:
- Healthcare (HIPAA, HITECH, state regulations)
- Finance (PCI-DSS, SOX, banking regulations)
- Data privacy (GDPR, CCPA, data residency)
- Government (FedRAMP, FISMA)

## Domain Checklists

### Healthcare (HIPAA)

#### Technical Safeguards
- [ ] PHI encrypted at rest (AES-256)
- [ ] PHI encrypted in transit (TLS 1.2+)
- [ ] Unique user identification
- [ ] Automatic logoff
- [ ] Audit controls
- [ ] Access controls (RBAC)

#### Administrative Safeguards
- [ ] Security officer designated
- [ ] Workforce training
- [ ] Access management procedures
- [ ] Incident response plan
- [ ] Business Associate Agreements

#### Physical Safeguards
- [ ] Facility access controls
- [ ] Workstation security
- [ ] Device controls

#### Compliance Gotchas
- **State licensing**: Providers must be licensed in patient's state
- **Minimum necessary**: Only access PHI needed for job function
- **Breach notification**: 60 days to HHS, immediate to patients if >500 affected
- **BAAs required**: With ALL vendors who touch PHI

### Finance (PCI-DSS)

#### Requirements
- [ ] Secure network (firewalls, no default passwords)
- [ ] Protect cardholder data (encryption, masking)
- [ ] Vulnerability management (updates, antivirus)
- [ ] Access control (need-to-know, unique IDs)
- [ ] Monitoring (logging, testing)
- [ ] Security policy (documented, maintained)

#### Compliance Gotchas
- **Scope reduction**: Use tokenization to reduce PCI scope
- **SAQ levels**: Know your merchant level (1-4)
- **QSA audits**: Required for Level 1 merchants
- **PAN storage**: Never store CVV, avoid storing full PAN

### Data Privacy (GDPR)

#### Requirements
- [ ] Lawful basis for processing
- [ ] Data subject rights (access, deletion, portability)
- [ ] Privacy by design
- [ ] Data protection impact assessment
- [ ] Breach notification (72 hours)
- [ ] Data processing agreements

#### Compliance Gotchas
- **Consent**: Must be freely given, specific, informed
- **Right to deletion**: Must cascade to all systems
- **Data residency**: May need EU-only infrastructure
- **DPO required**: For large-scale processing
```

---

### 3.2 Add Support/Training Planning to Product Manager

**Problem**: No planning for support team readiness or user training.

**File to Update**: `skills/02-product-management/product-manager/SKILL.md`

**Add Section**:
```markdown
## Support & Training Planning

### Support Readiness Checklist

Before launch:
- [ ] Support team trained on product
- [ ] Knowledge base articles written
- [ ] Escalation paths defined
- [ ] SLA targets established
- [ ] Support tooling configured (Zendesk, Intercom, etc.)
- [ ] Canned responses for common issues

### Support Tiers

| Tier | Handled By | Response Time | Examples |
|------|------------|---------------|----------|
| L1 | Support agents | < 4 hours | Password reset, how-to questions |
| L2 | Senior support | < 8 hours | Configuration issues, bugs |
| L3 | Engineering | < 24 hours | Complex bugs, data issues |

### Training Requirements

| Audience | Training Type | Materials | Owner |
|----------|---------------|-----------|-------|
| End users | Self-service | Videos, guides | PM |
| Support team | Instructor-led | Runbooks, product deep-dive | PM |
| Sales team | Demo training | Pitch deck, demo scripts | PM |
| Partners | Certification | Training portal | PM |

### Knowledge Base Structure

```
/help
  /getting-started
    - Quick start guide
    - Account setup
    - First [action]
  /features
    - [Feature 1] guide
    - [Feature 2] guide
  /troubleshooting
    - Common issues
    - Error messages
  /billing
    - Plans and pricing
    - Payment methods
  /api (if applicable)
    - Authentication
    - Endpoints
    - Rate limits
```
```

---

## Priority 4: New Templates

### 4.1 Vendor Evaluation Template

**New File**: `openspec/schemas/initiative-flow/templates/vendor-evaluation.md`

### 4.2 Runbook Template

**New File**: `openspec/schemas/initiative-flow/templates/runbook.md`

### 4.3 Migration Plan Template

**New File**: `openspec/schemas/initiative-flow/templates/migration-plan.md`

### 4.4 Cost Estimate Template

**New File**: `openspec/schemas/initiative-flow/templates/cost-estimate.md`

---

## Summary: Files to Update/Create

### Updates (10 files)

| File | Key Additions |
|------|---------------|
| `tech-lead/SKILL.md` | Vendor evaluation, feature flags, debt tracking |
| `qa-expert/SKILL.md` | Test data strategy |
| `sre-engineer/SKILL.md` | Runbook templates |
| `product-manager/SKILL.md` | Migration planning, documentation, support |
| `frontend-developer/SKILL.md` | Accessibility requirements |
| `cloud-architect/SKILL.md` | Cost estimation |
| `principal-engineer/SKILL.md` | Vendor evaluation (shared with tech-lead) |

### New Files (5)

| File | Purpose |
|------|---------|
| `compliance-specialist/SKILL.md` | Domain-specific compliance (HIPAA, PCI, GDPR) |
| `vendor-evaluation.md` template | Systematic vendor comparison |
| `runbook.md` template | Standard runbook format |
| `migration-plan.md` template | Migration planning structure |
| `cost-estimate.md` template | Infrastructure cost breakdown |

---

## Implementation Priority

| Week | Focus | Expected Score Impact |
|------|-------|----------------------|
| 1 | Vendor evaluation, Test data strategy | +2 points |
| 2 | Runbook templates, Migration planning | +2 points |
| 3 | Accessibility, Feature flags, Debt tracking | +2 points |
| 4 | Compliance specialist, Documentation planning | +2 points |
| 5 | Cost estimation, Support planning, Templates | +1 point |

**Expected Final Score**: 95-97/100 (A/A+)

---

## Validation Checklist

After implementing these updates, re-run both exercises and verify:

- [ ] Vendor evaluation appears in Design phase
- [ ] Test data strategy detailed in test-strategy.md
- [ ] Runbooks include templates, not just references
- [ ] Migration plan included (if applicable to exercise)
- [ ] Accessibility requirements mentioned in design
- [ ] Feature flag strategy documented
- [ ] Technical debt tracking visible in sprint plan
- [ ] Cost estimates detailed with scaling projections
- [ ] Documentation plan included
- [ ] Support readiness addressed
