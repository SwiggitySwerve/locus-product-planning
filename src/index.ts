/**
 * Locus - OpenCode Plugin
 *
 * AI-powered project planning: Vision → Features → Design → Build
 *
 * This plugin provides the /locus commands for project planning.
 * The main skill is auto-discovered from .opencode/skills/locus/SKILL.md
 */

import type { Plugin } from "@opencode-ai/plugin";
import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to skill file (relative to dist/)
const SKILL_PATH = join(__dirname, "..", ".opencode", "skills", "locus", "SKILL.md");

/**
 * Read the Locus skill content
 */
function getSkillContent(): string {
  try {
    return readFileSync(SKILL_PATH, "utf-8");
  } catch {
    return "Locus skill not found. Please reinstall opencode-locus.";
  }
}

/**
 * Get project state from .locus-state.yaml
 */
function getProjectState(projectPath: string): Record<string, unknown> | null {
  const statePath = join(projectPath, ".locus-state.yaml");
  if (!existsSync(statePath)) return null;

  try {
    const content = readFileSync(statePath, "utf-8");
    // Simple YAML parsing for our state format
    const state: Record<string, unknown> = {};
    const lines = content.split("\n");
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        state[match[1]] = match[2];
      }
    }
    return state;
  } catch {
    return null;
  }
}

/**
 * List all projects in the projects/ directory
 */
function listProjects(directory: string): Array<{ name: string; path: string; state: Record<string, unknown> | null }> {
  const projectsDir = join(directory, "projects");
  if (!existsSync(projectsDir)) return [];

  const projects: Array<{ name: string; path: string; state: Record<string, unknown> | null }> = [];

  try {
    const entries = readdirSync(projectsDir);
    for (const entry of entries) {
      const entryPath = join(projectsDir, entry);
      const stat = statSync(entryPath);
      if (stat.isDirectory() && !entry.startsWith(".")) {
        projects.push({
          name: entry,
          path: entryPath,
          state: getProjectState(entryPath),
        });
      }
    }
  } catch {
    // Ignore errors
  }

  return projects;
}

/**
 * Format project status for display
 */
function formatProjectStatus(state: Record<string, unknown> | null, projectName: string): string {
  const steps = ["Vision", "Features", "Design", "Build"];

  if (!state) {
    return `📋 ${projectName}\n━━━━━━━━━━━━━━━━━━\nNo state found. Start with /locus.`;
  }

  const currentStep = Number(state.current_step) || 1;
  let output = `📋 ${state.project || projectName}\n━━━━━━━━━━━━━━━━━━\n`;

  for (let i = 0; i < steps.length; i++) {
    const stepNum = i + 1;
    const prefix = stepNum < currentStep ? "✓" : stepNum === currentStep ? "→" : " ";
    const suffix = stepNum === currentStep ? " ◄ you are here" : "";
    output += `${prefix} Step ${stepNum}: ${steps[i]}${suffix}\n`;
  }

  const progress = Math.round(((currentStep - 1) / 4) * 100);
  output += `\nProgress: ${progress}% complete`;

  return output;
}

/**
 * Locus Plugin for OpenCode
 */
export const LocusPlugin: Plugin = async ({ directory }) => {
  return {
    // Log when plugin loads
    event: async ({ event }) => {
      if (event.type === "session.created") {
        // Plugin is ready
      }
    },
  };
};

// Default export for OpenCode plugin loading
export default LocusPlugin;

// Named exports for programmatic use
export { getSkillContent, getProjectState, listProjects, formatProjectStatus };
