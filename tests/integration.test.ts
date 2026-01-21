/**
 * Integration Tests for Initiative Flow
 * Full lifecycle tests covering complete initiative journeys
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm, readFile, cp } from 'fs/promises';
import { join } from 'path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

import { loadSchema } from '../openspec/lib/schema.js';
import { getInitiativeStatus, getAllArtifactStatuses, getTierStatus } from '../openspec/lib/status.js';
import { checkGate, canPassGate } from '../openspec/lib/gates.js';
import {
  canTransition,
  applyTransition,
  getCurrentStage,
  getNextStage,
  isTerminalStage,
} from '../openspec/lib/state-machine.js';
import type { Schema, InitiativeState, StageStatus } from '../openspec/lib/types.js';

// Test directory for lifecycle tests
const TEST_DIR = join(process.cwd(), 'tests', 'temp-lifecycle');
const FIXTURES_DIR = join(process.cwd(), 'tests', 'fixtures');

describe('Initiative Lifecycle Integration Tests', () => {
  let schema: Schema;

  beforeAll(async () => {
    schema = await loadSchema('initiative-flow');
  });

  beforeEach(async () => {
    // Clean and create temp directory
    await rm(TEST_DIR, { recursive: true, force: true });
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup temp directory
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe('Full Initiative Journey', () => {
    const INITIATIVE_ID = 'INI-LIFECYCLE-001';

    async function createInitiative(): Promise<string> {
      const initPath = join(TEST_DIR, INITIATIVE_ID);
      await mkdir(initPath, { recursive: true });

      const state: InitiativeState = {
        metadata: {
          id: INITIATIVE_ID,
          title: 'Lifecycle Test Initiative',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          mode: 'strict',
          allow_overlap: false,
        },
        stage: 'draft',
        history: [],
        escalations: [],
        blockers: [],
      };

      await writeFile(join(initPath, 'state.yaml'), stringifyYaml(state));
      return initPath;
    }

    it('should start in draft stage with all artifacts blocked', async () => {
      const initPath = await createInitiative();

      const status = await getInitiativeStatus(INITIATIVE_ID, schema, TEST_DIR);

      expect(status.currentStage).toBe('draft');
      expect(status.isComplete).toBe(false);
      expect(status.currentTier).toBeNull();
      expect(status.completedTiers).toHaveLength(0);

      // First artifact (strategic-mandate) should be READY (no deps)
      const strategicMandate = status.artifacts.find((a) => a.id === 'strategic-mandate');
      expect(strategicMandate?.status).toBe('ready');

      // All other artifacts should be blocked
      const blockedArtifacts = status.artifacts.filter(
        (a) => a.id !== 'strategic-mandate' && a.status === 'blocked'
      );
      expect(blockedArtifacts.length).toBeGreaterThan(0);
    });

    it('should unlock Tier 2 after strategic gate passes', async () => {
      const initPath = await createInitiative();

      // Create Tier 1 directory and strategic mandate
      await mkdir(join(initPath, 'tier1'), { recursive: true });
      await writeFile(
        join(initPath, 'tier1', 'strategic-mandate.md'),
        `---
vision_aligned: true
sponsor: John Executive
success_metrics:
  - Increase revenue by 20%
  - Reduce churn by 10%
---

# Strategic Mandate

This is our strategic mandate for the lifecycle test.
`
      );

      // Update state to tier1_active
      const statePath = join(initPath, 'state.yaml');
      const stateContent = await readFile(statePath, 'utf-8');
      const state = parseYaml(stateContent) as InitiativeState;
      state.stage = 'tier1_active';
      await writeFile(statePath, stringifyYaml(state));

      // Check strategic gate
      const gateResult = await checkGate(INITIATIVE_ID, 'strategic', schema, TEST_DIR);
      expect(gateResult.passed).toBe(true);
      expect(gateResult.criteriaMet).toBe(gateResult.criteriaTotal);

      // Validate transition to tier1_approved
      const canApprove = await canTransition(
        INITIATIVE_ID,
        'tier1_active',
        'tier1_approved',
        schema,
        TEST_DIR
      );
      expect(canApprove.valid).toBe(true);

      // Apply transition
      const result = await applyTransition(
        INITIATIVE_ID,
        'tier1_active',
        'tier1_approved',
        schema,
        TEST_DIR
      );
      expect(result.success).toBe(true);
      expect(result.newStage).toBe('tier1_approved');

      // Verify PRD is now ready
      const status = await getInitiativeStatus(INITIATIVE_ID, schema, TEST_DIR);
      const prd = status.artifacts.find((a) => a.id === 'prd');
      expect(prd?.status).toBe('ready');
    });

    it('should complete full Tier 1 -> Tier 2 -> Tier 3 progression', async () => {
      const initPath = await createInitiative();

      // === Tier 1: Strategic Review ===
      await mkdir(join(initPath, 'tier1'), { recursive: true });
      await writeFile(
        join(initPath, 'tier1', 'strategic-mandate.md'),
        `---
vision_aligned: true
sponsor: Jane CEO
success_metrics:
  - KPI 1
  - KPI 2
---
# Strategic Mandate
`
      );

      // Progress through Tier 1
      let state = parseYaml(await readFile(join(initPath, 'state.yaml'), 'utf-8')) as InitiativeState;
      state.stage = 'tier1_active';
      await writeFile(join(initPath, 'state.yaml'), stringifyYaml(state));

      await applyTransition(INITIATIVE_ID, 'tier1_active', 'tier1_approved', schema, TEST_DIR);
      await applyTransition(INITIATIVE_ID, 'tier1_approved', 'tier2_active', schema, TEST_DIR);

      // === Tier 2: Product Planning ===
      await mkdir(join(initPath, 'tier2', 'epics'), { recursive: true });
      await writeFile(
        join(initPath, 'tier2', 'prd.md'),
        `---
status: approved
---
# Product Requirements Document
`
      );
      await writeFile(
        join(initPath, 'tier2', 'epics', 'EP-001-core.yaml'),
        stringifyYaml({
          id: 'EP-001',
          title: 'Core Feature',
          moscow: 'must',
          description: 'The core feature epic',
        })
      );

      // Check product gate
      const productGate = await checkGate(INITIATIVE_ID, 'product', schema, TEST_DIR);
      expect(productGate.passed).toBe(true);

      await applyTransition(INITIATIVE_ID, 'tier2_active', 'tier2_approved', schema, TEST_DIR);
      await applyTransition(INITIATIVE_ID, 'tier2_approved', 'tier3_active', schema, TEST_DIR);

      // === Tier 3: Technical Design ===
      await mkdir(join(initPath, 'tier3', 'adrs'), { recursive: true });
      await mkdir(join(initPath, 'tier3', 'stories'), { recursive: true });
      await mkdir(join(initPath, 'tier3', 'tasks'), { recursive: true });

      await writeFile(
        join(initPath, 'tier3', 'adrs', 'ADR-001-architecture.md'),
        `---
status: accepted
---
# ADR-001: Architecture Decision
`
      );

      await writeFile(
        join(initPath, 'tier3', 'stories', 'ST-001-user-login.yaml'),
        stringifyYaml({
          id: 'ST-001',
          title: 'User Login Story',
          description: 'As a user I want to log in',
          points: 5,
        })
      );

      await writeFile(
        join(initPath, 'tier3', 'tasks', 'TK-001-implement-auth.yaml'),
        stringifyYaml({
          id: 'TK-001',
          title: 'Implement Auth',
          story: 'ST-001',
          skills_required: ['backend-developer', 'security-engineer'],
          hours: 8,
        })
      );

      await writeFile(
        join(initPath, 'tier3', 'test-strategy.md'),
        `---
status: draft
---
# Test Strategy
Testing strategy for this initiative.
`
      );

      // Check design gate
      const designGate = await checkGate(INITIATIVE_ID, 'design', schema, TEST_DIR);
      expect(designGate.passed).toBe(true);

      await applyTransition(INITIATIVE_ID, 'tier3_active', 'tier3_approved', schema, TEST_DIR);

      // Verify final state
      const finalStage = await getCurrentStage(INITIATIVE_ID, TEST_DIR);
      expect(finalStage).toBe('tier3_approved');

      const status = await getInitiativeStatus(INITIATIVE_ID, schema, TEST_DIR);
      expect(status.completedTiers).toContain('tier1');
      expect(status.completedTiers).toContain('tier2');
      expect(status.completedTiers).toContain('tier3');
    });

    it('should complete entire initiative lifecycle to completion', async () => {
      const initPath = await createInitiative();

      // Quick setup of all tiers
      await mkdir(join(initPath, 'tier1'), { recursive: true });
      await mkdir(join(initPath, 'tier2', 'epics'), { recursive: true });
      await mkdir(join(initPath, 'tier3', 'adrs'), { recursive: true });
      await mkdir(join(initPath, 'tier3', 'stories'), { recursive: true });
      await mkdir(join(initPath, 'tier3', 'tasks'), { recursive: true });
      await mkdir(join(initPath, 'tier4', 'reviews'), { recursive: true });

      // Tier 1 artifacts
      await writeFile(
        join(initPath, 'tier1', 'strategic-mandate.md'),
        `---
vision_aligned: true
sponsor: CEO
success_metrics: [KPI1]
---
# Mandate
`
      );

      // Tier 2 artifacts
      await writeFile(join(initPath, 'tier2', 'prd.md'), '---\nstatus: approved\n---\n# PRD');
      await writeFile(
        join(initPath, 'tier2', 'epics', 'EP-001.yaml'),
        stringifyYaml({ id: 'EP-001', moscow: 'must' })
      );

      // Tier 3 artifacts
      await writeFile(
        join(initPath, 'tier3', 'adrs', 'ADR-001.md'),
        '---\nstatus: accepted\n---\n# ADR'
      );
      await writeFile(
        join(initPath, 'tier3', 'stories', 'ST-001.yaml'),
        stringifyYaml({ id: 'ST-001' })
      );
      await writeFile(
        join(initPath, 'tier3', 'tasks', 'TK-001.yaml'),
        stringifyYaml({ id: 'TK-001', skills_required: ['dev'] })
      );
      await writeFile(
        join(initPath, 'tier3', 'test-strategy.md'),
        '---\nstatus: draft\n---\n# Test Strategy'
      );

      // Tier 4 artifacts
      await writeFile(
        join(initPath, 'tier4', 'progress.yaml'),
        stringifyYaml({ all_complete: true, tasks: [{ id: 'TK-001', status: 'done' }] })
      );
      await writeFile(
        join(initPath, 'tier4', 'reviews', 'REV-001.md'),
        '---\nstatus: approved\n---\n# Review'
      );

      // Walk through all stages
      const stages: [StageStatus, StageStatus][] = [
        ['draft', 'tier1_active'],
        ['tier1_active', 'tier1_approved'],
        ['tier1_approved', 'tier2_active'],
        ['tier2_active', 'tier2_approved'],
        ['tier2_approved', 'tier3_active'],
        ['tier3_active', 'tier3_approved'],
        ['tier3_approved', 'tier4_active'],
        ['tier4_active', 'tier4_review'],
        ['tier4_review', 'tier4_approved'],
        ['tier4_approved', 'completed'],
      ];

      for (const [from, to] of stages) {
        // Update state manually for first transition
        if (from === 'draft') {
          const statePath = join(initPath, 'state.yaml');
          const stateContent = await readFile(statePath, 'utf-8');
          const state = parseYaml(stateContent) as InitiativeState;
          state.stage = 'draft';
          await writeFile(statePath, stringifyYaml(state));
        }

        const result = await applyTransition(INITIATIVE_ID, from, to, schema, TEST_DIR);
        expect(result.success).toBe(true);
        expect(result.newStage).toBe(to);
      }

      // Verify completion
      const finalStatus = await getInitiativeStatus(INITIATIVE_ID, schema, TEST_DIR);
      expect(finalStatus.isComplete).toBe(true);
      expect(finalStatus.currentStage).toBe('completed');
      expect(isTerminalStage(finalStatus.currentStage)).toBe(true);
      expect(finalStatus.completedTiers).toEqual(['tier1', 'tier2', 'tier3', 'tier4']);
    });
  });

  describe('Gate Blocking Scenarios', () => {
    const INITIATIVE_ID = 'INI-GATE-BLOCK';

    async function createBlockedInitiative(): Promise<string> {
      const initPath = join(TEST_DIR, INITIATIVE_ID);
      await mkdir(initPath, { recursive: true });
      await mkdir(join(initPath, 'tier1'), { recursive: true });

      const state: InitiativeState = {
        metadata: {
          id: INITIATIVE_ID,
          title: 'Gate Blocking Test',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          mode: 'strict',
          allow_overlap: false,
        },
        stage: 'tier1_active',
        history: [],
        escalations: [],
        blockers: [],
      };

      await writeFile(join(initPath, 'state.yaml'), stringifyYaml(state));
      return initPath;
    }

    it('should block transition when vision_aligned is false', async () => {
      const initPath = await createBlockedInitiative();

      await writeFile(
        join(initPath, 'tier1', 'strategic-mandate.md'),
        `---
vision_aligned: false
sponsor: Someone
success_metrics: [KPI1]
---
# Mandate
`
      );

      const gateResult = await checkGate(INITIATIVE_ID, 'strategic', schema, TEST_DIR);
      expect(gateResult.passed).toBe(false);
      expect(gateResult.failingCriteria.some((c) => c.criterion === 'vision_aligned')).toBe(true);

      const canApprove = await canTransition(
        INITIATIVE_ID,
        'tier1_active',
        'tier1_approved',
        schema,
        TEST_DIR
      );
      expect(canApprove.valid).toBe(false);
      expect(canApprove.reason).toContain('Gate criteria not met');
    });

    it('should block transition when sponsor is missing', async () => {
      const initPath = await createBlockedInitiative();

      await writeFile(
        join(initPath, 'tier1', 'strategic-mandate.md'),
        `---
vision_aligned: true
sponsor: null
success_metrics: [KPI1]
---
# Mandate
`
      );

      const gateResult = await checkGate(INITIATIVE_ID, 'strategic', schema, TEST_DIR);
      expect(gateResult.passed).toBe(false);
      expect(gateResult.failingCriteria.some((c) => c.criterion === 'sponsor_identified')).toBe(
        true
      );
    });

    it('should block when epics missing MoSCoW field', async () => {
      const initPath = await createBlockedInitiative();

      // Setup Tier 1 (complete)
      await writeFile(
        join(initPath, 'tier1', 'strategic-mandate.md'),
        `---
vision_aligned: true
sponsor: CEO
success_metrics: [KPI1]
---
# Mandate
`
      );

      // Setup Tier 2 with incomplete epic
      await mkdir(join(initPath, 'tier2', 'epics'), { recursive: true });
      await writeFile(join(initPath, 'tier2', 'prd.md'), '---\n---\n# PRD');
      await writeFile(
        join(initPath, 'tier2', 'epics', 'EP-001.yaml'),
        stringifyYaml({
          id: 'EP-001',
          title: 'Missing MoSCoW',
          // No moscow field!
        })
      );

      const gateResult = await checkGate(INITIATIVE_ID, 'product', schema, TEST_DIR);
      expect(gateResult.passed).toBe(false);
      expect(gateResult.failingCriteria.some((c) => c.criterion === 'moscow_applied')).toBe(true);
    });
  });

  describe('Escalation Scenarios', () => {
    const INITIATIVE_ID = 'INI-ESCALATION';

    it('should block gate when unresolved escalation exists', async () => {
      const initPath = join(TEST_DIR, INITIATIVE_ID);
      await mkdir(initPath, { recursive: true });
      await mkdir(join(initPath, 'tier1'), { recursive: true });

      // Create state with unresolved escalation
      const state: InitiativeState = {
        metadata: {
          id: INITIATIVE_ID,
          title: 'Escalation Test',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          mode: 'strict',
          allow_overlap: false,
        },
        stage: 'tier1_active',
        history: [],
        escalations: [
          {
            id: 'ESC-001',
            from_tier: 'tier1',
            to_tier: 'tier1',
            severity: 'high',
            reason: 'Budget concerns',
            created_at: new Date().toISOString(),
            // No resolved_at - unresolved!
          },
        ],
        blockers: [],
      };

      await writeFile(join(initPath, 'state.yaml'), stringifyYaml(state));

      // Create valid strategic mandate
      await writeFile(
        join(initPath, 'tier1', 'strategic-mandate.md'),
        `---
vision_aligned: true
sponsor: CEO
success_metrics: [KPI1]
---
# Mandate
`
      );

      // Gate should fail due to unresolved escalation
      const gateResult = await checkGate(INITIATIVE_ID, 'strategic', schema, TEST_DIR);
      expect(gateResult.passed).toBe(false);
      expect(
        gateResult.failingCriteria.some((c) => c.criterion === 'no_unresolved_escalations')
      ).toBe(true);
    });

    it('should pass gate when escalation is resolved', async () => {
      const initPath = join(TEST_DIR, INITIATIVE_ID);
      await mkdir(initPath, { recursive: true });
      await mkdir(join(initPath, 'tier1'), { recursive: true });

      // Create state with resolved escalation
      const state: InitiativeState = {
        metadata: {
          id: INITIATIVE_ID,
          title: 'Escalation Test',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          mode: 'strict',
          allow_overlap: false,
        },
        stage: 'tier1_active',
        history: [],
        escalations: [
          {
            id: 'ESC-001',
            from_tier: 'tier1',
            to_tier: 'tier1',
            severity: 'high',
            reason: 'Budget concerns',
            created_at: new Date().toISOString(),
            resolved_at: new Date().toISOString(),
            resolution: 'Budget approved',
          },
        ],
        blockers: [],
      };

      await writeFile(join(initPath, 'state.yaml'), stringifyYaml(state));

      await writeFile(
        join(initPath, 'tier1', 'strategic-mandate.md'),
        `---
vision_aligned: true
sponsor: CEO
success_metrics: [KPI1]
---
# Mandate
`
      );

      const gateResult = await checkGate(INITIATIVE_ID, 'strategic', schema, TEST_DIR);
      expect(gateResult.passed).toBe(true);
    });
  });

  describe('Copy Fixture and Progress', () => {
    it('should correctly assess INI-TEST-004 (partial tier3)', async () => {
      // Copy fixture to temp dir for testing
      await cp(join(FIXTURES_DIR, 'INI-TEST-004'), join(TEST_DIR, 'INI-TEST-004'), {
        recursive: true,
      });

      const status = await getInitiativeStatus('INI-TEST-004', schema, TEST_DIR);

      expect(status.currentStage).toBe('tier3_active');
      expect(status.completedTiers).toContain('tier1');
      expect(status.completedTiers).toContain('tier2');
      expect(status.completedTiers).not.toContain('tier3');

      // Tier 3 should have some done and some pending
      const tier3Artifacts = status.artifacts.filter((a) => a.tier === 'tier3');
      expect(tier3Artifacts.some((a) => a.status === 'done')).toBe(true);
    });

    it('should correctly identify next action for incomplete initiative', async () => {
      await cp(join(FIXTURES_DIR, 'INI-TEST-002'), join(TEST_DIR, 'INI-TEST-002'), {
        recursive: true,
      });

      const status = await getInitiativeStatus('INI-TEST-002', schema, TEST_DIR);

      expect(status.nextAction).not.toBeNull();
      expect(status.nextAction?.artifact).toBe('prd');
      expect(status.nextAction?.tier).toBe('tier2');
    });
  });

  describe('Tier Status Queries', () => {
    it('should calculate correct completion percentage', async () => {
      await cp(join(FIXTURES_DIR, 'INI-TEST-004'), join(TEST_DIR, 'INI-TEST-004'), {
        recursive: true,
      });

      const tier1Status = await getTierStatus('INI-TEST-004', 'tier1', schema, TEST_DIR);
      expect(tier1Status.completionPct).toBe(100);
      expect(tier1Status.isBlocked).toBe(false);

      const tier3Status = await getTierStatus('INI-TEST-004', 'tier3', schema, TEST_DIR);
      expect(tier3Status.completionPct).toBeGreaterThan(0);
      expect(tier3Status.completionPct).toBeLessThan(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty initiative directory gracefully', async () => {
      const initPath = join(TEST_DIR, 'INI-EMPTY');
      await mkdir(initPath, { recursive: true });

      const state: InitiativeState = {
        metadata: {
          id: 'INI-EMPTY',
          title: 'Empty Initiative',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          mode: 'strict',
          allow_overlap: false,
        },
        stage: 'draft',
        history: [],
        escalations: [],
        blockers: [],
      };

      await writeFile(join(initPath, 'state.yaml'), stringifyYaml(state));

      const status = await getInitiativeStatus('INI-EMPTY', schema, TEST_DIR);
      expect(status.artifacts.filter((a) => a.status === 'done')).toHaveLength(0);
      expect(status.nextAction?.artifact).toBe('strategic-mandate');
    });

    it('should not allow invalid stage transitions', async () => {
      const initPath = join(TEST_DIR, 'INI-INVALID');
      await mkdir(initPath, { recursive: true });

      const state: InitiativeState = {
        metadata: {
          id: 'INI-INVALID',
          title: 'Invalid Transition Test',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          mode: 'strict',
          allow_overlap: false,
        },
        stage: 'draft',
        history: [],
        escalations: [],
        blockers: [],
      };

      await writeFile(join(initPath, 'state.yaml'), stringifyYaml(state));

      // Try to jump directly to tier3
      const result = await applyTransition('INI-INVALID', 'draft', 'tier3_active', schema, TEST_DIR);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid transition');
    });

    it('should reject transition when current stage mismatch', async () => {
      const initPath = join(TEST_DIR, 'INI-MISMATCH');
      await mkdir(initPath, { recursive: true });

      const state: InitiativeState = {
        metadata: {
          id: 'INI-MISMATCH',
          title: 'Stage Mismatch Test',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          mode: 'strict',
          allow_overlap: false,
        },
        stage: 'tier1_active', // Actually in tier1_active
        history: [],
        escalations: [],
        blockers: [],
      };

      await writeFile(join(initPath, 'state.yaml'), stringifyYaml(state));

      // Try to transition from draft (wrong current stage)
      const result = await applyTransition(
        'INI-MISMATCH',
        'draft',
        'tier1_active',
        schema,
        TEST_DIR
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('Current stage is tier1_active, expected draft');
    });
  });

  describe('Next Stage Helper', () => {
    it('should return correct next stage in happy path', () => {
      expect(getNextStage('draft')).toBe('tier1_active');
      expect(getNextStage('tier1_active')).toBe('tier1_approved');
      expect(getNextStage('tier1_approved')).toBe('tier2_active');
      expect(getNextStage('tier4_approved')).toBe('completed');
      expect(getNextStage('completed')).toBeNull();
      expect(getNextStage('cancelled')).toBeNull();
    });

    it('should identify terminal stages', () => {
      expect(isTerminalStage('completed')).toBe(true);
      expect(isTerminalStage('cancelled')).toBe(true);
      expect(isTerminalStage('tier1_active')).toBe(false);
      expect(isTerminalStage('tier4_approved')).toBe(false);
    });
  });
});
