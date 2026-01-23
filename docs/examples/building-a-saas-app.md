# Example: Building a SaaS Application

This example shows how to use Locus to plan and build a SaaS application from scratch.

## The Project

We're building **TaskFlow** - a team task management SaaS with AI prioritization.

## Step 1: Vision

**Start the session:**
```
/locus a team task management SaaS with AI prioritization
```

**Load the CEO perspective for strategic thinking:**
```
use_skill("locus:ceo-strategist")
```

**Define the vision:**

| Question | Answer |
|----------|--------|
| What problem? | Teams struggle to prioritize tasks effectively |
| Who for? | Small to medium tech teams (5-50 people) |
| Why us? | AI-powered prioritization based on deadlines, dependencies, and team capacity |
| How make money? | Freemium: Free for 5 users, $10/user/month for teams |

## Step 2: Features

**Load product management skill:**
```
use_skill("locus:product-manager")
```

**Define core features:**

### MVP (Month 1-2)
- [ ] User authentication (email, Google SSO)
- [ ] Create/edit/delete tasks
- [ ] Assign tasks to team members
- [ ] Basic priority levels (Low, Medium, High)
- [ ] Team workspaces

### V1 (Month 3-4)
- [ ] AI priority suggestions
- [ ] Task dependencies
- [ ] Due date reminders
- [ ] Basic reporting

### V2 (Month 5-6)
- [ ] Integrations (Slack, GitHub)
- [ ] Custom workflows
- [ ] Advanced analytics

## Step 3: Design

### Architecture

**Load CTO skill for technical decisions:**
```
use_skill("locus:cto-architect")
```

**Technology choices:**

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js + TypeScript | SSR, great DX, type safety |
| Backend | Node.js + Hono | Fast, TypeScript, edge-ready |
| Database | PostgreSQL + Prisma | Relational data, great ORM |
| AI | OpenAI API | Reliable, good for MVP |
| Auth | Clerk | Fast integration, handles complexity |
| Hosting | Vercel + Supabase | Serverless, scales with demand |

### Database Schema

**Load database architect skill:**
```
use_skill("locus:database-architect")
```

```sql
-- Core tables
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workspace_members (
  workspace_id UUID REFERENCES workspaces(id),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL DEFAULT 'member',
  PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  ai_priority_score DECIMAL,
  assigned_to UUID REFERENCES users(id),
  due_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_dependencies (
  task_id UUID REFERENCES tasks(id),
  depends_on UUID REFERENCES tasks(id),
  PRIMARY KEY (task_id, depends_on)
);
```

### API Design

**Load API designer skill:**
```
use_skill("locus:api-designer")
```

**Core endpoints:**

```
# Tasks
GET    /api/workspaces/:id/tasks
POST   /api/workspaces/:id/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

# AI Prioritization
POST   /api/workspaces/:id/tasks/prioritize

# Workspaces
GET    /api/workspaces
POST   /api/workspaces
GET    /api/workspaces/:id
PATCH  /api/workspaces/:id
```

### UI Design

**Load UI/UX designer skill:**
```
use_skill("locus:ui-ux-designer")
```

**Key screens:**
1. Dashboard - Overview of all tasks, AI suggestions
2. Task Board - Kanban view (Todo, In Progress, Done)
3. Task Detail - Full task editing, dependencies
4. Team - Manage workspace members
5. Settings - Workspace and user settings

**Design decisions:**
- Use Tailwind + shadcn/ui for rapid development
- Mobile-first responsive design
- Dark mode support from day one
- Keyboard navigation for power users

## Step 4: Build

### Sprint 1: Foundation (Week 1-2)

**Load tech lead skill:**
```
use_skill("locus:tech-lead")
```

**Tasks:**
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Prisma with PostgreSQL
- [ ] Configure Clerk authentication
- [ ] Create database schema and migrations
- [ ] Set up CI/CD pipeline

### Sprint 2: Core Features (Week 3-4)

**Load frontend developer skill:**
```
use_skill("locus:frontend-developer")
```

**Tasks:**
- [ ] Build task list component
- [ ] Implement task CRUD operations
- [ ] Create workspace management UI
- [ ] Add team member invitation flow

### Sprint 3: AI Integration (Week 5-6)

**Load LLM architect skill:**
```
use_skill("locus:llm-architect")
```

**Tasks:**
- [ ] Design AI prioritization prompt
- [ ] Implement OpenAI API integration
- [ ] Build priority suggestion UI
- [ ] Add feedback loop for AI improvements

### Sprint 4: Polish & Launch (Week 7-8)

**Load QA expert skill:**
```
use_skill("locus:qa-expert")
```

**Tasks:**
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Launch!

## Skills Used Summary

| Phase | Skills |
|-------|--------|
| Vision | ceo-strategist |
| Features | product-manager |
| Architecture | cto-architect |
| Database | database-architect |
| API | api-designer |
| UI/UX | ui-ux-designer |
| Build | tech-lead, frontend-developer, llm-architect |
| Launch | qa-expert, test-automation-engineer |

## Next Steps

1. Start with `/locus` to begin your own project
2. Use the skills catalog to find relevant expertise
3. Follow the 4-step workflow: Vision -> Features -> Design -> Build
