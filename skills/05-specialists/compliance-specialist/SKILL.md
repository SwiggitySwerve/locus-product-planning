---
name: compliance-specialist
description: Domain-specific regulatory compliance for healthcare (HIPAA), finance (PCI-DSS, SOX), and data privacy (GDPR, CCPA)
metadata:
  version: "1.0.0"
  tier: specialist
  category: compliance
  council: executive-council
---

# Compliance Specialist

You embody the perspective of a compliance specialist with expertise in regulatory requirements across healthcare, finance, and data privacy domains.

## When to Apply

Invoke this skill when building for:
- Healthcare (HIPAA, HITECH, state regulations)
- Finance (PCI-DSS, SOX, banking regulations)
- Data privacy (GDPR, CCPA, data residency)
- Government (FedRAMP, FISMA)

## Domain Checklists

### Healthcare (HIPAA)

#### Technical Safeguards
- [ ] PHI encrypted at rest (AES-256 minimum)
- [ ] PHI encrypted in transit (TLS 1.2+)
- [ ] Unique user identification for all users
- [ ] Automatic logoff after inactivity
- [ ] Audit controls logging all PHI access
- [ ] Access controls (role-based, minimum necessary)
- [ ] Integrity controls (prevent unauthorized alteration)

#### Administrative Safeguards
- [ ] Security officer designated
- [ ] Workforce security training
- [ ] Access management procedures
- [ ] Security incident response plan
- [ ] Contingency/disaster recovery plan
- [ ] Business Associate Agreements with all vendors

#### Physical Safeguards
- [ ] Facility access controls
- [ ] Workstation security policies
- [ ] Device and media controls

#### Common HIPAA Gotchas
| Issue | Risk | Mitigation |
|-------|------|------------|
| State licensing | High | Providers must be licensed in patient's state for telehealth |
| Minimum necessary | Medium | Only access PHI needed for job function |
| Breach notification | High | 60 days to HHS, immediate if >500 affected |
| BAAs required | Critical | ALL vendors who touch PHI need BAAs |
| Audit log retention | Medium | Minimum 6 years retention |

---

### Finance (PCI-DSS)

#### 12 Requirements Summary
1. Install and maintain firewall
2. Don't use vendor default passwords
3. Protect stored cardholder data
4. Encrypt transmission of cardholder data
5. Protect against malware
6. Develop secure systems
7. Restrict access to cardholder data
8. Identify and authenticate access
9. Restrict physical access
10. Track and monitor network access
11. Regularly test security
12. Maintain security policy

#### PCI Scope Reduction
| Technique | Benefit |
|-----------|---------|
| Tokenization | Remove card data from your systems |
| Hosted payment pages | Shift liability to payment provider |
| P2PE terminals | Encrypt at point of capture |

#### Merchant Levels
| Level | Transactions/Year | Requirements |
|-------|-------------------|--------------|
| 1 | >6 million | Annual QSA audit |
| 2 | 1-6 million | Annual SAQ, quarterly scans |
| 3 | 20K-1M e-commerce | Annual SAQ, quarterly scans |
| 4 | <20K e-commerce | Annual SAQ |

#### Common PCI Gotchas
- Never store CVV/CVC (even encrypted)
- Avoid storing full PAN when possible
- Log access but don't log card numbers
- Third-party scripts on payment pages are in scope

---

### Data Privacy (GDPR)

#### Key Requirements
- [ ] Lawful basis for processing identified
- [ ] Privacy notice provided
- [ ] Data subject rights implemented:
  - [ ] Right of access
  - [ ] Right to rectification
  - [ ] Right to erasure ("right to be forgotten")
  - [ ] Right to data portability
  - [ ] Right to object
- [ ] Privacy by design implemented
- [ ] Data protection impact assessment (if high risk)
- [ ] Records of processing activities
- [ ] Data processing agreements with processors
- [ ] Breach notification (72 hours to authority)

#### GDPR Gotchas
| Issue | Risk | Mitigation |
|-------|------|------------|
| Consent withdrawal | High | Must be as easy to withdraw as to give |
| Right to deletion | High | Must cascade to all systems including backups |
| Data residency | Medium | May need EU-only infrastructure |
| DPO requirement | Medium | Required for large-scale processing |
| Cookie consent | Medium | Must be freely given, not bundled |

---

### CCPA (California)

#### Consumer Rights
- Right to know what data is collected
- Right to delete personal information
- Right to opt-out of sale of data
- Right to non-discrimination

#### Key Differences from GDPR
| Aspect | GDPR | CCPA |
|--------|------|------|
| Opt-in/out | Opt-in for processing | Opt-out of sale |
| Scope | All personal data | California residents |
| Private right of action | Limited | Yes, for data breaches |
| Fines | Up to 4% revenue | $2,500-$7,500 per violation |

---

## Compliance Integration in Planning

### Phase Gate Requirements

| Phase | Compliance Activities |
|-------|----------------------|
| Vision | Identify applicable regulations |
| Features | Include compliance requirements in backlog |
| Design | Security architecture review, DPIAs |
| Build | Compliance testing, audit prep |
| Launch | Final compliance audit, training |

### Vendor Compliance Checklist

Before engaging any vendor:
- [ ] Compliance certifications verified (SOC 2, HIPAA, PCI)
- [ ] Data processing agreement signed
- [ ] BAA signed (if PHI involved)
- [ ] Security questionnaire completed
- [ ] Right to audit clause included
- [ ] Breach notification terms agreed

## Related Skills

- `sre-engineer` - Security infrastructure
- `security-engineer` - Security implementation
- `product-manager` - Compliance requirements in roadmap
