/**
 * Locus - OpenCode Plugin
 *
 * AI-powered project planning with skills framework.
 * Provides custom tools for loading and discovering skills,
 * with automatic bootstrap on session start.
 */

import type { Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin/tool";
import { readFileSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";
import {
  findSkillsInDir,
  findAgentsInDir,
  resolveSkillPath,
  extractFrontmatter,
  stripFrontmatter,
  getBootstrapContent,
  normalizePath,
} from "./lib/skills-core.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Locus Plugin for OpenCode
 * 
 * Provides:
 * - use_skill: Load and read a specific skill
 * - find_skills: List all available skills
 * - find_agents: List all available agents
 * - Bootstrap injection on session start
 */
export const LocusPlugin: Plugin = async ({ client, directory }) => {
  const homeDir = homedir();
  
  // Skill directories with priority: project > personal > locus
  const projectSkillsDir = join(directory, '.opencode/skills');
  
  // Derive locus skills dir from plugin location
  const locusSkillsDir = resolve(__dirname, '..', 'skills');
  
  // Agents directory
  const locusAgentsDir = resolve(__dirname, '..', 'agents');
  const projectAgentsDir = join(directory, 'agents');
  
  // Personal skills directory (respect OPENCODE_CONFIG_DIR if set)
  const envConfigDir = normalizePath(process.env.OPENCODE_CONFIG_DIR, homeDir);
  const configDir = envConfigDir || join(homeDir, '.config/opencode');
  const personalSkillsDir = join(configDir, 'skills');

  /**
   * Generate bootstrap content for session injection
   */
  const generateBootstrap = (compact = false): string | null => {
    return getBootstrapContent(locusSkillsDir, compact);
  };

  /**
   * Inject bootstrap via session.prompt
   */
  const injectBootstrap = async (sessionID: string, compact = false): Promise<boolean> => {
    const bootstrapContent = generateBootstrap(compact);
    if (!bootstrapContent) return false;

    try {
      await client.session.prompt({
        path: { id: sessionID },
        body: {
          noReply: true,
          parts: [{ type: "text", text: bootstrapContent, synthetic: true }]
        }
      });
      return true;
    } catch {
      return false;
    }
  };

  return {
    tool: {
      /**
       * Load and read a specific skill to guide work
       */
      use_skill: tool({
        description: 'Load and read a specific skill to guide your work. Skills contain proven workflows, mandatory processes, and expert techniques for project planning and development.',
        args: {
          skill_name: tool.schema.string().describe('Name of the skill to load (e.g., "locus:product-manager", "project:my-skill", or "brainstorming")')
        },
        execute: async (args, context) => {
          const { skill_name } = args;

          // Resolve skill with priority: project > personal > locus
          const resolved = resolveSkillPath(
            skill_name,
            locusSkillsDir,
            personalSkillsDir,
            projectSkillsDir
          );

          if (!resolved) {
            return `Error: Skill "${skill_name}" not found.\n\nRun find_skills to see available skills.`;
          }

          const fullContent = readFileSync(resolved.skillFile, 'utf-8');
          const { name, description } = extractFrontmatter(resolved.skillFile);
          const content = stripFrontmatter(fullContent);
          const skillDirectory = dirname(resolved.skillFile);

          const skillHeader = `# ${name || skill_name}
# ${description || ''}
# Supporting tools and docs are in ${skillDirectory}
# ============================================`;

          // Insert as user message with noReply for persistence across compaction
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
            // Fallback: return content directly if message insertion fails
            return `${skillHeader}\n\n${content}`;
          }

          return `Launching skill: ${name || skill_name}`;
        }
      }),

      /**
       * List all available skills with optional filtering
       */
      find_skills: tool({
        description: 'List all available skills. Filter by category (e.g., "core", "infrastructure"), tier (e.g., "executive", "developer-specialization"), or search term.',
        args: {
          category: tool.schema.string().optional().describe('Filter by category (e.g., "core", "infrastructure", "data-ai", "quality", "languages")'),
          tier: tool.schema.string().optional().describe('Filter by tier (e.g., "executive", "product-management", "engineering-leadership", "developer-specialization")'),
          search: tool.schema.string().optional().describe('Search term to filter skills by name or description'),
        },
        execute: async (args) => {
          const { category, tier, search } = args;
          
          const projectSkills = findSkillsInDir(projectSkillsDir, 'project', 4);
          const personalSkills = findSkillsInDir(personalSkillsDir, 'personal', 4);
          const locusSkills = findSkillsInDir(locusSkillsDir, 'locus', 4);

          let allSkills = [...projectSkills, ...personalSkills, ...locusSkills];

          // Apply filters
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
            const filterDesc = [category && `category="${category}"`, tier && `tier="${tier}"`, search && `search="${search}"`]
              .filter(Boolean).join(', ');
            return filterDesc 
              ? `No skills found matching: ${filterDesc}\n\nTry find_skills without filters to see all available skills.`
              : `No skills found.\n\nInstall locus skills or add personal skills to ${personalSkillsDir}/`;
          }

          let output = `Found ${allSkills.length} skill(s):\n\n`;

          // Group by source type
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
      find_agents: tool({
        description: 'List all available agent definitions for specialized tasks.',
        args: {},
        execute: async () => {
          const locusAgents = findAgentsInDir(locusAgentsDir, 3);
          const projectAgents = findAgentsInDir(projectAgentsDir, 3);

          const allAgents = [...projectAgents, ...locusAgents];

          if (allAgents.length === 0) {
            return 'No agents found.';
          }

          let output = 'Available agents:\n\n';

          // Group by category
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
                // Truncate long descriptions
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

    /**
     * Event handlers for session lifecycle
     */
    event: async ({ event }) => {
      // Extract sessionID from various event structures
      const getSessionID = (): string | undefined => {
        const props = event.properties as Record<string, unknown> | undefined;
        const session = (event as Record<string, unknown>).session as Record<string, unknown> | undefined;
        
        return (props?.info as Record<string, unknown>)?.id as string | undefined ||
               props?.sessionID as string | undefined ||
               session?.id as string | undefined;
      };

      // Inject bootstrap at session creation (before first user message)
      if (event.type === 'session.created') {
        const sessionID = getSessionID();
        if (sessionID) {
          await injectBootstrap(sessionID, false);
        }
      }

      // Re-inject bootstrap after context compaction (compact version to save tokens)
      if (event.type === 'session.compacted') {
        const sessionID = getSessionID();
        if (sessionID) {
          await injectBootstrap(sessionID, true);
        }
      }
    },
  };
};

// Default export for OpenCode plugin loading
export default LocusPlugin;

// Re-export utilities for programmatic use
export * from "./lib/skills-core.js";
