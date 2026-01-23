/**
 * Skills Core Library
 * Shared utilities for skill discovery, loading, and management
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';

export interface SkillMetadata {
  name: string;
  description: string;
  license?: string;
  version?: string;
  author?: string;
  category?: string;
  tier?: string;
  council?: string;
  tools?: string;
  metadata?: {
    version?: string;
    tier?: string;
    category?: string;
    council?: string;
    [key: string]: string | undefined;
  };
  [key: string]: string | Record<string, string | undefined> | undefined;
}

export interface SkillInfo {
  path: string;
  skillFile: string;
  name: string;
  description: string;
  sourceType: 'project' | 'personal' | 'locus';
  tier?: string;
  category?: string;
  council?: string;
  version?: string;
}

export interface AgentInfo {
  path: string;
  name: string;
  description: string;
  model?: string;
  category: string;
}

export interface ResolvedSkill {
  skillFile: string;
  sourceType: 'project' | 'personal' | 'locus';
  skillPath: string;
}

/**
 * Extract YAML frontmatter from a skill or agent file.
 * 
 * Supports:
 * - Simple key: value pairs
 * - Multiline values with |
 * - Nested objects (one level deep, e.g., metadata:)
 * 
 * Format:
 * ---
 * name: skill-name
 * description: Use when [condition] - [what it does]
 * metadata:
 *   version: "1.0.0"
 *   tier: developer
 * ---
 */
export function extractFrontmatter(filePath: string): SkillMetadata {
  try {
    const content = readFileSync(filePath, 'utf-8');
    // Normalize line endings (handle Windows \r\n)
    const lines = content.replace(/\r\n/g, '\n').split('\n');

    let inFrontmatter = false;
    const metadata: SkillMetadata = { name: '', description: '' };
    let currentKey = '';
    let multilineValue = '';
    let inNestedObject = false;
    let nestedKey = '';
    const nestedObject: Record<string, string | undefined> = {};

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '---') {
        if (inFrontmatter) break;
        inFrontmatter = true;
        continue;
      }

      if (inFrontmatter) {
        // Check for nested object entry (starts with 2 spaces)
        if (inNestedObject && line.match(/^ {2}\w+:/)) {
          const nestedMatch = line.match(/^ {2}(\w+):\s*(.*)$/);
          if (nestedMatch) {
            const [, key, value] = nestedMatch;
            nestedObject[key] = value.trim().replace(/^["']|["']$/g, ''); // Strip quotes
          }
          continue;
        }
        
        // Check for top-level key
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (match) {
          // Save previous nested object if any
          if (inNestedObject && nestedKey) {
            metadata[nestedKey] = { ...nestedObject };
            // Also flatten common nested fields to top level for convenience
            if (nestedKey === 'metadata') {
              for (const [k, v] of Object.entries(nestedObject)) {
                if (v && !metadata[k]) {
                  metadata[k] = v;
                }
              }
            }
            inNestedObject = false;
            nestedKey = '';
            // Clear nested object for next use
            for (const k of Object.keys(nestedObject)) {
              delete nestedObject[k];
            }
          }
          
          // Save previous multiline value if any
          if (currentKey && multilineValue) {
            metadata[currentKey] = multilineValue.trim();
          }
          
          const [, key, value] = match;
          currentKey = key;
          
          // Handle nested object (value is empty, next lines are indented)
          if (value.trim() === '') {
            inNestedObject = true;
            nestedKey = key;
            currentKey = '';
            multilineValue = '';
          }
          // Handle multiline values starting with |
          else if (value.trim() === '|') {
            multilineValue = '';
          } else {
            metadata[key] = value.trim();
            currentKey = '';
            multilineValue = '';
          }
        } else if (currentKey && line.startsWith('  ')) {
          // Continuation of multiline value
          multilineValue += line.trim() + ' ';
        }
      }
    }

    // Save final nested object
    if (inNestedObject && nestedKey) {
      metadata[nestedKey] = { ...nestedObject };
      if (nestedKey === 'metadata') {
        for (const [k, v] of Object.entries(nestedObject)) {
          if (v && !metadata[k]) {
            metadata[k] = v;
          }
        }
      }
    }

    // Save final multiline value
    if (currentKey && multilineValue) {
      metadata[currentKey] = multilineValue.trim();
    }

    return metadata;
  } catch {
    return { name: '', description: '' };
  }
}

