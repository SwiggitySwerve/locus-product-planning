# HealthBridge - Technical Design Document

## Executive Summary

HealthBridge is a HIPAA-compliant telemedicine platform enabling video consultations, scheduling, e-prescribing, and EHR integration for a regional healthcare network with 200 doctors across 15 clinics serving thousands of patients.

---

## Architecture Overview

```
                        ┌─────────────────────────────────────────────────────────────────────┐
                        │                           CLIENTS                                    │
                        │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
                        │  │   Web App    │  │  iOS App     │  │ Android App  │              │
                        │  │  (React/TS)  │  │ (React Nat.) │  │ (React Nat.) │              │
                        │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
                        └─────────┼─────────────────┼─────────────────┼───────────────────────┘
                                  │                 │                 │
                                  └─────────────────┼─────────────────┘
                                                    │ HTTPS/WSS (TLS 1.3)
                        ┌───────────────────────────┴────────────────────────────────────────┐
                        │                      WAF / DDoS PROTECTION                          │
                        │                    (AWS Shield + WAF Rules)                         │
                        └───────────────────────────┬────────────────────────────────────────┘
                                                    │
                        ┌───────────────────────────┴────────────────────────────────────────┐
                        │                      API GATEWAY (Kong)                             │
                        │  • Rate limiting (per-user, per-clinic)                            │
                        │  • JWT validation                                                   │
                        │  • Request/response logging (audit trail)                          │
                        │  • API versioning (/v1/, /v2/)                                     │
                        └───────────────────────────┬────────────────────────────────────────┘
                                                    │
              ┌─────────────────────────────────────┼─────────────────────────────────────┐
              │                                     │                                     │
   ┌──────────┴──────────┐           ┌──────────────┴──────────────┐        ┌────────────┴────────────┐
   │   REST API Services │           │   WebSocket Service         │        │   Video Service         │
   │      (Node.js)      │           │     (Socket.io)             │        │   (Daily.co SFU)        │
   │                     │           │                             │        │                         │
   │ • Authentication    │           │ • Real-time notifications   │        │ • Video calls           │
   │ • Scheduling        │           │ • Presence (online status)  │        │ • Screen sharing        │
   │ • Patient records   │           │ • Chat during visits        │        │ • Recording (consent)   │
   │ • Visit management  │           │ • Waiting room updates      │        │ • HIPAA-compliant       │
   └──────────┬──────────┘           └──────────────┬──────────────┘        └────────────┬────────────┘
              │                                     │                                    │
              └─────────────────────────────────────┼────────────────────────────────────┘
                                                    │
   ┌────────────────────────────────────────────────┴────────────────────────────────────────────────┐
   │                                    CORE SERVICE LAYER                                           │
   │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
   │  │   Auth Service  │  │ Scheduling Svc  │  │   Visit Service │  │  Patient Service│            │
   │  │                 │  │                 │  │                 │  │                 │            │
   │  │ • MFA (TOTP)    │  │ • Appointments  │  │ • Visit notes   │  │ • Demographics  │            │
   │  │ • SSO (SAML)    │  │ • Availability  │  │ • Diagnoses     │  │ • Insurance     │            │
   │  │ • Session mgmt  │  │ • Reminders     │  │ • Follow-ups    │  │ • Consent forms │            │
   │  │ • RBAC          │  │ • Waitlist      │  │ • Attachments   │  │ • PHI access    │            │
   │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘            │
   │           │                    │                    │                    │                     │
   │  ┌────────┴────────┐  ┌────────┴────────┐  ┌────────┴────────┐  ┌────────┴────────┐            │
   │  │ Provider Service│  │  Rx Service     │  │ Audit Service   │  │ Notification Svc│            │
   │  │                 │  │                 │  │                 │  │                 │            │
   │  │ • Credentials   │  │ • E-prescribing │  │ • PHI access    │  │ • Email/SMS     │            │
   │  │ • Licenses      │  │ • Drug database │  │ • User actions  │  │ • Push notifs   │            │
   │  │ • Schedules     │  │ • Interactions  │  │ • Data exports  │  │ • Reminders     │            │
   │  │ • Specialties   │  │ • EPCS (DEA)    │  │ • HIPAA reports │  │ • Alerts        │            │
   │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
   └────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                    │
   ┌────────────────────────────────────────────────┴────────────────────────────────────────────────┐
   │                                    INTEGRATION LAYER                                            │
   │  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐                      │
   │  │        Redox (EHR Gateway)      │  │     Surescripts (Pharmacy)      │                      │
   │  │                                 │  │                                 │                      │
   │  │ • Epic FHIR R4 API             │  │ • E-prescribing network         │                      │
   │  │ • Patient demographics sync    │  │ • Medication history            │                      │
   │  │ • Appointment sync             │  │ • Pharmacy routing              │                      │
   │  │ • Clinical documents           │  │ • Refill requests               │                      │
   │  │ • HL7 message translation      │  │ • EPCS (controlled substances)  │                      │
   │  └─────────────────────────────────┘  └─────────────────────────────────┘                      │
   │  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐                      │
   │  │     Stripe (Payments)           │  │   Twilio (Communications)       │                      │
   │  │                                 │  │                                 │                      │
   │  │ • Copay collection             │  │ • SMS reminders                 │                      │
   │  │ • Insurance verification       │  │ • Voice callbacks               │                      │
   │  │ • Payment plans                │  │ • 2FA codes                     │                      │
   │  │ • Refunds                      │  │ • Appointment notifications     │                      │
   │  └─────────────────────────────────┘  └─────────────────────────────────┘                      │
   └────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                    │
   ┌────────────────────────────────────────────────┴────────────────────────────────────────────────┐
   │                           HIPAA-COMPLIANT DATA LAYER (AWS GovCloud)                             │
   │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
   │  │ PostgreSQL RDS  │  │  Redis Cluster  │  │    S3 (PHI)     │  │  Elasticsearch  │            │
   │  │  (Multi-AZ)     │  │  (Encrypted)    │  │ (SSE-S3 + KMS)  │  │  (Audit Logs)   │            │
   │  │                 │  │                 │  │                 │  │                 │            │
   │  │ • Patient data  │  │ • Sessions      │  │ • Documents     │  │ • Access logs   │            │
   │  │ • Visit records │  │ • Rate limits   │  │ • Recordings    │  │ • Audit trail   │            │
   │  │ • Appointments  │  │ • Presence      │  │ • Attachments   │  │ • PHI queries   │            │
   │  │ • AES-256 TDE   │  │ • Cache         │  │ • Consent forms │  │ • Compliance    │            │
   │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
   │                                                                                                 │
   │  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
   │  │                              AWS KMS (Key Management)                                    │   │
   │  │  • Customer-managed keys (CMK) for PHI encryption                                       │   │
   │  │  • Automatic key rotation (annual)                                                      │   │
   │  │  • Key access logging to CloudTrail                                                     │   │
   │  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
   └─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Technical Decisions (ADRs)

### ADR-001: Video Platform Selection - Daily.co (Buy vs Build)

**Status**: Accepted

**Context**: We need HIPAA-compliant video conferencing for patient-provider consultations. Options include building custom WebRTC, Twilio Video, Daily.co, or Vonage.

**Decision**: Use **Daily.co** as our video platform.

**Rationale**:

| Factor | Daily.co | Twilio Video | Build Custom |
|--------|----------|--------------|--------------|
| **HIPAA Compliance** | SOC 2 + HIPAA BAA | SOC 2 + HIPAA BAA | Must build ourselves |
| **Time to Market** | Days | Days | 6+ months |
| **Cost (200 doctors)** | ~$3K/month | ~$5K/month | $200K+ build |
| **WebRTC Native** | Yes (optimized) | Yes | Complex |
| **AI Integration** | Built-in (transcription) | Limited | Must build |
| **Call Quality Analytics** | Excellent dashboards | Good | Must build |
| **SFU Architecture** | Global mesh network | Regional | Complex ops |

**Why Daily.co over Twilio**:
1. **50% lower cost** at our scale (200 doctors, ~5000 calls/month)
2. **Superior call quality** - Native WebRTC with global mesh network
3. **AI-ready** - Built-in transcription, clinical note generation
4. **Developer experience** - Simpler SDK, faster integration
5. **Healthcare focus** - Purpose-built for telemedicine use cases

**Consequences**:
- (+) Rapid go-to-market (weeks, not months)
- (+) Lower operational burden (managed infrastructure)
- (+) HIPAA compliance included in BAA
- (+) Built-in recording with consent workflows
- (-) Vendor dependency for core feature
- (-) Less customization than custom build

**Mitigation**: Abstract video service behind interface for future portability.

---

### ADR-002: EHR Integration Approach - Redox Middleware

**Status**: Accepted

**Context**: We must integrate with Epic EHR systems at 15 clinics. Options include direct Epic FHIR API integration or using middleware (Redox, Health Gorilla, Particle Health).

**Decision**: Use **Redox** as EHR integration middleware.

**Rationale**:

| Factor | Direct Epic FHIR | Redox Middleware |
|--------|------------------|------------------|
| **Initial Setup** | 3-6 months per site | 2-4 weeks per site |
| **Epic Variations** | Handle each uniquely | Normalized API |
| **App Orchard** | Required certification | Redox handles |
| **HL7 Support** | Must build | Included |
| **Multiple EHRs** | Rebuild for each | One API |
| **Cost** | $50K+ setup each | $1-2K/month/connection |

**Why Redox**:
1. **Fastest path to Epic** - Pre-built connectors to 700+ health systems
2. **API normalization** - Abstracts Epic's idiosyncratic implementations
3. **Handles compliance** - BAAs, security reviews, audit trails
4. **Bi-directional sync** - Patient data, appointments, clinical notes
5. **Future-proofing** - Easy to add Cerner, Meditech, Allscripts later

**Integration Points**:
```
Redox Data Models Used:
├── Scheduling     - Appointment sync (create, update, cancel)
├── PatientSearch  - Find/verify patients in Epic
├── ClinicalSummary - Visit notes pushed to EHR
├── Results        - Lab results retrieval
└── Medications    - Current meds, allergies sync
```

**Consequences**:
- (+) 80% faster integration timeline
- (+) Single API regardless of EHR vendor
- (+) Reduced compliance burden
- (+) Expert support for EHR edge cases
- (-) Per-connection cost ($1-2K/month/clinic)
- (-) Some advanced Epic features may require direct API

**Cost Analysis**:
- 15 clinics × $1,500/month = $22,500/month
- vs. Direct integration team: 3 engineers × $15K/month = $45K/month + maintenance
- **Redox saves ~$270K/year** and accelerates launch by 4-6 months

---

### ADR-003: Data Storage - AWS HIPAA-Eligible Services

**Status**: Accepted

**Context**: PHI storage requires HIPAA-compliant infrastructure. Options include on-premises, AWS, Azure, or GCP healthcare offerings.

**Decision**: Use **AWS HIPAA-eligible services** in **US regions** with AWS BAA.

**Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                    AWS HIPAA-Eligible Stack                      │
├─────────────────────────────────────────────────────────────────┤
│  Compute:   EKS (Kubernetes) in private subnets                 │
│  Database:  RDS PostgreSQL (Multi-AZ, encrypted)                │
│  Cache:     ElastiCache Redis (in-transit + at-rest encryption) │
│  Storage:   S3 with SSE-S3 + KMS customer-managed keys          │
│  Secrets:   AWS Secrets Manager (auto-rotation)                 │
│  Logging:   CloudWatch Logs (encrypted) + CloudTrail            │
│  Network:   VPC with private subnets, NAT Gateway, VPN          │
│  Backup:    AWS Backup with cross-region replication            │
└─────────────────────────────────────────────────────────────────┘
```

