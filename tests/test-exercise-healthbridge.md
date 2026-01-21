# Project Planning Exercise: HealthBridge

## Purpose
Test the updated Locus framework with a healthcare/compliance-heavy project to verify improvements in estimation, testing strategy, and operational readiness.

## Exercise Context

**Scenario**: A regional healthcare network wants to launch a telemedicine platform to expand access to care. You're leading the product team to build "HealthBridge" - a HIPAA-compliant video consultation platform.

**Budget**: $3.2M over 24 months
**Team Size**: 10 engineers, 2 designers, 2 PMs, 1 compliance officer
**Regulatory**: Must be HIPAA compliant before launch
**Market Deadline**: Pilot in 12 months, full launch in 18 months

---

## The Brief (User Input to Locus)

> "I want to build HealthBridge - a telemedicine platform for our healthcare network. Patients need to schedule video appointments with doctors, have secure consultations, get prescriptions sent to pharmacies, and access their visit summaries. Must be HIPAA compliant. We have 200 doctors across 15 clinics. Pilot launch in 12 months."

---

## Complexity Factors (What This Tests)

### 1. Regulatory/Compliance
- HIPAA compliance (PHI handling)
- State medical licensing verification
- E-prescribing regulations (EPCS)
- Audit logging requirements
- BAA with all vendors

### 2. Integration Heavy
- EHR integration (Epic, Cerner)
- Pharmacy networks (Surescripts)
- Payment processing (healthcare-specific)
- Insurance verification
- Video conferencing (Twilio, Vonage, or custom)

### 3. User Personas
- **Patient**: Schedule appointments, join video calls, view records
- **Doctor**: Conduct visits, prescribe, document
- **Clinic Admin**: Manage schedules, view utilization
- **Compliance Officer**: Audit logs, access reports

### 4. Technical Decisions Required
- Video platform: Build vs buy (Twilio, Daily.co, custom WebRTC)
- EHR integration: Direct vs middleware (Redox, Health Gorilla)
- Data storage: On-prem vs cloud (HIPAA-compliant)
- Authentication: Healthcare SSO, MFA requirements

### 5. Risks to Identify
- HIPAA compliance gaps (critical)
- EHR integration delays (high)
- Doctor adoption resistance (medium)
- Video quality issues (medium)
- State licensing complexity (high)

### 6. Operational Requirements
- 99.9% uptime for video calls
- HIPAA audit logging
- Disaster recovery with 4-hour RTO
- Penetration testing before launch
- SOC 2 Type II certification path

---

## Expected Improvements Over Previous Exercise

The updated framework should now produce:

1. **Estimation Validation**: Apply multipliers for:
   - External API integrations (EHR, pharmacy) = 1.5-2x
   - Security-sensitive work (HIPAA) = 1.3x
   - New technology (video infrastructure) = 2x

2. **Testing Strategy** (new requirement):
   - HIPAA compliance testing
   - Integration test strategy for EHR
   - Load testing for video infrastructure
   - Security/penetration testing plan

3. **Capacity Validation**:
   - Sprint capacity with focus factors
   - Buffer for compliance reviews

4. **Operational Readiness** (new requirement):
   - HIPAA audit logging setup
   - Incident response for PHI breaches
   - Disaster recovery plan
   - On-call procedures for 24/7 platform

---

## Grading Focus Areas

### A. Compliance Handling (New Category - 15 points)
- Did it identify HIPAA requirements?
- Did it plan for BAAs with vendors?
- Did it include compliance testing?
- Did it plan audit logging?

### B. Estimation Quality (Was weak - Now 25 points)
- Are integration estimates realistic (with multipliers)?
- Is compliance review time included?
- Are security testing cycles accounted for?

### C. Testing Strategy (New - 15 points)
- Is test strategy document produced?
- Does it cover compliance testing?
- Does it include security testing?
- Are quality gates defined?

### D. Operational Readiness (New - 15 points)
- Is ops readiness checklist complete?
- Is HIPAA incident response planned?
- Is disaster recovery documented?
- Are monitoring/alerting requirements defined?

### E. Standard Categories (30 points)
- Completeness (10)
- Prioritization (10)
- Practical applicability (10)

---

## Scoring Comparison

| Category | Previous Max | New Max |
|----------|--------------|---------|
| Completeness | 25 | 10 |
| Accuracy | 25 | - (split into Estimation + Compliance) |
| Estimation Quality | - | 25 |
| Compliance Handling | - | 15 |
| Testing Strategy | - | 15 |
| Operational Readiness | - | 15 |
| Prioritization | 20 | 10 |
| Practical Applicability | 20 | 10 |
| Communication | 10 | - (rolled into others) |
| **Total** | 100 | 100 |

---

## Success Criteria

The updated framework should score **88-95/100** on this exercise, demonstrating:
- Proper use of estimation multipliers
- Complete testing strategy document
- Complete operational readiness checklist
- Appropriate handling of compliance requirements
