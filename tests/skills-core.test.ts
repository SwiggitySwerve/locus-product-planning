/**
 * Skills Core Library Tests
 * Tests for skill discovery, frontmatter parsing, and path resolution
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import {
  extractFrontmatter,
  stripFrontmatter,
  findSkillsInDir,
  findAgentsInDir,
  resolveSkillPath,
  normalizePath,
} from '../src/lib/skills-core.js';

// Test fixtures directory
const TEST_DIR = join(process.cwd(), 'test-fixtures-skills');

describe('Skills Core Library', () => {
  beforeAll(() => {
    // Create test fixtures
    mkdirSync(join(TEST_DIR, 'skills', 'basic-skill'), { recursive: true });
    mkdirSync(join(TEST_DIR, 'skills', 'nested', 'deep-skill'), { recursive: true });
    mkdirSync(join(TEST_DIR, 'skills', 'metadata-skill'), { recursive: true });
    mkdirSync(join(TEST_DIR, 'agents', 'engineering'), { recursive: true });

    // Basic skill with simple frontmatter
    writeFileSync(
      join(TEST_DIR, 'skills', 'basic-skill', 'SKILL.md'),
      `---
name: basic-skill
description: A basic test skill for unit tests
---

# Basic Skill

This is the content of the basic skill.
`
    );

    // Skill with nested metadata
    writeFileSync(
      join(TEST_DIR, 'skills', 'metadata-skill', 'SKILL.md'),
      `---
name: metadata-skill
description: A skill with nested metadata
metadata:
  version: "1.0.0"
  tier: developer-specialization
  category: testing
  council: test-council
---

# Metadata Skill

This skill has nested metadata.
`
    );

    // Deep nested skill
    writeFileSync(
      join(TEST_DIR, 'skills', 'nested', 'deep-skill', 'SKILL.md'),
      `---
name: deep-skill
description: A deeply nested skill
---

# Deep Skill
`
    );

    // Skill with multiline description
    writeFileSync(
      join(TEST_DIR, 'skills', 'basic-skill', 'multiline.md'),
      `---
name: multiline-test
description: |
  This is a multiline
  description that spans
  multiple lines
---

# Multiline Test
`
    );

    // Agent file
    writeFileSync(
      join(TEST_DIR, 'agents', 'engineering', 'test-agent.md'),
      `---
name: test-agent
description: A test agent for engineering tasks
tools: Read, Write, Bash
---

# Test Agent

You are a test agent.
`
    );
  });

  afterAll(() => {
    // Clean up test fixtures
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('extractFrontmatter', () => {
    it('should extract simple frontmatter', () => {
      const result = extractFrontmatter(
        join(TEST_DIR, 'skills', 'basic-skill', 'SKILL.md')
      );
      expect(result.name).toBe('basic-skill');
      expect(result.description).toBe('A basic test skill for unit tests');
    });

    it('should extract nested metadata', () => {
      const result = extractFrontmatter(
        join(TEST_DIR, 'skills', 'metadata-skill', 'SKILL.md')
      );
      expect(result.name).toBe('metadata-skill');
      expect(result.version).toBe('1.0.0');
      expect(result.tier).toBe('developer-specialization');
      expect(result.category).toBe('testing');
      expect(result.council).toBe('test-council');
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.version).toBe('1.0.0');
    });

    it('should return empty metadata for non-existent file', () => {
      const result = extractFrontmatter(
        join(TEST_DIR, 'non-existent.md')
      );
      expect(result.name).toBe('');
      expect(result.description).toBe('');
    });

    it('should handle files without frontmatter', () => {
      writeFileSync(join(TEST_DIR, 'no-frontmatter.md'), '# Just Content\n\nNo frontmatter here.');
      const result = extractFrontmatter(join(TEST_DIR, 'no-frontmatter.md'));
      expect(result.name).toBe('');
      expect(result.description).toBe('');
    });
  });

  describe('stripFrontmatter', () => {
    it('should remove frontmatter and return content', () => {
      const content = `---
name: test
description: test desc
---

# Content

Body text here.`;

      const result = stripFrontmatter(content);
      expect(result).toBe('# Content\n\nBody text here.');
      expect(result).not.toContain('---');
      expect(result).not.toContain('name: test');
    });

    it('should return content unchanged if no frontmatter', () => {
      const content = '# Just Content\n\nNo frontmatter.';
      const result = stripFrontmatter(content);
      expect(result).toBe(content);
    });
  });

  describe('findSkillsInDir', () => {
    it('should find skills in directory', () => {
      const skills = findSkillsInDir(join(TEST_DIR, 'skills'), 'project', 4);
      expect(skills.length).toBeGreaterThanOrEqual(3);
      
      const names = skills.map(s => s.name);
      expect(names).toContain('basic-skill');
      expect(names).toContain('metadata-skill');
      expect(names).toContain('deep-skill');
    });

    it('should include metadata in skill info', () => {
      const skills = findSkillsInDir(join(TEST_DIR, 'skills'), 'project', 4);
      const metaSkill = skills.find(s => s.name === 'metadata-skill');
      
      expect(metaSkill).toBeDefined();
      expect(metaSkill?.tier).toBe('developer-specialization');
      expect(metaSkill?.category).toBe('testing');
    });

    it('should respect maxDepth', () => {
      const shallowSkills = findSkillsInDir(join(TEST_DIR, 'skills'), 'project', 1);
      const deepSkills = findSkillsInDir(join(TEST_DIR, 'skills'), 'project', 4);
      
      // deep-skill is nested deeper, should only appear with higher maxDepth
      const deepNames = deepSkills.map(s => s.name);
      
      // Basic skills should be found at any depth
      expect(shallowSkills.length).toBeGreaterThan(0);
      expect(deepNames).toContain('deep-skill');
    });

    it('should return empty array for non-existent directory', () => {
      const skills = findSkillsInDir(join(TEST_DIR, 'non-existent'), 'project', 4);
      expect(skills).toEqual([]);
    });

    it('should set sourceType correctly', () => {
      const skills = findSkillsInDir(join(TEST_DIR, 'skills'), 'locus', 4);
      expect(skills.every(s => s.sourceType === 'locus')).toBe(true);
    });
  });

  describe('findAgentsInDir', () => {
    it('should find agents in directory', () => {
      const agents = findAgentsInDir(join(TEST_DIR, 'agents'), 3);
      expect(agents.length).toBeGreaterThanOrEqual(1);
      
      const testAgent = agents.find(a => a.name === 'test-agent');
      expect(testAgent).toBeDefined();
      expect(testAgent?.description).toBe('A test agent for engineering tasks');
      expect(testAgent?.category).toBe('engineering');
    });

    it('should return empty array for non-existent directory', () => {
      const agents = findAgentsInDir(join(TEST_DIR, 'non-existent'), 3);
      expect(agents).toEqual([]);
    });
  });

  describe('resolveSkillPath', () => {
    it('should resolve skill from locus directory', () => {
      const result = resolveSkillPath(
        'basic-skill',
        join(TEST_DIR, 'skills'),
        null,
        null
      );
      
      expect(result).not.toBeNull();
      expect(result?.sourceType).toBe('locus');
      expect(result?.skillFile).toContain('basic-skill');
    });

    it('should prefer project skills over locus', () => {
      // Create a project skill with same name
      mkdirSync(join(TEST_DIR, 'project-skills', 'basic-skill'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, 'project-skills', 'basic-skill', 'SKILL.md'),
        `---
name: basic-skill
description: Project version of basic skill
---
# Project Basic Skill
`
      );

      const result = resolveSkillPath(
        'basic-skill',
        join(TEST_DIR, 'skills'),
        null,
        join(TEST_DIR, 'project-skills')
      );

      expect(result?.sourceType).toBe('project');
    });

    it('should handle locus: prefix', () => {
      const result = resolveSkillPath(
        'locus:basic-skill',
        join(TEST_DIR, 'skills'),
        null,
        join(TEST_DIR, 'project-skills')
      );

      expect(result?.sourceType).toBe('locus');
    });

    it('should return null for non-existent skill', () => {
      const result = resolveSkillPath(
        'non-existent-skill',
        join(TEST_DIR, 'skills'),
        null,
        null
      );

      expect(result).toBeNull();
    });
  });

  describe('normalizePath', () => {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '/home/test';

    it('should expand ~ to home directory', () => {
      const result = normalizePath('~/test/path', homeDir);
      expect(result).toBe(join(homeDir, 'test/path'));
    });

    it('should handle ~ alone', () => {
      const result = normalizePath('~', homeDir);
      expect(result).toBe(homeDir);
    });

    it('should return null for empty string', () => {
      expect(normalizePath('', homeDir)).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(normalizePath(undefined, homeDir)).toBeNull();
    });

    it('should trim whitespace', () => {
      const result = normalizePath('  ~/test  ', homeDir);
      expect(result).toBe(join(homeDir, 'test'));
    });

    it('should handle absolute paths', () => {
      const absPath = '/absolute/path';
      const result = normalizePath(absPath, homeDir);
      expect(result).toBe(absPath);
    });
  });
});
