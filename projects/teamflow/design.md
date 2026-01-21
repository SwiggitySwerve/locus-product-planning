# TeamFlow - Technical Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   Web    │  │   iOS    │  │ Android  │  │  Slack   │        │
│  │  (React) │  │  (Future)│  │ (Future) │  │   Bot    │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
└───────┼─────────────┼─────────────┼─────────────┼───────────────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                      API GATEWAY                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Kong / AWS API Gateway                         │ │
│  │   • Rate limiting  • Auth verification  • Request routing  │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────┼────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────┴───────┐  ┌─────────┴─────────┐  ┌──────┴──────┐
│   REST API    │  │  WebSocket Server │  │  Webhooks   │
│   (Express)   │  │    (Socket.io)    │  │  (Express)  │
│               │  │                   │  │             │
│ • CRUD ops    │  │ • Real-time sync  │  │ • GitHub    │
│ • Auth flows  │  │ • Presence        │  │ • GitLab    │
│ • File upload │  │ • Notifications   │  │ • Slack     │
└───────┬───────┘  └─────────┬─────────┘  └──────┬──────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                      SERVICE LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Board Svc  │  │  User Svc   │  │ Integration │             │
│  │             │  │             │  │     Svc     │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐             │
│  │  Sprint Svc │  │  Auth Svc   │  │ Analytics   │             │
│  │             │  │             │  │     Svc     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ PostgreSQL  │  │    Redis    │  │     S3      │             │
│  │  (Primary)  │  │   (Cache)   │  │   (Files)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## Key Technical Decisions

### ADR-001: Real-Time Sync Strategy

**Status**: Accepted

**Context**: We need real-time collaboration where changes appear instantly for all users viewing the same board. This is a core differentiator.

**Decision**: Use **Yjs CRDT library** with WebSocket transport.

**Rationale**:
- CRDTs handle conflicts automatically without server coordination
- Yjs has production-proven reliability (used by Notion, Figma)
- Supports offline editing with automatic merge
- Smaller operational complexity than OT (Operational Transforms)

**Consequences**:
- (+) True real-time with conflict-free merging
- (+) Offline support built-in
- (+) Reduced server complexity
- (-) Larger client-side bundle
- (-) Learning curve for team

**Alternatives Considered**:
| Option | Why Not Chosen |
|--------|----------------|
| Operational Transforms | Higher complexity, harder to debug |
| Polling | Too slow, doesn't meet <500ms requirement |
| Last-write-wins | Data loss on conflicts |

---

### ADR-002: Database Choice

**Status**: Accepted

**Context**: Need a database that handles relational data (users, boards, cards) with good query performance and reliability.

**Decision**: **PostgreSQL** as primary database, **Redis** for caching and real-time presence.

**Rationale**:
- PostgreSQL excels at relational data with JSONB for flexible fields
- Mature, battle-tested, excellent tooling
- Strong consistency guarantees
- Redis provides sub-millisecond reads for presence data

**Consequences**:
- (+) ACID compliance for critical data
- (+) JSONB supports custom fields without migrations
- (+) Excellent ecosystem (ORMs, admin tools)
- (-) Horizontal scaling requires careful planning
- (-) No built-in real-time subscriptions (need Redis Pub/Sub)

---

### ADR-003: Frontend Framework

**Status**: Accepted

**Context**: Need a frontend framework that supports complex real-time UIs with good developer experience.

**Decision**: **React** with **TypeScript**, **Zustand** for state management, **TanStack Query** for server state.

**Rationale**:
- React is the most widely adopted, easiest to hire for
- TypeScript catches bugs early, improves refactoring
- Zustand is simpler than Redux, sufficient for our needs
- TanStack Query handles caching, invalidation, optimistic updates

**Consequences**:
- (+) Large talent pool
- (+) Extensive component library ecosystem
- (+) Team familiarity
- (-) Larger bundle than Svelte/Solid
- (-) Requires careful performance optimization for large boards

---

### ADR-004: Backend Framework

**Status**: Accepted

**Context**: Need a backend that handles both REST APIs and WebSocket connections efficiently.

