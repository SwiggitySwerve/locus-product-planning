/**
 * Skills Core Library
 * Shared utilities for skill discovery, loading, and management
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join as pathJoin, basename, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Cache the dirname at module load time
let _cachedDirname: string | null = null;

/**
 * Safely convert a value to string, returning null if it can't be done.
 */
function safeString(value: unknown): string | null {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return null;
}

/**
 * Safe wrapper around path.join that ensures all arguments are strings.
 * This prevents the "paths[0] must be string, got object" error that can
 * occur when bundled code has issues with module resolution.
 */
function safeJoin(...paths: unknown[]): string {
  const stringPaths: string[] = [];
  for (const p of paths) {
    if (typeof p === 'string') {
      stringPaths.push(p);
    } else if (p != null) {
      // Try to convert to string
      const str = String(p);
      if (str && str !== '[object Object]' && str !== 'undefined' && str !== 'null') {
        stringPaths.push(str);
      }
    }
  }

  if (stringPaths.length === 0) {
    return '.';
  }

  // Use the imported pathJoin function
  try {
    return pathJoin(...stringPaths);
  } catch {
    // Fallback: manual join with separator detection
    const sep = stringPaths[0].includes('\\') ? '\\' : '/';
    return stringPaths.join(sep).replace(/[\/\\]+/g, sep);
  }
}

/**
 * Get the directory of the current module.
 * Works in both ESM and CJS contexts, and when bundled.
 */
function getCurrentDirname(): string {
  // Return cached value if available and valid
  if (typeof _cachedDirname === 'string' && _cachedDirname.length > 0) {
    return _cachedDirname;
  }

  // Try ESM approach first (import.meta.url)
  try {
    const meta = import.meta;
    const url = safeString(meta?.url);
    if (url && url.startsWith('file:')) {
      const result = safeString(dirname(fileURLToPath(url)));
      if (result) {
        _cachedDirname = result;
        return result;
      }
    }
  } catch {
    // ESM approach failed
  }

  // CJS approach: check if __dirname is available (global in CJS contexts)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalDirname = safeString((globalThis as any).__dirname);
    if (globalDirname) {
      _cachedDirname = globalDirname;
      return globalDirname;
    }
  } catch {
    // __dirname not available
  }

  // Try require.resolve to find the package
  try {
    const packageJsonPath = safeString(require.resolve('locus-product-planning/package.json'));
    if (packageJsonPath) {
      const result = safeString(safeJoin(dirname(packageJsonPath), 'dist'));
      if (result) {
        _cachedDirname = result;
        return result;
      }
    }
  } catch {
    // Package not found in node_modules
  }

  // Get home directory (Windows and Unix compatible)
  const homeDir = safeString(process.env.USERPROFILE) || safeString(process.env.HOME);

  if (homeDir) {
    // Search common cache locations for the package
    const cacheLocations = [
      safeJoin(homeDir, '.cache', 'opencode', 'node_modules', 'locus-product-planning', 'dist'),
      safeJoin(homeDir, '.config', 'opencode', 'node_modules', 'locus-product-planning', 'dist'),
    ];

    for (const loc of cacheLocations) {
      try {
        if (existsSync(loc)) {
          const result = safeString(loc);
          if (result) {
            _cachedDirname = result;
            return result;
          }
        }
      } catch {
        // Skip inaccessible paths
      }
    }
  }

  // Fallback: Use process.cwd() and check if we're in the package directory
  const cwd = safeString(process.cwd());
  if (cwd) {
    try {
      const pkgPath = resolve(cwd, 'package.json');
      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        if (pkg.name === 'locus-product-planning') {
          const result = safeString(resolve(cwd, 'dist'));
          if (result) {
            _cachedDirname = result;
            return result;
          }
        }
      }
    } catch {
      // Failed to read package.json
    }

    // Last resort: return cwd/dist
    const fallback = safeString(resolve(cwd, 'dist'));
    if (fallback) {
      _cachedDirname = fallback;
      return fallback;
    }
  }

  // Absolute last resort: return a hardcoded fallback that's definitely a string
  const absoluteFallback = '/tmp/locus-product-planning/dist';
  _cachedDirname = absoluteFallback;
  return absoluteFallback;
}

// Lazy-initialized at first access to avoid module load issues
let _currentDirname: string | null = null;

function ensureCurrentDirname(): string {
  if (_currentDirname === null) {
    _currentDirname = getCurrentDirname();
  }
  return _currentDirname;
}

/**
 * Get the package root directory (parent of dist/).
 */
export function getPackageRoot(): string {
  const dir = ensureCurrentDirname();
  // Use string concatenation to avoid any potential issues with join
  if (dir.endsWith('/') || dir.endsWith('\\')) {
    return dir + '..';
  }
  // Manually compute parent
  const lastSlash = Math.max(dir.lastIndexOf('/'), dir.lastIndexOf('\\'));
  if (lastSlash > 0) {
    return dir.substring(0, lastSlash);
  }
  return dir;
}

/**
 * Get the locus skills directory.
 */
export function getLocusSkillsDir(): string {
  const root = getPackageRoot();
  // Use platform-appropriate separator
  const sep = root.includes('\\') ? '\\' : '/';
  return root + sep + 'skills';
}

/**
 * Get the locus agents directory.
 */
export function getLocusAgentsDir(): string {
  const root = getPackageRoot();
  const sep = root.includes('\\') ? '\\' : '/';
  return root + sep + 'agents';
}

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
  // Validate filePath is a string
  if (typeof filePath !== 'string' || !filePath) {
    return { name: '', description: '' };
  }
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
  // Validate content is a string
  if (typeof content !== 'string') {
    return '';
  }
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

  // Validate dir is a string
  if (typeof dir !== 'string' || !dir) return skills;
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

      const fullPath = safeJoin(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Check for SKILL.md in this directory
        const skillFile = safeJoin(fullPath, 'SKILL.md');
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

  // Validate dir is a string
  if (typeof dir !== 'string' || !dir) return agents;
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

      const fullPath = safeJoin(currentDir, entry.name);

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
  // Validate skillName is a string
  if (typeof skillName !== 'string' || !skillName) {
    return null;
  }

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
  // Validate inputs are strings
  if (typeof baseDir !== 'string' || !baseDir) return null;
  if (typeof skillName !== 'string' || !skillName) return null;
  if (!existsSync(baseDir)) return null;

  // Direct path check
  const directPath = safeJoin(baseDir, skillName);
  const directSkillFile = safeJoin(directPath, 'SKILL.md');
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
  const usingLocusPath = safeJoin(locusSkillsDir, 'using-locus', 'SKILL.md');
  const legacyLocusPath = safeJoin(locusSkillsDir, 'locus', 'SKILL.md');
  
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
    normalized = safeJoin(homeDir, normalized.slice(2));
  } else if (normalized === '~') {
    normalized = homeDir;
  }
  
  return normalized;
}
