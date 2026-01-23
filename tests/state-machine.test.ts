/**
 * State Machine Tests
 * Tests for stage transitions and validation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { loadSchema } from '../openspec/lib/schema.js';
import {
  getCurrentStage,
  getValidTransitions,
  isValidTransition,
  canTransition,
  getNextStage,
  getEscalationTarget,
  isTerminalStage,
  isBlockedStage,
  isApprovedStage,
} from '../openspec/lib/state-machine.js';
import type { Schema } from '../openspec/lib/types.js';

describe('State Machine', () => {
  let schema: Schema;

  beforeAll(async () => {
    schema = await loadSchema('initiative-flow');
  });

  describe('Stage Detection', () => {
    it('should detect draft stage for new initiative', async () => {
      const stage = await getCurrentStage('INI-TEST-001');
      expect(stage).toBe('draft');
    });

    it('should detect tier1_approved after strategic gate passed', async () => {
      const stage = await getCurrentStage('INI-TEST-002');
      expect(stage).toBe('tier1_approved');
    });

    it('should detect tier2_approved after product gate passed', async () => {
      const stage = await getCurrentStage('INI-TEST-003');
      expect(stage).toBe('tier2_approved');
    });

    it('should detect tier3_active for in-progress tier 3', async () => {
      const stage = await getCurrentStage('INI-TEST-004');
      expect(stage).toBe('tier3_active');
    });

    it('should detect completed for fully done initiative', async () => {
      const stage = await getCurrentStage('INI-TEST-005');
      expect(stage).toBe('completed');
    });

    it('should detect tier1_active for initiatives in strategic review', async () => {
      const stage = await getCurrentStage('INI-TEST-FAILING-GATE');
      expect(stage).toBe('tier1_active');
    });
  });

  describe('Valid Transitions', () => {
    it('should allow draft -> tier1_active', () => {
      const transitions = getValidTransitions('draft');
      expect(transitions).toContain('tier1_active');
    });

    it('should allow draft -> cancelled', () => {
      const transitions = getValidTransitions('draft');
      expect(transitions).toContain('cancelled');
    });

    it('should allow tier1_active -> tier1_approved (advance)', () => {
      const transitions = getValidTransitions('tier1_active');
      expect(transitions).toContain('tier1_approved');
    });

    it('should allow tier1_active -> tier1_blocked (block)', () => {
      const transitions = getValidTransitions('tier1_active');
      expect(transitions).toContain('tier1_blocked');
    });

    it('should allow tier2_active -> tier1_active (escalate)', () => {
      const transitions = getValidTransitions('tier2_active');
      expect(transitions).toContain('tier1_active');
    });

    it('should not allow transitions from terminal states', () => {
      const completedTransitions = getValidTransitions('completed');
      const cancelledTransitions = getValidTransitions('cancelled');

      expect(completedTransitions).toHaveLength(0);
      expect(cancelledTransitions).toHaveLength(0);
    });

    it('should allow tier4_review -> tier4_approved', () => {
      const transitions = getValidTransitions('tier4_review');
      expect(transitions).toContain('tier4_approved');
    });

    it('should allow tier4_review -> tier4_active (changes requested)', () => {
      const transitions = getValidTransitions('tier4_review');
      expect(transitions).toContain('tier4_active');
    });
  });

  describe('Transition Validation', () => {
    it('should validate transition is structurally valid', () => {
      expect(isValidTransition('draft', 'tier1_active')).toBe(true);
      expect(isValidTransition('tier1_active', 'tier1_approved')).toBe(true);
    });

    it('should reject structurally invalid transition', () => {
      expect(isValidTransition('draft', 'tier3_active')).toBe(false);
      expect(isValidTransition('tier1_active', 'tier4_approved')).toBe(false);
    });

    it('should validate transition with gate check', async () => {
      // INI-TEST-002 has passed strategic criteria
      const validation = await canTransition('INI-TEST-002', 'tier1_active', 'tier1_approved', schema);
      expect(validation.valid).toBe(true);
    });

    it('should reject transition when gate not passed', async () => {
      // INI-TEST-FAILING-GATE has not passed strategic gate (vision_aligned: false)
      const validation = await canTransition('INI-TEST-FAILING-GATE', 'tier1_active', 'tier1_approved', schema);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toContain('Gate criteria not met');
    });

    it('should reject invalid structural transition', async () => {
      const validation = await canTransition('INI-TEST-001', 'tier1_active', 'tier3_active', schema);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toContain('Invalid transition');
    });
  });

  describe('Next Stage Helpers', () => {
    it('should return correct next stage in happy path', () => {
      expect(getNextStage('draft')).toBe('tier1_active');
      expect(getNextStage('tier1_active')).toBe('tier1_approved');
      expect(getNextStage('tier1_approved')).toBe('tier2_active');
      expect(getNextStage('tier4_approved')).toBe('completed');
    });

    it('should return null for terminal stages', () => {
      expect(getNextStage('completed')).toBeNull();
      expect(getNextStage('cancelled')).toBeNull();
    });

    it('should return unblock path for blocked stages', () => {
      expect(getNextStage('tier1_blocked')).toBe('tier1_active');
      expect(getNextStage('tier2_blocked')).toBe('tier2_active');
    });
  });

  describe('Escalation Targets', () => {
    it('should return correct escalation target', () => {
      expect(getEscalationTarget('tier2_active')).toBe('tier1_active');
      expect(getEscalationTarget('tier3_active')).toBe('tier2_active');
      expect(getEscalationTarget('tier4_active')).toBe('tier3_active');
    });

    it('should return null when no escalation possible', () => {
      expect(getEscalationTarget('tier1_active')).toBeNull();
      expect(getEscalationTarget('draft')).toBeNull();
      expect(getEscalationTarget('completed')).toBeNull();
    });

    it('should return escalation target for blocked stages', () => {
      expect(getEscalationTarget('tier2_blocked')).toBe('tier1_active');
      expect(getEscalationTarget('tier3_blocked')).toBe('tier2_active');
    });
  });

  describe('Stage Type Helpers', () => {
    it('should identify terminal stages', () => {
      expect(isTerminalStage('completed')).toBe(true);
      expect(isTerminalStage('cancelled')).toBe(true);
      expect(isTerminalStage('tier1_active')).toBe(false);
    });

    it('should identify blocked stages', () => {
      expect(isBlockedStage('tier1_blocked')).toBe(true);
      expect(isBlockedStage('tier2_blocked')).toBe(true);
      expect(isBlockedStage('tier1_active')).toBe(false);
    });

    it('should identify approved stages', () => {
      expect(isApprovedStage('tier1_approved')).toBe(true);
      expect(isApprovedStage('tier4_approved')).toBe(true);
      expect(isApprovedStage('tier1_active')).toBe(false);
    });
  });
});
