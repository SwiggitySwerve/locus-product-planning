/**
 * Plugin Integration Tests
 * Tests for the OpenCode plugin tools and event handlers
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { join } from 'path';
import { existsSync } from 'fs';

// Import the plugin and utilities
import { LocusPlugin } from '../src/index.js';
import {
  findSkillsInDir,
  findAgentsInDir,
  resolveSkillPath,
  extractFrontmatter,
  getBootstrapContent,
} from '../src/lib/skills-core.js';

// Test fixtures
const SKILLS_DIR = join(process.cwd(), 'skills');
const AGENTS_DIR = join(process.cwd(), 'agents');

describe('Plugin Integration', () => {
  describe('Skill Discovery', () => {
    it('should find all locus skills', () => {
      const skills = findSkillsInDir(SKILLS_DIR, 'locus', 4);
      
      // Should find 41 skills
      expect(skills.length).toBeGreaterThanOrEqual(40);
      
      // Check for key skills
      const names = skills.map(s => s.name);
      expect(names).toContain('using-locus');
      expect(names).toContain('ceo-strategist');
      expect(names).toContain('product-manager');
      expect(names).toContain('tech-lead');
      expect(names).toContain('frontend-developer');
    });

    it('should extract metadata from skills', () => {
      const skills = findSkillsInDir(SKILLS_DIR, 'locus', 4);
      const ceoSkill = skills.find(s => s.name === 'ceo-strategist');
      
      expect(ceoSkill).toBeDefined();
      expect(ceoSkill?.tier).toBe('executive');
      expect(ceoSkill?.category).toBe('c-suite');
    });

    it('should filter skills by tier', () => {
      const skills = findSkillsInDir(SKILLS_DIR, 'locus', 4);
      const executiveSkills = skills.filter(s => s.tier === 'executive');
      
      expect(executiveSkills.length).toBeGreaterThanOrEqual(5);
    });

    it('should filter skills by category', () => {
      const skills = findSkillsInDir(SKILLS_DIR, 'locus', 4);
      const coreSkills = skills.filter(s => s.category === 'core');
      
      expect(coreSkills.length).toBeGreaterThanOrEqual(4);
      const names = coreSkills.map(s => s.name);
      expect(names).toContain('frontend-developer');
      expect(names).toContain('backend-developer');
    });
  });

  describe('Agent Discovery', () => {
    it('should find all agents', () => {
      const agents = findAgentsInDir(AGENTS_DIR, 3);
      
      // Should find 14 agents
      expect(agents.length).toBeGreaterThanOrEqual(14);
      
      // Check for key agents
      const names = agents.map(a => a.name);
      expect(names).toContain('ceo-strategist');
      expect(names).toContain('tech-lead');
      expect(names).toContain('product-manager');
    });

    it('should categorize agents correctly', () => {
      const agents = findAgentsInDir(AGENTS_DIR, 3);
      
      const executiveAgents = agents.filter(a => a.category === 'executive');
      const engineeringAgents = agents.filter(a => a.category === 'engineering');
      const productAgents = agents.filter(a => a.category === 'product');
      
      expect(executiveAgents.length).toBe(5);
      expect(engineeringAgents.length).toBe(5);
      expect(productAgents.length).toBe(4);
    });
  });

  describe('Skill Resolution', () => {
    it('should resolve skill by name', () => {
      const resolved = resolveSkillPath('ceo-strategist', SKILLS_DIR, null, null);
      
      expect(resolved).not.toBeNull();
      expect(resolved?.sourceType).toBe('locus');
      expect(resolved?.skillFile).toContain('ceo-strategist');
      expect(existsSync(resolved!.skillFile)).toBe(true);
    });

    it('should resolve using-locus skill', () => {
      const resolved = resolveSkillPath('using-locus', SKILLS_DIR, null, null);
      
      expect(resolved).not.toBeNull();
      expect(resolved?.skillFile).toContain('using-locus');
    });

    it('should handle locus: prefix', () => {
      const resolved = resolveSkillPath('locus:tech-lead', SKILLS_DIR, null, null);
      
      expect(resolved).not.toBeNull();
      expect(resolved?.sourceType).toBe('locus');
    });

    it('should return null for non-existent skill', () => {
      const resolved = resolveSkillPath('non-existent-skill', SKILLS_DIR, null, null);
      
      expect(resolved).toBeNull();
    });
  });

  describe('Bootstrap Content', () => {
    it('should generate bootstrap content', () => {
      const content = getBootstrapContent(SKILLS_DIR, false);
      
      expect(content).not.toBeNull();
      expect(content).toContain('EXTREMELY_IMPORTANT');
      expect(content).toContain('use_skill');
      expect(content).toContain('find_skills');
    });

    it('should generate compact bootstrap content', () => {
      const fullContent = getBootstrapContent(SKILLS_DIR, false);
      const compactContent = getBootstrapContent(SKILLS_DIR, true);
      
      expect(compactContent).not.toBeNull();
      expect(compactContent!.length).toBeLessThan(fullContent!.length);
      expect(compactContent).toContain('Tool Mapping');
    });
  });

  describe('Frontmatter Parsing', () => {
    it('should parse executive skill frontmatter', () => {
      const skillPath = join(SKILLS_DIR, '01-executive-suite', 'ceo-strategist', 'SKILL.md');
      const meta = extractFrontmatter(skillPath);
      
      expect(meta.name).toBe('ceo-strategist');
      expect(meta.description).toBeTruthy();
      expect(meta.tier).toBe('executive');
      expect(meta.category).toBe('c-suite');
      expect(meta.council).toBe('executive-council');
      expect(meta.version).toBe('1.0.0');
    });

    it('should parse developer skill frontmatter', () => {
      const skillPath = join(SKILLS_DIR, '04-developer-specializations', 'core', 'frontend-developer', 'SKILL.md');
      const meta = extractFrontmatter(skillPath);
      
      expect(meta.name).toBe('frontend-developer');
      expect(meta.tier).toBe('developer-specialization');
      expect(meta.category).toBe('core');
      expect(meta.council).toBe('code-review-council');
    });

    it('should parse using-locus skill frontmatter', () => {
      const skillPath = join(SKILLS_DIR, 'using-locus', 'SKILL.md');
      const meta = extractFrontmatter(skillPath);
      
      expect(meta.name).toBe('using-locus');
      expect(meta.description).toContain('starting any conversation');
    });
  });

  describe('Plugin Factory', () => {
    it('should create plugin with tools', async () => {
      // Mock plugin input with all required fields
      const mockInput = {
        client: {
          session: {
            prompt: vi.fn().mockResolvedValue({}),
          },
        },
        directory: process.cwd(),
        project: { id: 'test', name: 'test' },
        worktree: process.cwd(),
        serverUrl: new URL('http://localhost:3000'),
        $: {} as any,
      };

      const plugin = await LocusPlugin(mockInput as any);

      expect(plugin).toBeDefined();
      expect(plugin.tool).toBeDefined();
      expect(plugin.tool?.use_skill).toBeDefined();
      expect(plugin.tool?.find_skills).toBeDefined();
      expect(plugin.tool?.find_agents).toBeDefined();
      expect(plugin.event).toBeDefined();
    });
  });

  describe('Tool Execution', () => {
    let plugin: Awaited<ReturnType<typeof LocusPlugin>>;
    let mockInput: any;

    beforeAll(async () => {
      mockInput = {
        client: {
          session: {
            prompt: vi.fn().mockResolvedValue({}),
          },
        },
        directory: process.cwd(),
        project: { id: 'test', name: 'test' },
        worktree: process.cwd(),
        serverUrl: new URL('http://localhost:3000'),
        $: {} as any,
      };

      plugin = await LocusPlugin(mockInput as any);
    });

    it('find_skills should return all skills without filters', async () => {
      const result = await plugin.tool!.find_skills.execute({}, { sessionID: 'test', agent: 'test' } as any);
      
      expect(result).toContain('Locus Skills');
      expect(result).toContain('ceo-strategist');
      expect(result).toContain('product-manager');
      expect(result).toContain('frontend-developer');
    });

    it('find_skills should filter by tier', async () => {
      const result = await plugin.tool!.find_skills.execute(
        { tier: 'executive' },
        { sessionID: 'test', agent: 'test' } as any
      );
      
      expect(result).toContain('ceo-strategist');
      expect(result).not.toContain('frontend-developer');
    });

    it('find_skills should filter by category', async () => {
      const result = await plugin.tool!.find_skills.execute(
        { category: 'core' },
        { sessionID: 'test', agent: 'test' } as any
      );
      
      expect(result).toContain('frontend-developer');
      expect(result).toContain('backend-developer');
    });

    it('find_skills should filter by search term', async () => {
      const result = await plugin.tool!.find_skills.execute(
        { search: 'kubernetes' },
        { sessionID: 'test', agent: 'test' } as any
      );
      
      expect(result).toContain('kubernetes');
    });

    it('find_agents should return all agents', async () => {
      const result = await plugin.tool!.find_agents.execute({}, { sessionID: 'test', agent: 'test' } as any);
      
      expect(result).toContain('agents');
      expect(result).toContain('ceo-strategist');
      expect(result).toContain('tech-lead');
    });

    it('use_skill should load existing skill', async () => {
      const result = await plugin.tool!.use_skill.execute(
        { skill_name: 'locus:ceo-strategist' },
        { sessionID: 'test', agent: 'test' } as any
      );
      
      // Should either return "Launching skill" or the skill content (if prompt fails)
      expect(result).toMatch(/Launching skill|ceo-strategist/i);
    });

    it('use_skill should error on non-existent skill', async () => {
      const result = await plugin.tool!.use_skill.execute(
        { skill_name: 'non-existent-skill' },
        { sessionID: 'test', agent: 'test' } as any
      );
      
      expect(result).toContain('Error');
      expect(result).toContain('not found');
    });
  });
});
