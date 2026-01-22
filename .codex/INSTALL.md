# Locus Installation for Codex

## Quick Install

Clone the repository and add to your Codex configuration:

```bash
git clone https://github.com/SwiggitySwerve/locus-product-planning.git ~/.codex/plugins/locus
```

## Configuration

Add to your Codex configuration file:

```json
{
  "plugins": ["~/.codex/plugins/locus"]
}
```

## Skills Location

After installation, Locus skills are available at:
- `~/.codex/plugins/locus/skills/`

## Usage

Once installed, you can:

1. Use `/locus` to start a project planning session
2. Load specific skills with the skill loading mechanism
3. Access 40+ specialized skills for various development tasks

## Available Skills

### Executive Suite
- ceo-strategist, cto-architect, cpo-product, cfo-analyst, coo-operations

### Product Management  
- product-manager, project-manager, scrum-master, program-manager, roadmap-strategist

### Engineering Leadership
- tech-lead, staff-engineer, principal-engineer, engineering-manager, architect-reviewer

### Developer Specializations
- frontend, backend, fullstack, mobile developers
- Language experts: typescript, python, rust, golang, java
- Infrastructure: devops, cloud, kubernetes, platform, security, sre
- Data & AI: data-engineer, data-scientist, ml-engineer, llm-architect
- Quality: qa, performance, security-auditor, accessibility

## Manual Skill Loading

If automatic skill loading isn't available, you can manually read skill files:

```
Read the file at ~/.codex/plugins/locus/skills/using-locus/SKILL.md
```

## Updates

To update Locus:

```bash
cd ~/.codex/plugins/locus
git pull
```
