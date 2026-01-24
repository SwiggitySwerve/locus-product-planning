/**
 * Locus - OpenCode Plugin
 */

import type { Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import {
  findSkillsInDir,
  findAgentsInDir,
  resolveSkillPath,
  extractFrontmatter,
  stripFrontmatter,
  normalizePath,
  getLocusSkillsDir,
  getLocusAgentsDir,
} from "./lib/skills-core.js";

/**
 * Locus Plugin for OpenCode
 */
export const LocusPlugin: Plugin = async ({ client, directory }) => {
  const homeDir = homedir();

  // Skill directories with priority: project > personal > locus
  const projectSkillsDir = join(directory, '.opencode/skills');

  // Get locus directories using robust path resolution
  const locusSkillsDir = getLocusSkillsDir();
  const locusAgentsDir = getLocusAgentsDir();
  const projectAgentsDir = join(directory, 'agents');

  // Personal skills directory (respect OPENCODE_CONFIG_DIR if set)
  const envConfigDir = normalizePath(process.env.OPENCODE_CONFIG_DIR, homeDir);
  const configDir = envConfigDir || join(homeDir, '.config/opencode');
  const personalSkillsDir = join(configDir, 'skills');

  return {
    tool: {
      /**
       * Load and read a specific skill to guide work
       */
      locus_skill: tool({
        description: 'Load and read a specific skill to guide your work.',
        args: {
          skill_name: tool.schema.string().describe('Name of the skill to load')
        },
        execute: async (args, context) => {
          const { skill_name } = args;

          const resolved = resolveSkillPath(
            skill_name,
            locusSkillsDir,
            personalSkillsDir,
            projectSkillsDir
          );

          if (!resolved) {
            return `Error: Skill "${skill_name}" not found.`;
          }

          const fullContent = readFileSync(resolved.skillFile, 'utf-8');
          const { name, description } = extractFrontmatter(resolved.skillFile);
          const content = stripFrontmatter(fullContent);
          const skillDirectory = dirname(resolved.skillFile);

          const skillHeader = `# ${name || skill_name}
# ${description || ''}
# Supporting tools and docs are in ${skillDirectory}
# ============================================`;

          try {
            await client.session.prompt({
              path: { id: context.sessionID },
              body: {
                agent: context.agent,
                noReply: true,
                parts: [
                  { type: "text", text: `Loading skill: ${name || skill_name}`, synthetic: true },
                  { type: "text", text: `${skillHeader}\n\n${content}`, synthetic: true }
                ]
              }
            });
          } catch {
            return `${skillHeader}\n\n${content}`;
          }

          return `Launching skill: ${name || skill_name}`;
        }
      }),

      /**
       * List all available skills
       */
      locus_skills: tool({
        description: 'List all available skills.',
        args: {
          category: tool.schema.string().optional().describe('Filter by category'),
          tier: tool.schema.string().optional().describe('Filter by tier'),
          search: tool.schema.string().optional().describe('Search term'),
        },
        execute: async (args) => {
          const { category, tier, search } = args;

          const projectSkills = findSkillsInDir(projectSkillsDir, 'project', 4);
          const personalSkills = findSkillsInDir(personalSkillsDir, 'personal', 4);
          const locusSkills = findSkillsInDir(locusSkillsDir, 'locus', 4);

          let allSkills = [...projectSkills, ...personalSkills, ...locusSkills];

          if (category) {
            const categoryLower = category.toLowerCase();
            allSkills = allSkills.filter(s =>
              s.category?.toLowerCase().includes(categoryLower) ||
              s.path.toLowerCase().includes(categoryLower)
            );
          }

          if (tier) {
            const tierLower = tier.toLowerCase();
            allSkills = allSkills.filter(s =>
              s.tier?.toLowerCase().includes(tierLower) ||
              s.path.toLowerCase().includes(tierLower)
            );
          }

          if (search) {
            const searchLower = search.toLowerCase();
            allSkills = allSkills.filter(s =>
              s.name.toLowerCase().includes(searchLower) ||
              s.description.toLowerCase().includes(searchLower)
            );
          }

          if (allSkills.length === 0) {
            return 'No skills found.';
          }

          let output = `Found ${allSkills.length} skill(s):\n\n`;

          const grouped = {
            project: allSkills.filter(s => s.sourceType === 'project'),
            personal: allSkills.filter(s => s.sourceType === 'personal'),
            locus: allSkills.filter(s => s.sourceType === 'locus'),
          };

          for (const [sourceType, skills] of Object.entries(grouped)) {
            if (skills.length === 0) continue;

            output += `## ${sourceType.charAt(0).toUpperCase() + sourceType.slice(1)} Skills\n\n`;

            for (const skill of skills) {
              const namespace = sourceType === 'personal' ? '' : `${sourceType}:`;
              output += `**${namespace}${skill.name}**`;
              if (skill.tier || skill.category) {
                output += ` [${[skill.tier, skill.category].filter(Boolean).join('/')}]`;
              }
              output += '\n';
              if (skill.description) {
                output += `  ${skill.description}\n`;
              }
            }
            output += '\n';
          }

          return output;
        }
      }),

      /**
       * List all available agents
       */
      locus_agents: tool({
        description: 'List all available agent definitions.',
        args: {},
        execute: async () => {
          const locusAgents = findAgentsInDir(locusAgentsDir, 3);
          const projectAgents = findAgentsInDir(projectAgentsDir, 3);

          const allAgents = [...projectAgents, ...locusAgents];

          if (allAgents.length === 0) {
            return 'No agents found.';
          }

          let output = 'Available agents:\n\n';

          const byCategory = new Map<string, typeof allAgents>();
          for (const agent of allAgents) {
            const cat = agent.category || 'general';
            if (!byCategory.has(cat)) {
              byCategory.set(cat, []);
            }
            byCategory.get(cat)!.push(agent);
          }

          for (const [category, agents] of byCategory) {
            output += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;

            for (const agent of agents) {
              output += `**${agent.name}**\n`;
              if (agent.description) {
                const desc = agent.description.length > 200
                  ? agent.description.substring(0, 200) + '...'
                  : agent.description;
                output += `  ${desc}\n`;
              }
              output += `  Path: ${agent.path}\n\n`;
            }
          }

          return output;
        }
      }),
    },
  };
};

// Default export for OpenCode plugin loading
export default LocusPlugin;