**Why AWS over Azure/GCP**:
1. **Most mature HIPAA offering** - Longest track record, most services covered
2. **Team expertise** - Existing AWS skills reduce learning curve
3. **Redox preference** - Optimized for AWS connectivity
4. **Regional availability** - All 15 clinic regions covered

**Encryption Standards**:
| Data State | Method | Key Management |
|------------|--------|----------------|
| At Rest (DB) | AES-256 TDE | AWS RDS managed |
| At Rest (S3) | SSE-S3 + KMS | Customer-managed CMK |
| In Transit | TLS 1.3 | ACM certificates |
| Backups | AES-256 | Separate CMK |

**Consequences**:
- (+) HIPAA BAA covers all services used
- (+) No hardware management
- (+) Auto-scaling for demand spikes
- (+) Built-in disaster recovery
- (-) Cloud egress costs for large files
- (-) Must carefully configure (shared responsibility)

---

### ADR-004: Authentication Strategy - Healthcare Identity

**Status**: Accepted

**Context**: Healthcare requires strong authentication with MFA, SSO for providers, and patient identity verification.

**Decision**: Multi-layered authentication with **Auth0** (HIPAA BAA available) + **MFA enforcement**.

**Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Architecture                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PATIENTS                         PROVIDERS                      │
│  ┌────────────────────┐          ┌────────────────────┐         │
│  │ Email/Password     │          │ Enterprise SSO     │         │
│  │ + SMS MFA          │          │ (SAML 2.0)         │         │
│  │ + Email Magic Link │          │ + TOTP MFA         │         │
│  └─────────┬──────────┘          └─────────┬──────────┘         │
│            │                               │                     │
│            └───────────┬───────────────────┘                     │
│                        │                                         │
│               ┌────────┴────────┐                                │
│               │    Auth0        │                                │
│               │  (HIPAA BAA)    │                                │
│               │                 │                                │
│               │ • JWT tokens    │                                │
│               │ • Refresh flow  │                                │
│               │ • Session mgmt  │                                │
│               │ • Audit logging │                                │
│               └────────┬────────┘                                │
│                        │                                         │
│               ┌────────┴────────┐                                │
│               │   RBAC Engine   │                                │
│               │                 │                                │
│               │ Roles:          │                                │
│               │ • Patient       │                                │
│               │ • Provider      │                                │
│               │ • Clinic Admin  │                                │
│               │ • Compliance    │                                │
│               │ • Super Admin   │                                │
│               └─────────────────┘                                │
└─────────────────────────────────────────────────────────────────┘
```

**MFA Requirements**:
| User Type | MFA Required | Methods |
|-----------|--------------|---------|
| Patients | Optional (encouraged) | SMS, Email |
| Providers | **Mandatory** | TOTP, Hardware key |
| Clinic Admin | **Mandatory** | TOTP, Hardware key |
| Compliance | **Mandatory** | Hardware key only |

**Session Policies**:
- Patient sessions: 24-hour expiry, refresh on activity
- Provider sessions: 8-hour expiry, re-auth for PHI access
- Admin sessions: 4-hour expiry, no refresh
- Automatic logout on inactivity: 15 minutes

**Consequences**:
- (+) Enterprise-grade identity management
- (+) HIPAA-compliant audit trails
- (+) SSO reduces provider friction
- (+) Built-in brute force protection
- (-) Auth0 cost (~$2K/month at scale)
- (-) Dependency on external identity provider

---

## Data Model

### Core Entities

```sql
-- =====================================================
-- PATIENTS (PHI - Highest Protection)
-- =====================================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_ehr_id VARCHAR(100),           -- Epic MRN
    auth0_user_id VARCHAR(100) UNIQUE,
    
    -- Demographics (encrypted at rest)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    
    -- Insurance
    insurance_provider VARCHAR(255),
    insurance_member_id VARCHAR(100),
    insurance_group_id VARCHAR(100),
    
    -- Consent
    hipaa_consent_date TIMESTAMP,
    telehealth_consent_date TIMESTAMP,
    recording_consent BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_sync_from_ehr TIMESTAMP
);

