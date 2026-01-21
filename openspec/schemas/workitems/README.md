# Work Items - Universal Export

This folder contains a **universal work breakdown structure** that can be 
imported into any project management tool.

## Structure

```
workitems/
├── manifest.yaml          # Project overview + complete tree
├── _schema.yaml           # Validation schema + PM tool mappings
├── README.md              # This file
│
├── 1-navigation/          # Epic 1
│   ├── epic.yaml
│   ├── 1.1-bottom-nav/    # Story 1.1
│   │   ├── story.yaml
│   │   ├── 1.1.1-scaffold.yaml
│   │   └── 1.1.2-icons.yaml
│   └── 1.2-gestures/
│       └── ...
│
└── 2-onboarding/          # Epic 2
    └── ...
```

**Key principle**: Each folder contains its own definition plus all children.

## ID Format

| Level | Format | Example |
|-------|--------|---------|
| Epic | `{n}-{name}` | `1-navigation` |
| Story | `{epic}.{n}-{name}` | `1.1-bottom-nav` |
| Task | `{epic}.{story}.{n}-{name}` | `1.1.1-scaffold` |

IDs are assigned in **MoSCoW priority order**.

## File Format

```yaml
_meta:
  schema_version: "1.0"
  level: epic|story|task
  source:
    type: locus_epic|locus_story|locus_task
    path: original/path.yaml
  generated_at: "2024-01-18T00:00:00Z"

id: "1.1-bottom-nav"
title: Short title
description: |
  Detailed description (markdown)

status: todo           # backlog|todo|in_progress|in_review|done|cancelled
priority: medium       # urgent|high|medium|low|none
created_at: "2024-01-18T00:00:00Z"

parent: "1"            # Parent ID (null for epics)
children: ["1.1.1"]    # Child IDs
```

## PM Tool Mappings

| Level | Jira | Linear | Azure DevOps | GitHub | Asana |
|-------|------|--------|--------------|--------|-------|
| Epic | Epic | Initiative | Epic | Milestone | Project |
| Story | Story | Issue | User Story | Issue | Task |
| Task | Sub-task | Sub-issue | Task | Task item | Subtask |

| Status | Jira | Linear | Azure DevOps |
|--------|------|--------|--------------|
| backlog | Backlog | Backlog | New |
| todo | To Do | Todo | Approved |
| in_progress | In Progress | In Progress | Committed |
| in_review | In Review | In Review | In Review |
| done | Done | Done | Done |
| cancelled | Won't Do | Canceled | Removed |

See `_schema.yaml` for complete mappings.

## Validation Rules

- Required fields present
- Valid status/priority values
- Parent references exist
- Children references exist
- Bidirectional consistency
- No circular dependencies
- Proper hierarchy (epic -> story -> task)
- Unique IDs
- Tasks have no children
- Epics have no parent