**Decision**: **Node.js** with **Express** + **Socket.io** for WebSockets.

**Rationale**:
- JavaScript/TypeScript across full stack reduces context switching
- Socket.io handles WebSocket complexity (fallbacks, reconnection)
- Express is battle-tested for REST APIs
- Good integration with Yjs

**Consequences**:
- (+) Full-stack TypeScript
- (+) Excellent real-time support
- (+) Fast development velocity
- (-) CPU-bound tasks need worker threads
- (-) Memory management requires attention

---

### ADR-005: Multi-Tenancy Strategy

**Status**: Accepted

**Context**: We're building a SaaS product with multiple workspaces. Need to decide isolation strategy.

**Decision**: **Row-level isolation** with workspace_id foreign key on all tables.

**Rationale**:
- Simpler operations than schema-per-tenant
- Easier cross-tenant queries for analytics
- Lower cost than database-per-tenant
- Sufficient isolation for our security requirements

**Consequences**:
- (+) Simple deployment
- (+) Efficient resource usage
- (+) Easy backup/restore
- (-) Requires careful query filtering
- (-) Noisy neighbor potential (address with rate limiting)

---

## Data Model

```sql
-- Core entities
CREATE TABLE workspaces (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(63) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    settings JSONB DEFAULT '{}'
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workspace_members (
    workspace_id UUID REFERENCES workspaces(id),
    user_id UUID REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'member',
    PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE boards (
    id UUID PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    columns JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cards (
    id UUID PRIMARY KEY,
    board_id UUID REFERENCES boards(id),
    column_id VARCHAR(63),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    position INTEGER,
    assignee_id UUID REFERENCES users(id),
    due_date DATE,
    labels JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sprints (
    id UUID PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id),
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'planned'
);

CREATE TABLE card_sprints (
    card_id UUID REFERENCES cards(id),
    sprint_id UUID REFERENCES sprints(id),
    PRIMARY KEY (card_id, sprint_id)
);

-- Indexes for common queries
CREATE INDEX idx_cards_board ON cards(board_id);
CREATE INDEX idx_cards_assignee ON cards(assignee_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
```

---

## Component Dependencies

```
                    ┌─────────────────┐
                    │  Auth Service   │
                    │  (Foundation)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────┴───────┐ ┌────┴────┐ ┌──────┴──────┐
     │ User Service   │ │Workspace│ │Real-Time Svc│
     └────────┬───────┘ │ Service │ │  (Core)     │
              │         └────┬────┘ └──────┬──────┘
              │              │             │
              └──────────────┼─────────────┘
                             │
                    ┌────────┴────────┐
                    │  Board Service  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────┴───────┐ ┌────┴────┐ ┌──────┴──────┐
     │  Card Service  │ │ Sprint  │ │  Analytics  │
     │                │ │ Service │ │   Service   │
     └────────┬───────┘ └─────────┘ └─────────────┘
              │
     ┌────────┴───────┐
     │  Integrations  │
     │ (GitHub, etc.) │
     └────────────────┘
```

---

## Risk Assessment & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **CRDT complexity** | High | High | Prototype first, hire CRDT expert if needed |
| **WebSocket scaling** | Medium | High | Use Redis Pub/Sub for horizontal scaling |
| **GitHub API limits** | Medium | Medium | Implement webhook-first, poll as fallback |
| **Performance on large boards** | Medium | High | Virtualization, pagination, lazy loading |
| **Multi-tenant isolation bugs** | Low | Critical | Comprehensive testing, audit middleware |

---

## Infrastructure

**Development**: Docker Compose locally
**Staging**: Single Kubernetes cluster (EKS)
**Production**: 
- Multi-AZ Kubernetes (EKS)
- RDS PostgreSQL (Multi-AZ)
- ElastiCache Redis
- S3 for file storage
- CloudFront CDN

**Estimated Monthly Cost (Production)**:
- EKS cluster: $150
- RDS (db.r6g.large): $300
- ElastiCache (cache.r6g.large): $200
- S3 + CloudFront: $100
- Total: ~$750/month (scales with traffic)

---

*Technical design complete. Ready for implementation planning.*
