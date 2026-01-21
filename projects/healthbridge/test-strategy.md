# HealthBridge - Testing Strategy Document

## Executive Summary

This document defines the comprehensive testing strategy for HealthBridge, a HIPAA-compliant telemedicine platform. Given the healthcare context, testing must address not only functional correctness but also security, compliance, performance under load, and integration reliability with external healthcare systems.

---

## Test Pyramid

```
                              ┌─────────────────┐
                              │    E2E Tests    │
                              │    (5-10%)      │
                              │                 │
                              │  ~50 tests      │
                              │  Critical paths │
                              │  Patient + MD   │
                              │  journeys       │
                              └────────┬────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         │    Integration Tests      │
                         │         (20-30%)          │
                         │                           │
                         │  ~300 tests               │
                         │  API contracts            │
                         │  Service interactions     │
                         │  Database operations      │
                         │  External API mocks       │
                         └─────────────┬─────────────┘
                                       │
              ┌────────────────────────┴────────────────────────┐
              │                 Unit Tests                       │
              │                  (60-70%)                        │
              │                                                  │
              │  ~2000 tests                                     │
              │  Business logic                                  │
              │  Validation rules                                │
              │  Data transformations                            │
              │  Utility functions                               │
              │  Component rendering                             │
              └──────────────────────────────────────────────────┘
```

### Coverage Targets

| Test Level | Target Coverage | Minimum Acceptable | Focus Areas |
|------------|-----------------|-------------------|-------------|
| **Unit Tests** | 85% | 80% | Business logic, validators, transformers |
| **Integration Tests** | 70% | 60% | API endpoints, DB operations, service calls |
| **E2E Tests** | Critical paths | 100% of P0 flows | Patient booking, video visit, prescriptions |

### Coverage by Risk Level

| Risk Level | Coverage Target | Examples |
|------------|-----------------|----------|
| **Critical** | 95%+ | Auth, PHI access, prescriptions, payments |
| **High** | 85%+ | Video calls, scheduling, EHR sync |
| **Medium** | 75%+ | Notifications, reminders, preferences |
| **Low** | 60%+ | Admin dashboards, reports, settings |

---

## Testing by Component

### 1. Authentication & Authorization Testing

**Unit Tests**:
```typescript
describe('AuthService', () => {
  describe('MFA Verification', () => {
    it('should accept valid TOTP within time window');
    it('should reject expired TOTP codes');
    it('should lock account after 5 failed MFA attempts');
    it('should require MFA for all provider accounts');
  });

  describe('Session Management', () => {
    it('should expire patient sessions after 24 hours');
    it('should expire provider sessions after 8 hours');
    it('should invalidate all sessions on password change');
    it('should require re-auth for PHI access after inactivity');
  });

  describe('RBAC', () => {
    it('should deny patient access to other patient records');
    it('should allow provider access only to their patients');
    it('should restrict prescription creation to licensed providers');
  });
});
```

**Integration Tests**:
- Auth0 integration (mock in CI, real in staging)
- SSO flow with clinic identity providers
- Token refresh flow under concurrent requests
- Session invalidation across services

**Security Tests**:
- [ ] Brute force protection (rate limiting)
- [ ] JWT token tampering detection
- [ ] Session fixation prevention
- [ ] CSRF protection on state-changing endpoints
- [ ] Privilege escalation attempts

---

### 2. Video Service Testing (Daily.co)

**Unit Tests**:
```typescript
describe('VideoService', () => {
  describe('Room Management', () => {
    it('should create room with HIPAA-compliant settings');
    it('should generate time-limited access tokens');
    it('should enable recording only with patient consent');
    it('should delete room 24 hours after appointment');
  });

  describe('Waiting Room', () => {
    it('should hold patient until provider admits');
    it('should notify provider of waiting patient');
    it('should timeout waiting room after 30 minutes');
  });
});
```

**Integration Tests**:
```typescript
describe('Daily.co Integration', () => {
  it('should create room via Daily.co API');
  it('should handle Daily.co API rate limits');
  it('should receive and process webhook events');
  it('should store recording URLs securely');
});
```

**Video Quality Testing**:

| Metric | Target | Minimum | Test Method |
|--------|--------|---------|-------------|
| **Video latency** | <150ms | <300ms | WebRTC stats API |
| **Audio latency** | <100ms | <200ms | WebRTC stats API |
| **Frame rate** | 30fps | 15fps | Client metrics |
| **Connection time** | <3s | <5s | E2E timing |
| **Reconnect time** | <2s | <5s | Network simulation |

**Network Condition Testing**:
```
Test Matrix:
├── Bandwidth: 1Mbps, 3Mbps, 10Mbps, 50Mbps
├── Latency: 50ms, 100ms, 200ms, 500ms
├── Packet loss: 0%, 1%, 5%, 10%
└── Jitter: 10ms, 50ms, 100ms

Tools:
- Chrome DevTools network throttling
- tc (Linux traffic control) for server-side
- Daily.co quality dashboards
```

**Browser Compatibility Matrix**:

| Browser | Version | Desktop | Mobile | Priority |
|---------|---------|---------|--------|----------|
| Chrome | Latest 2 | Required | Required | P0 |
| Safari | Latest 2 | Required | Required (iOS) | P0 |
| Firefox | Latest 2 | Required | N/A | P1 |
| Edge | Latest 2 | Required | N/A | P1 |
| Samsung Internet | Latest | N/A | Best effort | P2 |

---

### 3. EHR Integration Testing (Redox + Epic)

**Mock Testing (CI/CD)**:
```typescript
describe('RedoxService', () => {
  describe('Patient Sync', () => {
    it('should map Redox patient to internal schema');
    it('should handle missing optional fields');
    it('should detect and merge duplicate patients');
    it('should queue failed syncs for retry');
  });

  describe('Appointment Sync', () => {
    it('should create appointment in Epic via Redox');
    it('should handle scheduling conflicts');
    it('should process appointment update webhooks');
    it('should handle cancelled appointment from EHR');
  });

  describe('Clinical Document Sync', () => {
    it('should format visit note as C-CDA');
    it('should push completed visit to Epic');
    it('should handle rejection from EHR');
  });
});
```

**Sandbox Testing (Staging)**:
- Redox provides sandbox environment
- Epic App Orchard sandbox access required
- Test with realistic HL7/FHIR payloads

**Integration Test Scenarios**:

| Scenario | Source | Destination | Validation |
|----------|--------|-------------|------------|
| Patient lookup | HealthBridge | Epic | Verify demographics match |
| New appointment | HealthBridge | Epic | Confirm in Epic sandbox |
| Visit complete | HealthBridge | Epic | Verify C-CDA document |
| Rx sent | HealthBridge | Surescripts | Pharmacy receipt |
| Patient update | Epic | HealthBridge | Webhook processed |

**Error Handling Tests**:
- [ ] Redox API timeout (30s)
- [ ] Invalid FHIR response
- [ ] Patient not found in EHR
- [ ] Duplicate appointment detection
- [ ] Credential expiration
- [ ] Rate limiting response

---

### 4. Prescription Service Testing (Surescripts)

**Unit Tests**:
```typescript
describe('PrescriptionService', () => {
  describe('Drug Interaction Check', () => {
    it('should flag severe interactions');
    it('should warn on moderate interactions');
    it('should check against current medications');
  });

  describe('Controlled Substance', () => {
    it('should require DEA number for controlled substances');
    it('should validate provider state license');
    it('should enforce EPCS authentication');
  });

  describe('Pharmacy Routing', () => {
    it('should lookup pharmacy by NCPDP ID');
    it('should format NCPDP SCRIPT message');
    it('should handle pharmacy rejection');
  });
});
```

**Integration Tests**:
- Surescripts certification environment
- EPCS (Electronic Prescribing of Controlled Substances) flow
- Medication history retrieval
- Refill request processing

---

### 5. Security Testing Requirements

#### OWASP Top 10 Testing

