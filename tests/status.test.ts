/**
 * Status Query Engine Tests
 * Tests for deterministic status queries
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { loadSchema } from '../openspec/lib/schema.js';
import {
  getArtifactStatus,
  getAllArtifactStatuses,
  getTierStatus,
  getInitiativeStatus,
} from '../openspec/lib/status.js';
import type { Schema } from '../openspec/lib/types.js';

describe('Status Query Engine', () => {
  let schema: Schema;

  beforeAll(async () => {
    schema = await loadSchema('initiative-flow');
  });

  describe('Artifact Status Detection', () => {
    it('should return BLOCKED when dependencies are not met', async () => {
      // INI-TEST-001: Empty initiative (only state.yaml exists)
      const status = await getArtifactStatus('INI-TEST-001', 'stories', schema);

      expect(status.status).toBe('blocked');
      expect(status.missingDeps).toContain('adrs');
      expect(status.missingDeps).toContain('epics');
    });

    it('should return READY when all dependencies are DONE', async () => {
      // INI-TEST-003: Tier 2 complete (prd + epics exist)
      const status = await getArtifactStatus('INI-TEST-003', 'adrs', schema);

      expect(status.status).toBe('ready');
      expect(status.missingDeps).toHaveLength(0);
    });

    it('should return DONE when artifact file exists', async () => {
      // INI-TEST-002: Tier 1 complete
      const status = await getArtifactStatus('INI-TEST-002', 'strategic-mandate', schema);

      expect(status.status).toBe('done');
      expect(status.path).toBe('tier1/strategic-mandate.md');
    });

    it('should handle glob patterns for multi-file artifacts', async () => {
      // INI-TEST-003: Has tier2/epics/EP-001.yaml and EP-002.yaml
      const status = await getArtifactStatus('INI-TEST-003', 'epics', schema);

      expect(status.status).toBe('done');
      expect(status.paths).toHaveLength(2);
    });

    it('should return READY with empty paths for glob artifacts with no files but deps met', async () => {
      // INI-TEST-004: Has adrs but no stories yet
      const status = await getArtifactStatus('INI-TEST-004', 'stories', schema);

      // Stories requires [adrs, epics]
      // INI-TEST-004 has both, so stories should be READY
      expect(status.status).toBe('ready');
      expect(status.paths).toHaveLength(0);
    });

    it('should return BLOCKED when strategic-mandate does not exist', async () => {
      // INI-TEST-001: Empty
      const status = await getArtifactStatus('INI-TEST-001', 'prd', schema);

      expect(status.status).toBe('blocked');
      expect(status.missingDeps).toContain('strategic-mandate');
    });
  });

  describe('Initiative Status Rollup', () => {
    it('should compute current tier correctly', async () => {
      const status = await getInitiativeStatus('INI-TEST-003', schema);

      expect(status.currentTier).toBe('tier2');
      expect(status.completedTiers).toContain('tier1');
    });

    it('should detect tier3 as current for tier3_active', async () => {
      const status = await getInitiativeStatus('INI-TEST-004', schema);

      expect(status.currentTier).toBe('tier3');
      expect(status.completedTiers).toContain('tier1');
      expect(status.completedTiers).toContain('tier2');
    });

    it('should list all artifacts with correct states', async () => {
      const status = await getInitiativeStatus('INI-TEST-004', schema);

      const artifactMap = new Map(status.artifacts.map(a => [a.id, a.status]));

      expect(artifactMap.get('strategic-mandate')).toBe('done');
      expect(artifactMap.get('prd')).toBe('done');
      expect(artifactMap.get('epics')).toBe('done');
      expect(artifactMap.get('adrs')).toBe('done');
      expect(artifactMap.get('stories')).toBe('ready');
      expect(artifactMap.get('tasks')).toBe('blocked');
      expect(artifactMap.get('implementation')).toBe('blocked');
    });

    it('should identify next action correctly', async () => {
      const status = await getInitiativeStatus('INI-TEST-004', schema);

      expect(status.nextAction).toBeDefined();
      expect(status.nextAction?.artifact).toBe('stories');
      expect(status.nextAction?.tier).toBe('tier3');
    });

    it('should handle fully complete initiative', async () => {
      const status = await getInitiativeStatus('INI-TEST-005', schema);

      expect(status.currentTier).toBeNull();
      expect(status.completedTiers).toEqual(['tier1', 'tier2', 'tier3', 'tier4']);
      expect(status.nextAction).toBeNull();
      expect(status.isComplete).toBe(true);
    });

    it('should return draft stage for new initiative', async () => {
      const status = await getInitiativeStatus('INI-TEST-001', schema);

      expect(status.currentStage).toBe('draft');
      expect(status.currentTier).toBeNull();
    });
  });

  describe('Tier Status Query', () => {
    it('should return all artifacts for a tier', async () => {
      const tierStatus = await getTierStatus('INI-TEST-004', 'tier3', schema);

      expect(tierStatus.tier).toBe('tier3');
      expect(tierStatus.name).toBe('Technical Design');
      expect(tierStatus.council).toBe('architecture-council');
      expect(tierStatus.artifacts).toHaveLength(4); // adrs, stories, tasks, test-strategy
    });

    it('should compute tier completion percentage', async () => {
      const tierStatus = await getTierStatus('INI-TEST-004', 'tier3', schema);

      // adrs: done (1), stories: ready (0), tasks: blocked (0), test-strategy: blocked (0)
      // Completion = 1/4 = 25%
      expect(tierStatus.completionPct).toBeCloseTo(25, 0);
    });

    it('should identify tier as blocked if any artifact is blocked', async () => {
      const tierStatus = await getTierStatus('INI-TEST-001', 'tier2', schema);

      expect(tierStatus.isBlocked).toBe(true);
      expect(tierStatus.blockedBy).toContain('strategic-mandate');
    });

    it('should show 100% completion for fully done tier', async () => {
      const tierStatus = await getTierStatus('INI-TEST-005', 'tier1', schema);

      expect(tierStatus.completionPct).toBe(100);
      expect(tierStatus.isBlocked).toBe(false);
    });
  });

  describe('Status Consistency', () => {
    it('should return consistent status across multiple queries', async () => {
      const status1 = await getInitiativeStatus('INI-TEST-003', schema);
      const status2 = await getInitiativeStatus('INI-TEST-003', schema);

      expect(status1.currentStage).toEqual(status2.currentStage);
      expect(status1.artifacts.length).toEqual(status2.artifacts.length);
    });
  });
});