/**
 * Strip YAML frontmatter from content, returning just the body.
 */
export function stripFrontmatter(content: string): string {
  const lines = content.split('\n');
  let inFrontmatter = false;
  let frontmatterEnded = false;
  const contentLines: string[] = [];

  for (const line of lines) {
    if (line.trim() === '---') {
      if (inFrontmatter) {
        frontmatterEnded = true;
        continue;
      }
      inFrontmatter = true;
      continue;
    }

    if (frontmatterEnded || !inFrontmatter) {
      contentLines.push(line);
    }
  }

  return contentLines.join('\n').trim();
}

/**
 * Find all SKILL.md files in a directory recursively.
 */
export function findSkillsInDir(
  dir: string,
  sourceType: 'project' | 'personal' | 'locus',
  maxDepth = 4
): SkillInfo[] {
  const skills: SkillInfo[] = [];

  if (!existsSync(dir)) return skills;

  function recurse(currentDir: string, depth: number): void {
    if (depth > maxDepth) return;

    let entries;
    try {
      entries = readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Check for SKILL.md in this directory
        const skillFile = join(fullPath, 'SKILL.md');
        if (existsSync(skillFile)) {
          const meta = extractFrontmatter(skillFile);
          skills.push({
            path: fullPath,
            skillFile,
            name: meta.name || entry.name,
            description: meta.description || '',
            sourceType,
            tier: typeof meta.tier === 'string' ? meta.tier : undefined,
            category: typeof meta.category === 'string' ? meta.category : undefined,
            council: typeof meta.council === 'string' ? meta.council : undefined,
            version: typeof meta.version === 'string' ? meta.version : undefined,
          });
        }

        // Recurse into subdirectories
        recurse(fullPath, depth + 1);
      }
    }
  }

  recurse(dir, 0);
  return skills;
}

/**
 * Find all agent definition files in a directory.
 */
export function findAgentsInDir(dir: string, maxDepth = 3): AgentInfo[] {
  const agents: AgentInfo[] = [];

  if (!existsSync(dir)) return agents;

  function recurse(currentDir: string, depth: number, category: string): void {
    if (depth > maxDepth) return;

    let entries;
    try {
      entries = readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Use directory name as category
        recurse(fullPath, depth + 1, entry.name);
      } else if (entry.name.endsWith('.md')) {
        const { name, description } = extractFrontmatter(fullPath);
        const agentName = name || basename(entry.name, '.md');
        
        agents.push({
          path: fullPath,
          name: agentName,
          description: description || '',
          category: category || 'general',
        });
      }
    }
  }

  recurse(dir, 0, '');
  return agents;
}

/**
 * Resolve a skill name to its file path, handling namespacing and shadowing.
 * Priority: project > personal > locus
 * 
 * Skill names can be:
 * - "skill-name" - searches all locations
 * - "project:skill-name" - forces project skills only
 * - "locus:skill-name" - forces locus skills only
 */
export function resolveSkillPath(
  skillName: string,
  locusSkillsDir: string,
  personalSkillsDir: string | null,
  projectSkillsDir: string | null
): ResolvedSkill | null {
  // Parse namespace prefix
  const forceProject = skillName.startsWith('project:');
  const forceLocus = skillName.startsWith('locus:');
  const actualSkillName = skillName
    .replace(/^project:/, '')
    .replace(/^locus:/, '');

  // Try project skills first (unless forcing locus)
  if (!forceLocus && projectSkillsDir) {
    const resolved = findSkillByName(projectSkillsDir, actualSkillName, 'project');
    if (resolved) return resolved;
  }

  // If forcing project and not found, return null
  if (forceProject) return null;

  // Try personal skills (unless forcing locus)
  if (!forceLocus && personalSkillsDir) {
    const resolved = findSkillByName(personalSkillsDir, actualSkillName, 'personal');
    if (resolved) return resolved;
  }

  // Try locus skills
  const resolved = findSkillByName(locusSkillsDir, actualSkillName, 'locus');
  if (resolved) return resolved;

  return null;
}