| Vulnerability | Test Approach | Tools |
|---------------|---------------|-------|
| **A01: Broken Access Control** | IDOR tests, privilege escalation | Manual + Burp Suite |
| **A02: Cryptographic Failures** | TLS config, key storage | testssl.sh, manual |
| **A03: Injection** | SQLi, XSS, Command injection | SQLMap, manual |
| **A04: Insecure Design** | Threat modeling review | Manual |
| **A05: Security Misconfiguration** | Headers, defaults, configs | Nmap, Nikto |
| **A06: Vulnerable Components** | Dependency scanning | Snyk, npm audit |
| **A07: Auth Failures** | Brute force, session tests | Manual + Burp |
| **A08: Software/Data Integrity** | CI/CD security, SBOM | Manual |
| **A09: Logging Failures** | Audit log completeness | Manual |
| **A10: SSRF** | Internal network access | Manual + Burp |

#### Automated Security Scanning

```yaml
# CI Pipeline Security Gates
security-scan:
  stage: security
  script:
    # Dependency vulnerabilities
    - npm audit --audit-level=high
    - snyk test --severity-threshold=high
    
    # Static analysis (SAST)
    - semgrep --config=p/owasp-top-ten
    - semgrep --config=p/security-audit
    
    # Secret detection
    - gitleaks detect --source=. --verbose
    
    # Container scanning
    - trivy image $IMAGE_NAME --severity HIGH,CRITICAL
    
  allow_failure: false
```

#### Penetration Testing Plan

**Scope**:
- External: Public APIs, web app, mobile apps
- Internal: Admin interfaces (VPN-only)
- Out of scope: Third-party vendors (Daily.co, Redox, Auth0)

**Schedule**:
- Pre-launch: Full penetration test (4 weeks before)
- Annual: Comprehensive pen test
- Quarterly: Automated vulnerability scan
- Continuous: Bug bounty program

**Vendor Requirements**:
- CREST or OSCP certified testers
- Healthcare experience preferred
- Must sign NDA + BAA
- Report within 1 week of completion

---

## Compliance Testing

### HIPAA Compliance Verification

#### Technical Safeguards Checklist

| Requirement | Test Method | Frequency |
|-------------|-------------|-----------|
| **Access Control** | RBAC audit, access log review | Monthly |
| **Audit Controls** | Log completeness check | Weekly |
| **Integrity Controls** | Data validation, checksums | Continuous |
| **Transmission Security** | TLS verification, cert check | Weekly |
| **Encryption** | Key rotation, algorithm check | Quarterly |

#### Administrative Safeguards Testing

| Requirement | Test Method | Frequency |
|-------------|-------------|-----------|
| **Workforce Training** | Quiz completion tracking | Annual |
| **Access Management** | User access review | Quarterly |
| **Security Incidents** | Tabletop exercises | Bi-annual |
| **Contingency Plans** | DR drills | Annual |
| **BAA Compliance** | Vendor audit | Annual |

#### PHI Access Audit Testing

```typescript
describe('HIPAA Audit Compliance', () => {
  describe('Audit Log Completeness', () => {
    it('should log every PHI view with user and timestamp');
    it('should log every PHI modification with before/after');
    it('should log all export/download of PHI');
    it('should log failed access attempts');
    it('should log authentication events');
  });

  describe('Audit Log Integrity', () => {
    it('should not allow modification of existing logs');
    it('should detect gaps in log sequence');
    it('should retain logs for 7 years minimum');
  });

  describe('Audit Reports', () => {
    it('should generate user access report by patient');
    it('should generate unusual access pattern report');
    it('should generate after-hours access report');
  });
});
```

### SOC 2 Type II Preparation

**Trust Service Criteria Testing**:

| Criteria | Key Controls | Test Approach |
|----------|--------------|---------------|
| **Security** | Access controls, encryption, monitoring | Pen test, config review |
| **Availability** | Uptime, DR, backups | DR drill, monitoring |
| **Processing Integrity** | Data validation, error handling | Functional testing |
| **Confidentiality** | Encryption, access control | Access audit |
| **Privacy** | Consent, data minimization | Privacy review |

---

## Quality Gates

### 1. PR Merge Requirements

```yaml
# Required checks before merge to main
pr-checks:
  required:
    - lint: pass
    - type-check: pass
    - unit-tests: pass (coverage >= 80%)
    - integration-tests: pass
    - security-scan: no HIGH/CRITICAL
    - build: success
    
  required_approvals: 2
  required_reviewers:
    - At least 1 from code-owners
    - Security team for auth/PHI changes
```

