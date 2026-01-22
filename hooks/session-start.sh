#!/usr/bin/env bash
# Locus Bootstrap Hook for Claude Code
# Outputs JSON context for session injection

set -e

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"

# Read the using-locus skill content
SKILL_FILE="$PLUGIN_ROOT/skills/using-locus/SKILL.md"

if [ ! -f "$SKILL_FILE" ]; then
  # Fallback: output minimal context
  cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<EXTREMELY_IMPORTANT>\nYou have access to Locus skills for project planning.\n\nTo use a skill, read its SKILL.md file. Start with:\n- skills/using-locus/SKILL.md - Main planning workflow\n\nSkills are in: skills/01-executive-suite/, skills/02-product-management/, etc.\n</EXTREMELY_IMPORTANT>"
  }
}
EOF
  exit 0
fi

# Read and escape skill content for JSON
SKILL_CONTENT=$(cat "$SKILL_FILE" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g' | sed 's/\t/\\t/g')

# Build the bootstrap context
BOOTSTRAP="<EXTREMELY_IMPORTANT>
You have access to Locus skills.

**IMPORTANT: The using-locus skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the Skill tool to load \\\"using-locus\\\" - that would be redundant. Use Skill tool only for OTHER skills.**

--- SKILL CONTENT START ---
$SKILL_CONTENT
--- SKILL CONTENT END ---

**Tool Mapping for Claude Code:**
When skills reference tools you don't have, substitute Claude Code equivalents:
- \\\`TodoWrite\\\` -> Use the built-in todo/task tracking
- \\\`Task\\\` tool with subagents -> Use Claude's task delegation
- \\\`Skill\\\` tool -> Read the skill file directly with Read tool
- \\\`Read\\\`, \\\`Write\\\`, \\\`Edit\\\`, \\\`Bash\\\` -> Your native tools

**Skills Location:**
Skills are in the plugin directory under skills/:
- skills/using-locus/ - Main planning skill
- skills/01-executive-suite/ - Executive perspectives
- skills/02-product-management/ - Product skills
- skills/03-engineering-leadership/ - Tech leadership
- skills/04-developer-specializations/ - Developer skills
- skills/05-specialists/ - Specialist skills

To load a skill: Read the SKILL.md file in that directory.
</EXTREMELY_IMPORTANT>"

# Escape the bootstrap for JSON
ESCAPED_BOOTSTRAP=$(echo "$BOOTSTRAP" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')

# Output the JSON
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "$ESCAPED_BOOTSTRAP"
  }
}
EOF
