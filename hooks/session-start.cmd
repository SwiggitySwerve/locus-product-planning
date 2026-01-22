@echo off
REM Locus Bootstrap Hook for Claude Code (Windows native fallback)
REM Outputs JSON context for session injection

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "PLUGIN_ROOT=%SCRIPT_DIR%.."
set "SKILL_FILE=%PLUGIN_ROOT%\skills\using-locus\SKILL.md"

REM Output the bootstrap JSON
REM Note: This is a simplified version since Windows cmd has limited string handling
echo {"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"<EXTREMELY_IMPORTANT>\nYou have access to Locus skills for AI-powered project planning.\n\n**How to Use Skills:**\nRead the SKILL.md file to load a skill. Start with:\n- Read skills/using-locus/SKILL.md - Main planning workflow (Vision -> Features -> Design -> Build)\n\n**Available Skill Categories:**\n- skills/01-executive-suite/ - CEO, CTO, CPO, CFO, COO perspectives\n- skills/02-product-management/ - Product manager, project manager, scrum master\n- skills/03-engineering-leadership/ - Tech lead, staff engineer, principal engineer\n- skills/04-developer-specializations/ - Frontend, backend, devops, data, AI specialists\n- skills/05-specialists/ - Compliance and other specialists\n\n**The Rule:** If there's even a 1%% chance a skill might apply, load it and check.\n\n**Quick Start:** Say 'I want to build...' or use /locus command.\n</EXTREMELY_IMPORTANT>"}}