**Merge Criteria**:
- [ ] All CI checks pass
- [ ] 2 approving reviews
- [ ] No unresolved comments
- [ ] Security review for PHI-related changes
- [ ] Test coverage maintained or improved
- [ ] No TODO/FIXME in critical paths

### 2. Staging Deploy Requirements

```yaml
staging-gate:
  required:
    - all-pr-checks: pass
    - e2e-tests: pass (critical paths)
    - performance-baseline: no degradation > 10%
    - security-scan: no new vulnerabilities
    
  validations:
    - smoke-test: 5 minutes after deploy
    - api-health-check: all endpoints responding
    - video-test-call: successful connection
```

**Staging Validation Checklist**:
- [ ] All API endpoints responding
- [ ] Auth flow working (login, MFA, logout)
- [ ] Patient can book appointment
- [ ] Provider can start video visit
- [ ] EHR sync operational (Redox sandbox)
- [ ] No P0/P1 bugs from previous release

### 3. Production Deploy Requirements

```yaml
production-gate:
  required:
    - staging-validation: 48 hours minimum
    - e2e-suite: 100% pass
    - load-test: meets SLA targets
    - security-scan: clean
    - penetration-test: findings remediated (pre-launch)
    - compliance-review: approved
    
  approvals:
    - engineering-lead: required
    - security-team: required (for auth/PHI changes)
    - compliance-officer: required (for PHI changes)
    
  deployment:
    - method: blue-green
    - canary: 5% traffic for 1 hour
    - rollback-ready: instant via DNS switch
```

**Production Readiness Checklist**:
- [ ] All staging tests pass
- [ ] Load test results within SLA
- [ ] Security scan clean (no HIGH/CRITICAL)
- [ ] Penetration test findings resolved
- [ ] Runbook updated
- [ ] On-call team briefed
- [ ] Rollback procedure tested
- [ ] Monitoring dashboards configured
- [ ] Alerting thresholds set

---

## Performance Testing

### Video Quality Under Load

**Test Scenarios**:

| Scenario | Concurrent Calls | Duration | Success Criteria |
|----------|-----------------|----------|------------------|
| Normal load | 50 | 30 min | 99% call quality score > 4/5 |
| Peak load | 150 | 15 min | 95% call quality score > 4/5 |
| Stress test | 300 | 10 min | Graceful degradation, no crashes |
| Endurance | 100 | 4 hours | No memory leaks, stable quality |

**Quality Metrics**:
```
Call Quality Score (1-5):
├── Video: bitrate, frame rate, resolution
├── Audio: MOS score, jitter, packet loss
├── Connection: time to connect, reconnects
└── Overall: user-reported quality

Target Thresholds:
├── MOS Score: > 3.5 (Good)
├── Video bitrate: > 500kbps
├── Frame rate: > 15fps
├── Packet loss: < 2%
└── Jitter: < 30ms
```

### Concurrent Call Capacity

**Infrastructure Sizing Test**:

| Users | Calls | Server Config | Expected Result |
|-------|-------|---------------|-----------------|
| 200 (baseline) | 100 | 3x m6i.large | No issues |
| 400 | 200 | 3x m6i.large | Near capacity |
| 600 | 300 | 6x m6i.large | Horizontal scale |

**Daily.co Limits**:
- Standard plan: 1000 concurrent participants
- Enterprise plan: Custom limits (negotiate for 500+ concurrent)

### API Latency Requirements

| Endpoint Category | P50 Target | P95 Target | P99 Target |
|-------------------|------------|------------|------------|
| Auth endpoints | 100ms | 300ms | 500ms |
| Patient data | 150ms | 400ms | 800ms |
| Scheduling | 200ms | 500ms | 1000ms |
| Search | 300ms | 800ms | 1500ms |
| EHR sync (async) | N/A | N/A | N/A |

**Load Testing Tools**:
```yaml
tools:
  k6:
    purpose: API load testing
    scenarios:
      - constant-vus: 100 users, 10 min
      - ramping-vus: 0->200 users, 15 min
      - spike: 50->500->50 users, 5 min
      
  artillery:
    purpose: WebSocket load testing
    scenarios:
      - notification-storm: 1000 concurrent connections
      - presence-updates: 500 users, rapid status changes
      
  browserstack:
    purpose: Real device video testing
    matrix:
      - iOS Safari, Chrome Android
      - Various network conditions
```

