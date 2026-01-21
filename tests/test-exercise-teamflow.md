# Project Planning Exercise: TeamFlow

## Purpose
This exercise is designed to test the Locus product planning framework's ability to handle a complex, multi-phase software project with realistic requirements, dependencies, and constraints.

## Exercise Context

**Scenario**: You are the product lead at a mid-sized SaaS company. Your CEO has given the green light to build a new product called "TeamFlow" - a real-time collaborative project management platform to compete with tools like Linear, Asana, and Monday.com.

**Budget**: $2.5M over 18 months
**Team Size**: Starting with 8 engineers, 2 designers, 1 PM
**Market Deadline**: Beta in 9 months, GA in 14 months

---

## The Brief (User Input to Locus)

> "I want to build TeamFlow - a real-time collaborative project management platform for engineering teams. It should have boards with cards, real-time sync, sprint planning, time tracking, and integrations with GitHub/GitLab. Think Linear meets Notion. We need to ship a beta in 9 months."

---

## Complexity Factors (What This Tests)

### 1. Multi-Module Architecture
- Real-time collaboration engine (WebSockets/CRDTs)
- Project/board management
- User authentication & authorization
- Integrations layer (GitHub, GitLab, Slack)
- Analytics & reporting
- Time tracking
- Sprint planning & velocity

### 2. Cross-Cutting Concerns
- Real-time sync across all modules
- Offline support (conflict resolution)
- Multi-tenant architecture
- Role-based access control
- Audit logging

### 3. User Personas
- **Engineering Manager**: Sprint planning, velocity tracking, resource allocation
- **Developer**: Task management, time tracking, PR linking
- **Product Manager**: Roadmap view, stakeholder updates, analytics
- **Executive**: High-level dashboards, team performance metrics

### 4. Technical Decisions Required
- Database: PostgreSQL vs NoSQL vs hybrid
- Real-time: WebSockets vs SSE vs polling
- Sync strategy: Operational transforms vs CRDTs
- Frontend: React vs Vue vs Svelte
- Backend: Node.js vs Go vs Rust
- Infrastructure: Kubernetes vs serverless

### 5. Risks to Identify
- Real-time sync complexity (high)
- Integration reliability (medium)
- Competitive market pressure (high)
- Team scaling challenges (medium)
- Technical debt accumulation (medium)

### 6. Dependencies
- Authentication system must be complete before boards
- Real-time engine must be complete before any collaborative features
- Database schema design blocks all feature development
- Integration APIs depend on external provider stability

---

## Expected Outputs from Locus

### Step 1: Vision
- Clear problem statement
- Target user identification
- Success metrics
- Competitive positioning

### Step 2: Features
- Prioritized feature list (MoSCoW)
- User stories for each major feature
- Clear in-scope/out-of-scope boundaries
- MVP definition

### Step 3: Design
- Technical architecture overview
- Key technical decisions (ADRs)
- Component dependencies
- Risk assessment and mitigations

### Step 4: Build
- Task breakdown with estimates
- Sprint planning
- Milestone definitions
- Resource allocation

---

## Grading Criteria

### A. Completeness (25 points)
- Did it cover all 4 steps?
- Are there gaps in any step?
- Did it identify all major components?

### B. Accuracy (25 points)
- Are technical recommendations sound?
- Are estimates reasonable?
- Are risks properly identified?

### C. Prioritization Quality (20 points)
- Is the MoSCoW classification logical?
- Does MVP make sense for 9-month beta?
- Are dependencies correctly ordered?

### D. Practical Applicability (20 points)
- Could a real team execute this plan?
- Are the task breakdowns actionable?
- Is the architecture implementable?

### E. Communication Quality (10 points)
- Is the output clear and well-organized?
- Does it avoid jargon appropriately?
- Is progress visible throughout?

---

## Scoring Rubric

| Score | Grade | Description |
|-------|-------|-------------|
| 90-100 | A | Exceptional - Ready for real-world use |
| 80-89 | B | Good - Minor gaps, generally solid |
| 70-79 | C | Adequate - Noticeable gaps, but usable |
| 60-69 | D | Below Average - Significant gaps |
| <60 | F | Inadequate - Not usable for real planning |

---

## Expected Challenge Areas

1. **Real-time sync complexity**: Does Locus properly identify CRDT/OT decisions?
2. **Integration dependencies**: Does it understand external API risks?
3. **MVP scoping**: Can it separate 9-month beta from 14-month GA?
4. **Team scaling**: Does it consider hiring/onboarding in timeline?
5. **Technical debt**: Does it allocate time for refactoring?

---

## Notes for Graders

- This exercise is intentionally complex to stress-test the framework
- A perfect score is unlikely; 75-85 would indicate strong performance
- Pay special attention to how well it handles ambiguity
- Note any areas where human intervention would be required
