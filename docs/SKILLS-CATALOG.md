# Locus Skills Catalog

Complete reference of all 46 Locus skills organized by category.

## How to Use Skills

**OpenCode:**
```
use_skill("locus:skill-name")
```

**Claude Code:**
```
/locus-skill skill-name
# or
Read skills/category/skill-name/SKILL.md
```

---

## Executive Suite (5 skills)

Strategic leadership perspectives for high-level decisions.

| Skill | When to Use |
|-------|-------------|
| `ceo-strategist` | Strategic vision, business decisions, market positioning |
| `cto-architect` | Technical strategy, architecture decisions, technology selection |
| `cpo-product` | Product vision, roadmap, user value |
| `cfo-analyst` | Financial analysis, cost estimation, ROI calculations |
| `coo-operations` | Operations, execution planning, resource allocation |

**Best for:** Early-stage planning, strategic decisions, stakeholder alignment.

---

## Product Management (6 skills)

Product planning, execution, and delivery.

| Skill | When to Use |
|-------|-------------|
| `product-manager` | Requirements, user stories, prioritization |
| `project-manager` | Timeline planning, task tracking, delivery |
| `scrum-master` | Agile processes, sprint planning, retrospectives |
| `program-manager` | Multi-project coordination, dependencies |
| `roadmap-strategist` | Long-term planning, release strategy |
| `estimation-expert` | Effort estimation, complexity analysis |

**Best for:** Feature planning, sprint work, delivery coordination.

---

## Engineering Leadership (5 skills)

Technical leadership and architecture guidance.

| Skill | When to Use |
|-------|-------------|
| `tech-lead` | Team technical decisions, code quality, mentoring |
| `staff-engineer` | Cross-team solutions, technical influence |
| `principal-engineer` | System architecture, technical vision |
| `engineering-manager` | Team processes, career development, hiring |
| `architect-reviewer` | Architecture review, design critique |

**Best for:** Architecture decisions, technical direction, code reviews.

---

## Developer Specializations (28 skills)

Domain-specific development expertise.

### Core (5 skills)

| Skill | When to Use |
|-------|-------------|
| `frontend-developer` | React, Vue, Angular, component architecture |
| `backend-developer` | APIs, services, server-side logic |
| `fullstack-developer` | End-to-end development |
| `mobile-developer` | iOS, Android, React Native, Flutter |
| `api-designer` | REST/GraphQL API design, versioning |

### Design (1 skill)

| Skill | When to Use |
|-------|-------------|
| `ui-ux-designer` | Design systems, user research, wireframes |

### Languages (5 skills)

| Skill | When to Use |
|-------|-------------|
| `typescript-pro` | TypeScript patterns, type safety |
| `python-pro` | Python best practices, ecosystem |
| `rust-engineer` | Rust systems programming, safety |
| `golang-pro` | Go patterns, concurrency |
| `java-architect` | Java enterprise patterns |

### Infrastructure (7 skills)

| Skill | When to Use |
|-------|-------------|
| `devops-engineer` | CI/CD, automation, deployment |
| `cloud-architect` | AWS, GCP, Azure architecture |
| `kubernetes-specialist` | Container orchestration, K8s |
| `platform-engineer` | Internal platforms, developer experience |
| `security-engineer` | Security architecture, threat modeling |
| `sre-engineer` | Reliability, monitoring, incident response |
| `database-architect` | Data modeling, query optimization, scalability |

### Data & AI (4 skills)

| Skill | When to Use |
|-------|-------------|
| `data-engineer` | Data pipelines, ETL, warehousing |
| `data-scientist` | Analysis, statistics, ML experiments |
| `ml-engineer` | ML systems, model deployment |
| `llm-architect` | LLM applications, RAG, prompting |

### Quality (5 skills)

| Skill | When to Use |
|-------|-------------|
| `qa-expert` | Test strategy, quality processes |
| `performance-engineer` | Load testing, optimization |
| `security-auditor` | Security review, penetration testing |
| `accessibility-tester` | WCAG compliance, a11y testing |
| `test-automation-engineer` | E2E automation, CI/CD testing |

---

## Specialists (2 skills)

Specialized domain expertise.

| Skill | When to Use |
|-------|-------------|
| `compliance-specialist` | Regulatory compliance, GDPR, HIPAA |
| `technical-writer` | Documentation, API docs, guides |

---

## Skill Combinations

Common skill pairings for different scenarios:

### Building a New Feature
1. `product-manager` - Define requirements
2. `frontend-developer` or `backend-developer` - Implement
3. `qa-expert` - Test strategy

### API Development
1. `api-designer` - Design the API
2. `backend-developer` - Implement
3. `technical-writer` - Document

### Database Work
1. `database-architect` - Schema design
2. `backend-developer` - Integration
3. `performance-engineer` - Optimization

### Starting a New Project
1. `ceo-strategist` - Vision
2. `product-manager` - Features
3. `cto-architect` - Technical approach
4. `tech-lead` - Execution plan

### UI/UX Work
1. `ui-ux-designer` - Design
2. `frontend-developer` - Implement
3. `accessibility-tester` - Verify

---

## Finding Skills

Use the `find_skills` tool to search:

```
# By category
find_skills(category="infrastructure")

# By tier
find_skills(tier="executive")

# By keyword
find_skills(search="security")
```

Or browse the `skills/` directory:
```
skills/
├── 01-executive-suite/
├── 02-product-management/
├── 03-engineering-leadership/
├── 04-developer-specializations/
│   ├── core/
│   ├── design/
│   ├── languages/
│   ├── infrastructure/
│   ├── data-ai/
│   └── quality/
└── 05-specialists/
```