**Load Test Schedule**:
- Pre-release: Full load test suite
- Weekly: Automated baseline test
- Monthly: Capacity planning test
- Quarterly: Stress test to breaking point

---

## Test Environment Requirements

### HIPAA-Compliant Test Environment

```
┌─────────────────────────────────────────────────────────────────┐
│                    Test Environment Architecture                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │   CI/CD Pipeline    │    │   Staging Env       │            │
│  │   (Ephemeral)       │    │   (Persistent)      │            │
│  │                     │    │                     │            │
│  │ • Synthetic data    │    │ • Synthetic data    │            │
│  │ • Mocked externals  │    │ • Sandbox APIs      │            │
│  │ • Isolated network  │    │ • HIPAA-compliant   │            │
│  │ • Auto-cleanup      │    │ • Encrypted         │            │
│  └─────────────────────┘    └─────────────────────┘            │
│                                                                  │
│  Access Controls:                                                │
│  • VPN required for staging                                     │
│  • MFA for all test environment access                          │
│  • No PHI in any test environment                               │
│  • Audit logging enabled                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### EHR Sandbox Access

| Vendor | Sandbox Type | Access Process | Limitations |
|--------|--------------|----------------|-------------|
| **Redox** | Cloud sandbox | API key (dev portal) | Rate limited |
| **Epic** | App Orchard sandbox | App registration required | Synthetic data only |
| **Surescripts** | Certification env | Partner agreement | Synthetic pharmacies |

**Sandbox Data**:
- Redox provides synthetic patient records
- Epic sandbox includes test patients with known conditions
- All data is clearly marked as synthetic

### Test Data Strategy

#### NO REAL PHI Policy

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEST DATA POLICY                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STRICTLY PROHIBITED:                                           │
│  ✗ Real patient names, DOBs, or SSNs                           │
│  ✗ Real medical record numbers (MRNs)                          │
│  ✗ Real addresses or phone numbers                             │
│  ✗ Real insurance information                                   │
│  ✗ Production database copies (even "anonymized")              │
│                                                                  │
│  ALLOWED:                                                        │
│  ✓ Synthetically generated test data                           │
│  ✓ Faker.js generated names/addresses                          │
│  ✓ Synthetic patient generators                                │
│  ✓ Clearly fake data (Test Patient, 123 Test St)              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Synthetic Data Generation

```typescript
// Test data factory example
import { faker } from '@faker-js/faker';

export const createSyntheticPatient = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  dateOfBirth: faker.date.birthdate({ min: 18, max: 90, mode: 'age' }),
  email: `test+${faker.string.uuid()}@healthbridge-test.com`,
  phone: faker.phone.number('555-###-####'), // Clearly fake prefix
  address: {
    line1: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    zipCode: faker.location.zipCode(),
  },
  mrn: `TEST-${faker.string.alphanumeric(8).toUpperCase()}`,
  insurance: {
    provider: 'Test Insurance Co',
    memberId: `TEST-${faker.string.numeric(10)}`,
  },
});

// Seed data for specific scenarios
export const testPatients = {
  diabetic: createSyntheticPatient({ conditions: ['diabetes'] }),
  elderly: createSyntheticPatient({ ageRange: [65, 90] }),
  pediatric: createSyntheticPatient({ ageRange: [0, 17] }),
  multipleConditions: createSyntheticPatient({ 
    conditions: ['hypertension', 'diabetes', 'asthma'] 
  }),
};
```

#### Test Data Lifecycle

| Environment | Data Persistence | Refresh Frequency | Cleanup |
|-------------|------------------|-------------------|---------|
| CI/CD | Ephemeral | Every run | Auto-delete |
| Dev | 7 days | Weekly | Automated |
| Staging | 30 days | Monthly | Automated |
| Performance | Per test | After test | Manual trigger |

---

## Test Automation Infrastructure

### CI/CD Pipeline

```yaml
# .gitlab-ci.yml (or GitHub Actions equivalent)
stages:
  - validate
  - build
  - test
  - security
  - deploy