/**
 * Find a skill by name in a directory (searches recursively).
 */
function findSkillByName(
  baseDir: string,
  skillName: string,
  sourceType: 'project' | 'personal' | 'locus'
): ResolvedSkill | null {
  if (!existsSync(baseDir)) return null;

  // Direct path check
  const directPath = join(baseDir, skillName);
  const directSkillFile = join(directPath, 'SKILL.md');
  if (existsSync(directSkillFile)) {
    return {
      skillFile: directSkillFile,
      sourceType,
      skillPath: skillName,
    };
  }

  // Search in subdirectories (for categorized skills like 01-executive-suite/ceo-strategist)
  const skills = findSkillsInDir(baseDir, sourceType);
  for (const skill of skills) {
    if (skill.name === skillName || basename(skill.path) === skillName) {
      return {
        skillFile: skill.skillFile,
        sourceType,
        skillPath: skill.path.replace(baseDir + '/', '').replace(baseDir + '\\', ''),
      };
    }
  }

  return null;
}

/**
 * Get the using-locus bootstrap skill content.
 */
export function getBootstrapContent(
  locusSkillsDir: string,
  compact = false
): string | null {
  // Try to find the main locus skill
  const usingLocusPath = join(locusSkillsDir, 'using-locus', 'SKILL.md');
  const legacyLocusPath = join(locusSkillsDir, 'locus', 'SKILL.md');
  
  let skillFile: string | null = null;
  if (existsSync(usingLocusPath)) {
    skillFile = usingLocusPath;
  } else if (existsSync(legacyLocusPath)) {
    skillFile = legacyLocusPath;
  }

  if (!skillFile) return null;

  const fullContent = readFileSync(skillFile, 'utf-8');
  const content = stripFrontmatter(fullContent);

  const toolMapping = compact
    ? `**Tool Mapping:** TodoWrite->update_plan, Task->@mention, Skill->use_skill

**Skills naming (priority order):** project: > personal: > locus:`
    : `**Tool Mapping for OpenCode:**
When skills reference tools you don't have, substitute OpenCode equivalents:
- \`TodoWrite\` -> \`update_plan\`
- \`Task\` tool with subagents -> Use OpenCode's subagent system (@mention)
- \`Skill\` tool -> \`use_skill\` custom tool
- \`Read\`, \`Write\`, \`Edit\`, \`Bash\` -> Your native tools

**Skills naming (priority order):**
- Project skills: \`project:skill-name\` (in .opencode/skills/ or project skills dir)
- Personal skills: \`skill-name\` (in ~/.config/opencode/skills/)
- Locus skills: \`locus:skill-name\`
- Project skills override personal, which override locus when names match`;

  return `<EXTREMELY_IMPORTANT>
You have access to Locus skills.

**IMPORTANT: The using-locus skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the use_skill tool to load "using-locus" - that would be redundant. Use use_skill only for OTHER skills.**

${content}

${toolMapping}
</EXTREMELY_IMPORTANT>`;
}

/**
 * Normalize a path: trim whitespace, expand ~, resolve to absolute.
 */
export function normalizePath(p: string | undefined, homeDir: string): string | null {
  if (!p || typeof p !== 'string') return null;
  let normalized = p.trim();
  if (!normalized) return null;
  
  // Expand ~ to home directory
  if (normalized.startsWith('~/')) {
    normalized = join(homeDir, normalized.slice(2));
  } else if (normalized === '~') {
    normalized = homeDir;
  }
  
  return normalized;
}
