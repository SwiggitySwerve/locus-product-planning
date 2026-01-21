# Organization Skills

A comprehensive collection of AI skills and agents for organizational decision-making, from Executive Suite to Developer Specializations, with LLM Council orchestration for group decision-making.

## Architecture

```
org-skills/
├── skills/                           # Claude Skills (SKILL.md format)
│   ├── 01-executive-suite/           # C-Level decision makers
│   ├── 02-product-management/        # PM, Scrum, Roadmap
│   ├── 03-engineering-leadership/    # Tech Lead, Staff, Principal
│   └── 04-developer-specializations/ # All technical roles
│       ├── core/                     # Frontend, Backend, Fullstack
│       ├── languages/                # TypeScript, Python, Go, Rust
│       ├── infrastructure/           # DevOps, SRE, Cloud, K8s
│       ├── data-ai/                  # Data Eng, ML, LLM
│       └── quality/                  # QA, Security, Performance
├── agents/                           # Subagents (agent.md format)
│   ├── executive/
│   ├── product/
│   ├── engineering/
│   └── developers/
├── councils/                         # LLM Council configurations
│   ├── executive-council/            # Strategic decisions
│   ├── product-council/              # Feature prioritization
│   ├── architecture-council/         # Technical design review
│   └── code-review-council/          # PR review
└── lib/                              # Shared utilities and orchestration
```

## Skill Tiers

### Tier 1: Executive Suite
Strategic decision-making for C-level concerns.

| Skill | Purpose |
|-------|---------|
| `ceo-strategist` | Vision, strategy, stakeholder alignment |
| `cto-architect` | Technical vision, platform decisions |
| `cfo-analyst` | Financial modeling, resource allocation |
| `coo-operations` | Process optimization, execution |
| `cpo-product` | Product vision, market fit |

### Tier 2: Product & Project Management
Product development and project execution.

| Skill | Purpose |
|-------|---------|
| `product-manager` | Feature prioritization, user needs |
| `project-manager` | Planning, timelines, dependencies |
| `scrum-master` | Agile facilitation, sprint planning |
| `program-manager` | Cross-team coordination |
| `roadmap-strategist` | Long-term planning |

### Tier 3: Engineering Leadership
Technical leadership and team guidance.

| Skill | Purpose |
|-------|---------|
| `tech-lead` | Technical direction, code quality |
| `staff-engineer` | Cross-team architecture |
| `principal-engineer` | Organization-wide patterns |
| `engineering-manager` | Team health, delivery |
| `architect-reviewer` | Design review, ADRs |

### Tier 4: Developer Specializations
Technical implementation across all domains.

See [skills/04-developer-specializations/](skills/04-developer-specializations/) for the full list.

## LLM Council

Multi-agent decision-making using peer review and synthesis.

### How It Works

1. **Dispatch**: Query sent to all relevant council members
2. **Response**: Each member provides independent perspective
3. **Anonymize**: Responses anonymized for unbiased evaluation
4. **Peer Review**: Each member ranks all responses
5. **Synthesis**: Chairman synthesizes best elements into final decision

### Council Types

| Council | Members | Use Case |
|---------|---------|----------|
| Executive | CEO, CTO, CFO, COO | Strategic decisions |
| Product | PM, Tech Lead, Designer | Feature prioritization |
| Architecture | Principal, Staff, Architect | Technical design |
| Code Review | Multiple specialists | PR review |

## Installation

### Claude Code
```bash
# Add as plugin marketplace
/plugin marketplace add SwiggitySwerve/org-skills

# Or install specific skill sets
/plugin install executive-suite@org-skills
/plugin install product-management@org-skills
```

### Manual Installation
```bash
# Clone to your .claude directory
git clone https://github.com/SwiggitySwerve/org-skills.git
cp -r org-skills/skills/* ~/.claude/skills/
cp -r org-skills/agents/* ~/.claude/agents/
```

## Usage

### Individual Skills
Skills activate automatically based on context, or invoke directly:
```
Use the cto-architect skill to evaluate this architecture decision...
```

### Council Decisions
For complex decisions requiring multiple perspectives:
```
Convene the executive-council to evaluate this strategic pivot...
```

## Contributing

1. Fork the repository
2. Create skill/agent following the templates
3. Submit PR with description

## License

MIT