unit-tests:
  stage: test
  script:
    - npm run test:unit -- --coverage
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

integration-tests:
  stage: test
  services:
    - postgres:14
    - redis:7
  script:
    - npm run test:integration
  artifacts:
    when: always
    reports:
      junit: test-results/junit.xml

e2e-tests:
  stage: test
  image: mcr.microsoft.com/playwright:latest
  script:
    - npm run test:e2e
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/

security-scan:
  stage: security
  script:
    - npm audit --audit-level=high
    - snyk test
    - semgrep --config=p/security-audit
  allow_failure: false
```

### Test Reporting

**Dashboards**:
- Test coverage trends (SonarQube or Codecov)
- Test execution time trends
- Flaky test tracking
- Security vulnerability trends

**Alerts**:
- Coverage drops below threshold
- Test suite takes >30 minutes
- Flaky test rate exceeds 5%
- New security vulnerabilities

---

## Testing Schedule

### Pre-Launch Testing Timeline

| Week | Activity | Owner | Deliverable |
|------|----------|-------|-------------|
| -12 | Test plan finalization | QA Lead | This document |
| -10 | Test environment setup | DevOps | Staging ready |
| -8 | Integration test automation | QA Team | 300+ tests |
| -6 | E2E test automation | QA Team | 50 critical paths |
| -5 | Security scan + remediation | Security | Clean scan |
| -4 | Penetration test | External vendor | Findings report |
| -3 | Pen test remediation | Dev Team | All critical fixed |
| -2 | Load testing | QA + DevOps | Performance report |
| -1 | UAT with pilot clinics | Product | Sign-off |
| 0 | Go-live | All | Launch |

### Ongoing Testing

| Frequency | Activity | Automation |
|-----------|----------|------------|
| Every PR | Unit + Integration + Security | Fully automated |
| Daily | E2E critical paths | Scheduled CI job |
| Weekly | Full E2E suite | Scheduled CI job |
| Weekly | Performance baseline | Scheduled CI job |
| Monthly | Full security scan | Scheduled + manual |
| Quarterly | Penetration test | External vendor |
| Annually | HIPAA compliance audit | External auditor |

---

## Appendix: Test Case Examples

### Critical Path E2E Tests

```typescript
// Patient booking flow
test('Patient can book video appointment with provider', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[data-testid=email]', testPatient.email);
  await page.fill('[data-testid=password]', testPatient.password);
  await page.click('[data-testid=login-button]');
  
  // Search for provider
  await page.click('[data-testid=book-appointment]');
  await page.fill('[data-testid=specialty-search]', 'Primary Care');
  await page.click('[data-testid=search-button]');
  
  // Select provider and time slot
  await page.click('[data-testid=provider-card]:first-child');
  await page.click('[data-testid=available-slot]:first-child');
  
  // Confirm booking
  await page.fill('[data-testid=reason]', 'Annual checkup');
  await page.click('[data-testid=confirm-booking]');
  
  // Verify confirmation
  await expect(page.locator('[data-testid=confirmation-message]'))
    .toContainText('Appointment confirmed');
});

// Video visit flow
test('Provider can conduct video visit and complete notes', async ({ page }) => {
  await loginAsProvider(page, testProvider);
  
  // Start scheduled visit
  await page.click('[data-testid=todays-appointments]');
  await page.click('[data-testid=start-visit]:first-child');
  
  // Wait for video connection
  await expect(page.locator('[data-testid=video-connected]'))
    .toBeVisible({ timeout: 10000 });
  
  // Complete visit notes
  await page.fill('[data-testid=chief-complaint]', 'Annual wellness visit');
  await page.fill('[data-testid=assessment]', 'Patient in good health');
  await page.fill('[data-testid=plan]', 'Continue current medications');
  
  // End visit
  await page.click('[data-testid=end-visit]');
  await page.click('[data-testid=sign-note]');
  
  // Verify completion
  await expect(page.locator('[data-testid=visit-status]'))
    .toContainText('Completed');
});
```

---

*Testing strategy complete. Ready for implementation.*