-- =====================================================
-- PROVIDERS
-- =====================================================
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth0_user_id VARCHAR(100) UNIQUE NOT NULL,
    npi VARCHAR(10) UNIQUE NOT NULL,        -- National Provider Identifier
    
    -- Identity
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    
    -- Professional
    specialty VARCHAR(100) NOT NULL,
    credentials VARCHAR(50),                 -- MD, DO, NP, PA
    bio TEXT,
    avatar_url VARCHAR(500),
    
    -- Licensing (JSON for multi-state)
    state_licenses JSONB DEFAULT '[]',       -- [{state, number, expiry}]
    dea_number VARCHAR(20),                  -- For prescribing
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    accepting_new_patients BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- CLINICS
-- =====================================================
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    phone VARCHAR(20),
    
    -- EHR Connection
    ehr_system VARCHAR(50) DEFAULT 'epic',
    redox_destination_id VARCHAR(100),
    
    -- Settings
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    business_hours JSONB,                    -- {mon: {start, end}, ...}
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Provider-Clinic association (many-to-many)
CREATE TABLE provider_clinics (
    provider_id UUID REFERENCES providers(id),
    clinic_id UUID REFERENCES clinics(id),
    is_primary BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (provider_id, clinic_id)
);

-- =====================================================
-- APPOINTMENTS
-- =====================================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_ehr_id VARCHAR(100),
    
    patient_id UUID REFERENCES patients(id) NOT NULL,
    provider_id UUID REFERENCES providers(id) NOT NULL,
    clinic_id UUID REFERENCES clinics(id) NOT NULL,
    
    -- Timing
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    timezone VARCHAR(50) NOT NULL,
    
    -- Type
    visit_type VARCHAR(50) NOT NULL,         -- 'video', 'phone', 'in_person'
    reason_for_visit TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'scheduled',  -- scheduled, checked_in, in_progress, completed, cancelled, no_show
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    
    -- Video specific
    daily_room_url VARCHAR(500),
    daily_room_token TEXT,
    
    -- Reminders
    reminder_24h_sent BOOLEAN DEFAULT FALSE,
    reminder_1h_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- VISITS (Actual encounter records)
