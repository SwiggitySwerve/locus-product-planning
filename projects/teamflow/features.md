# TeamFlow - Features

## MVP Scope (9-Month Beta)

### MUST HAVE (Critical for beta launch)

#### 1. Core Board & Card System
- Kanban board with columns (customizable)
- Card creation, editing, deletion
- Drag-and-drop reordering
- Card details: title, description, assignee, due date, labels
- Card comments and activity log

#### 2. Real-Time Collaboration
- Live cursor presence (see who's viewing what)
- Instant updates across all connected clients
- Conflict resolution for simultaneous edits
- Online/offline status indicators

#### 3. User Authentication & Workspaces
- Email/password and OAuth (Google, GitHub)
- Workspace creation and management
- Team invitations
- Basic roles: Admin, Member, Viewer

#### 4. Sprint Management (Basic)
- Sprint creation with start/end dates
- Move cards into/out of sprints
- Sprint board view
- Sprint completion summary

#### 5. GitHub Integration
- Link cards to GitHub issues
- Auto-update card status on PR merge
- View PR status on cards
- Bi-directional sync

### SHOULD HAVE (Important, but beta can launch without)

#### 6. Time Tracking
- Start/stop timer on cards
- Manual time entry
- Time reports per user/sprint
- Billable vs non-billable categorization

#### 7. Velocity & Analytics
- Sprint velocity chart
- Burndown/burnup charts
- Team workload view
- Cycle time analytics

#### 8. Advanced Permissions
- Custom roles
- Card-level permissions
- Workspace-level access controls
- Audit log

#### 9. Filters & Search
- Global search across all boards
- Advanced filtering (assignee, label, date, status)
- Saved filter views
- Keyboard shortcuts

### COULD HAVE (Nice to have, post-beta)

#### 10. GitLab Integration
- Same features as GitHub integration
- Support for self-hosted GitLab

#### 11. Slack Integration
- Card notifications in Slack
- Create cards from Slack messages
- Daily standup summaries

#### 12. Roadmap View
- Timeline/Gantt visualization
- Epic grouping
- Dependency arrows
- Milestone markers

#### 13. Custom Fields
- User-defined fields on cards
- Field templates
- Calculated fields

#### 14. Mobile App
- iOS and Android native apps
- Core functionality subset
- Push notifications

### WON'T HAVE (Out of scope for v1)

- Video conferencing integration
- Document editor (like Notion pages)
- Resource management / capacity planning
- White-label / self-hosted option
- AI-powered task suggestions
- Native desktop app

---

## User Stories

### Sprint Management

```
As an Engineering Manager,
I want to create sprints with defined start and end dates,
So that I can organize my team's work into time-boxed iterations.

Acceptance Criteria:
- Can create sprint with name, start date, end date
- Can see sprint duration in days
- Can edit sprint details after creation
- Sprint appears in sprint selector dropdown
```

```
As a Developer,
I want to move cards into the current sprint,
So that I commit to completing specific work this iteration.

Acceptance Criteria:
- Can drag card into sprint backlog
- Can see sprint capacity vs. committed points
- Can move card out of sprint back to backlog
- Card shows sprint badge when assigned
```

### Real-Time Collaboration

```
As a team member,
I want to see who else is viewing the same board as me,
So that I know when my teammates are available for quick discussions.

Acceptance Criteria:
- See avatar/initials of other users viewing board
- Avatars update within 2 seconds of user joining/leaving
- Can click avatar to see user name
- Maximum 5 avatars shown, then "+N" overflow
```

```
As a Developer,
I want changes made by teammates to appear instantly,
So that I don't accidentally work on the same task.

Acceptance Criteria:
- Card moves appear in <500ms for all users
- Card edits appear in <1s for all users
- Deleted cards disappear immediately
- No manual refresh required
```

### GitHub Integration

```
As a Developer,
I want my card to automatically move to "In Review" when I open a PR,
So that my team knows the work is ready for review without manual updates.

Acceptance Criteria:
- PR opened → card moves to "In Review" column
- PR merged → card moves to "Done" column
- PR closed without merge → card stays in current column
- PR link displayed on card
```

---

## Feature Dependencies

```
Authentication ──────┬──→ Workspaces ──→ Boards ──→ Cards
                     │                      │
Real-Time Engine ────┴──────────────────────┴──→ All collaborative features
                                               │
GitHub Integration ────────────────────────────┘
                                               │
Sprint Management ←────────────────────────────┘
```

---

## MVP Timeline Mapping

| Month | Focus | Features |
|-------|-------|----------|
| 1-2 | Foundation | Auth, Workspaces, Basic UI |
| 3-4 | Core | Boards, Cards, Real-time engine |
| 5-6 | Integration | GitHub integration, Sprint basics |
| 7-8 | Polish | Time tracking, Analytics, Filters |
| 9 | Beta prep | Bug fixes, Performance, Onboarding |

---

*Features defined. Ready for technical design.*