-- =====================================================
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) NOT NULL,
    
    -- Timing
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    actual_duration_minutes INTEGER,
    
    -- Clinical (PHI)
    chief_complaint TEXT,
    subjective_notes TEXT,
    objective_notes TEXT,
    assessment TEXT,
    plan TEXT,
    
    -- Diagnoses (ICD-10 codes)
    diagnoses JSONB DEFAULT '[]',            -- [{code, description, primary}]
    
    -- Vitals (if collected)
    vitals JSONB,                            -- {bp, hr, temp, weight, height}
    
    -- Follow-up
    follow_up_instructions TEXT,
    follow_up_date DATE,
    
    -- Recording
    recording_consent_given BOOLEAN DEFAULT FALSE,
    recording_url VARCHAR(500),              -- S3 presigned URL
    
    -- EHR Sync
    synced_to_ehr BOOLEAN DEFAULT FALSE,
    ehr_sync_timestamp TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PRESCRIPTIONS
-- =====================================================
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES visits(id) NOT NULL,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    provider_id UUID REFERENCES providers(id) NOT NULL,
    
    -- Medication
    drug_name VARCHAR(255) NOT NULL,
    ndc_code VARCHAR(20),                    -- National Drug Code
    strength VARCHAR(100),
    form VARCHAR(50),                        -- tablet, capsule, liquid
    
    -- Dosing
    quantity INTEGER NOT NULL,
    days_supply INTEGER NOT NULL,
    sig TEXT NOT NULL,                       -- Instructions
    refills INTEGER DEFAULT 0,
    
    -- Controlled substance
    is_controlled BOOLEAN DEFAULT FALSE,
    dea_schedule VARCHAR(5),                 -- II, III, IV, V
    
    -- Routing
    pharmacy_ncpdp_id VARCHAR(20),           -- Pharmacy identifier
    pharmacy_name VARCHAR(255),
    pharmacy_address TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',    -- pending, sent, filled, cancelled
    surescripts_message_id VARCHAR(100),
    sent_at TIMESTAMP,
    filled_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- AUDIT LOG (HIPAA Requirement)
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who
    user_id UUID NOT NULL,
    user_type VARCHAR(50) NOT NULL,          -- patient, provider, admin
    user_email VARCHAR(255),
    
    -- What
    action VARCHAR(100) NOT NULL,            -- view, create, update, delete, export
    resource_type VARCHAR(100) NOT NULL,     -- patient, visit, prescription
    resource_id UUID,
    
    -- Context
    patient_id UUID,                         -- If PHI was accessed
    description TEXT,
    
    -- Request details
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    
    -- Outcome
    success BOOLEAN DEFAULT TRUE,
    failure_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_patient ON audit_logs(patient_id, created_at DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_appointments_patient ON appointments(patient_id, scheduled_start);
CREATE INDEX idx_appointments_provider ON appointments(provider_id, scheduled_start);
CREATE INDEX idx_appointments_status ON appointments(status, scheduled_start);
CREATE INDEX idx_visits_appointment ON visits(appointment_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id, created_at DESC);
```

---

## Security & Compliance Architecture

### Encryption Requirements

| Layer | Standard | Implementation |
|-------|----------|----------------|
| **In Transit** | TLS 1.3 | ACM certificates, HTTPS only |
| **At Rest (DB)** | AES-256 | RDS TDE enabled |
| **At Rest (S3)** | AES-256 | SSE-S3 + KMS CMK |
| **At Rest (Redis)** | AES-256 | ElastiCache encryption |
| **Backups** | AES-256 | AWS Backup + separate CMK |
| **Video Recordings** | AES-256 | Daily.co managed + S3 |

### PHI Access Controls

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHI Access Control Matrix                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Resource          Patient  Provider  Admin   Compliance  System │
│  ─────────────────────────────────────────────────────────────  │
│  Own demographics    RW       R         R         R          R   │
│  Own visit notes     R        RW        R         R          R   │
│  Own prescriptions   R        RW        -         R          R   │
│  Other patient PHI   -        R*        -         R          R   │
│  Audit logs          -        -         R         RW         W   │
│  Provider schedules  R        RW        RW        R          R   │
│  System settings     -        -         RW        R          R   │
│                                                                  │
│  * Provider can only access patients with active care relationship│
│  R = Read, W = Write, RW = Read/Write, - = No Access            │
└─────────────────────────────────────────────────────────────────┘
```

### Audit Logging Architecture

```
                    ┌─────────────────────────────────────────┐
                    │         Application Layer               │
                    │                                         │
                    │  Every PHI access triggers audit event  │
                    └─────────────────┬───────────────────────┘
                                      │
                    ┌─────────────────┴───────────────────────┐
                    │         Audit Service                    │
                    │                                         │
                    │  • Standardized event format            │
                    │  • User context enrichment              │
                    │  • Request correlation                  │
                    └─────────────────┬───────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
   ┌──────────┴──────────┐ ┌─────────┴─────────┐ ┌──────────┴──────────┐
   │   PostgreSQL        │ │   Elasticsearch   │ │   CloudWatch        │
   │   (Primary Store)   │ │   (Search/Query)  │ │   (Real-time)       │
   │                     │ │                   │ │                     │
   │ • 7-year retention  │ │ • Fast queries    │ │ • Alerts            │
   │ • Immutable         │ │ • Dashboards      │ │ • Metrics           │
   │ • Compliance reports│ │ • Anomaly detect  │ │ • Incident trigger  │
   └─────────────────────┘ └───────────────────┘ └─────────────────────┘

Audit Event Schema:
{
  "event_id": "uuid",
  "timestamp": "ISO8601",
  "user_id": "uuid",
  "user_email": "email",
  "user_role": "provider|patient|admin",
  "action": "view|create|update|delete|export",
  "resource_type": "patient|visit|prescription",
  "resource_id": "uuid",
  "patient_id": "uuid (if PHI)",
  "ip_address": "ip",
  "user_agent": "string",
  "request_id": "uuid",
  "success": true,
  "details": {}
}
```

### BAA Requirements with Vendors

| Vendor | Service | BAA Status | Annual Review |
|--------|---------|------------|---------------|
| AWS | Infrastructure | Signed | December |
| Daily.co | Video calls | Signed | December |
| Redox | EHR integration | Signed | December |
| Auth0 | Authentication | Signed | December |
| Surescripts | E-prescribing | Signed | December |
| Stripe | Payments | Signed (limited PHI) | December |
| Twilio | SMS/Voice | Signed | December |
| Datadog | Monitoring | Signed | December |

---

## Component Dependencies

```
                          ┌─────────────────────────────────────┐
                          │  Phase 1: Foundation (Weeks 1-8)    │
                          │                                     │
                          │  ┌─────────────────────────────┐   │
                          │  │   Infrastructure Setup       │   │
                          │  │   • AWS accounts + BAA       │   │
                          │  │   • VPC + networking         │   │
                          │  │   • CI/CD pipelines          │   │
                          │  └─────────────┬───────────────┘   │
                          │                │                    │
                          │  ┌─────────────┴───────────────┐   │
                          │  │   Auth Service               │   │
                          │  │   • Auth0 integration        │   │
                          │  │   • MFA implementation       │   │
                          │  │   • RBAC setup               │   │
                          │  └─────────────────────────────┘   │
                          └─────────────────┬───────────────────┘
                                            │
                          ┌─────────────────┴───────────────────┐
                          │  Phase 2: Core Services (Weeks 9-16)│
                          │                                     │
                          │  ┌───────────┐    ┌───────────┐    │
                          │  │ Patient   │    │ Provider  │    │
                          │  │ Service   │    │ Service   │    │
                          │  └─────┬─────┘    └─────┬─────┘    │
                          │        │                │          │
                          │  ┌─────┴────────────────┴─────┐    │
                          │  │     Scheduling Service      │    │
                          │  │     • Availability          │    │
                          │  │     • Booking               │    │
                          │  │     • Reminders             │    │
                          │  └─────────────────────────────┘    │
                          └─────────────────┬───────────────────┘
                                            │
                          ┌─────────────────┴───────────────────┐
                          │  Phase 3: Video + Visits (Weeks 17-24)
                          │                                     │
                          │  ┌───────────┐    ┌───────────┐    │
                          │  │  Daily.co │    │  Visit    │    │
                          │  │  Video    │───▶│  Service  │    │
                          │  └───────────┘    └─────┬─────┘    │
                          │                         │          │
                          │  ┌─────────────────────┴─────┐    │
                          │  │     Audit Service          │    │
                          │  │     • PHI logging          │    │
                          │  │     • Compliance reports   │    │
                          │  └─────────────────────────────┘    │
                          └─────────────────┬───────────────────┘
                                            │
                          ┌─────────────────┴───────────────────┐
                          │  Phase 4: Integrations (Weeks 25-36)│
                          │                                     │
                          │  ┌───────────┐    ┌───────────┐    │
                          │  │  Redox    │    │Surescripts│    │
                          │  │  EHR Sync │    │  E-Rx     │    │
                          │  └───────────┘    └───────────┘    │
                          │                                     │
                          │  ┌─────────────────────────────┐    │
                          │  │     Prescription Service    │    │
                          │  └─────────────────────────────┘    │
                          └─────────────────────────────────────┘
```

### Build Order (Critical Path)

1. **Infrastructure** (Weeks 1-4) - Blocks everything
2. **Auth Service** (Weeks 3-6) - Blocks all user-facing features
3. **Patient/Provider Services** (Weeks 5-10) - Blocks scheduling
4. **Scheduling Service** (Weeks 9-14) - Blocks visits
5. **Daily.co Integration** (Weeks 11-16) - Blocks video visits
6. **Visit Service** (Weeks 15-20) - Blocks prescriptions
7. **Audit Service** (Weeks 12-18) - Parallel, required for compliance
8. **Redox Integration** (Weeks 19-28) - Can pilot without
9. **Prescription Service** (Weeks 25-32) - Last major feature

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Daily.co outage** | Low | Critical | Implement fallback phone call option; SLA guarantees 99.99% |
| **EHR sync failures** | Medium | High | Queue with retry; manual fallback UI; Redox monitoring |
| **Video quality issues** | Medium | High | Pre-call network check; adaptive bitrate; quality dashboards |
| **Database performance** | Low | High | Read replicas; connection pooling; query optimization |
| **Authentication compromise** | Low | Critical | MFA mandatory; anomaly detection; session limits |

### Compliance Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **HIPAA audit failure** | Low | Critical | Annual 3rd-party audit; continuous compliance monitoring |
| **PHI data breach** | Low | Critical | Encryption; access controls; incident response plan |
| **Missing audit logs** | Low | High | Redundant logging; log integrity checks; alerts on gaps |
| **BAA expiration** | Low | Medium | Calendar reminders; annual vendor review process |
| **State licensing issues** | Medium | High | Automated license verification; provider self-attestation |

### Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Provider adoption resistance** | Medium | High | Training program; champion users; feedback loops |
| **Patient tech difficulties** | High | Medium | Pre-visit tech check; phone support; simplified UI |
| **Integration timeline slippage** | High | Medium | Buffer in schedule; MVP scope; phased rollout |
| **Key person dependency** | Medium | Medium | Documentation; cross-training; no single points of failure |

### Risk Mitigation Budget

| Category | Allocation | Purpose |
|----------|------------|---------|
| Security testing | $50K | Annual pen test + bug bounty |
| Compliance audit | $30K | SOC 2 Type II + HIPAA audit |
| Contingency | $150K | Timeline and scope buffers |
| Training | $40K | Provider and staff onboarding |

---

## Infrastructure Costs (Monthly Estimate)

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| EKS Cluster | 3x m6i.large (prod) | $400 |
| RDS PostgreSQL | db.r6g.large Multi-AZ | $500 |
| ElastiCache Redis | cache.r6g.large | $300 |
| S3 + Transfer | 500GB + egress | $100 |
| Daily.co | ~5000 video minutes | $3,000 |
| Redox | 15 connections | $22,500 |
| Auth0 | Enterprise | $2,000 |
| Datadog | APM + logs | $1,500 |
| CloudFront | CDN | $200 |
| Misc (KMS, Secrets, etc.) | | $500 |
| **Total** | | **~$31,000/month** |

---

*Technical design complete. Ready for implementation planning.*
