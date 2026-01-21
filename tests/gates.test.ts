/**
 * Gate Criteria Tests
 * Tests for machine-checkable gate validation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { loadSchema } from '../openspec/lib/schema.js';
import { checkCriterion, checkGate, canPassGate } from '../openspec/lib/gates.js';
import type { Schema, GateCriterion } from '../openspec/lib/types.js';

describe('Gate Criteria Checking', () => {
  let schema: Schema;

  beforeAll(async () => {
    schema = await loadSchema('initiative-flow');
  });

  describe('Individual Criteria Checks', () => {
    describe('file_exists', () => {
      it('should pass when file exists', async () => {
        const result = await checkCriterion('INI-TEST-002', {
          check: 'file_exists',
          path: 'tier1/strategic-mandate.md',
        });

        expect(result.passed).toBe(true);
      });

      it('should fail when file does not exist', async () => {
        const result = await checkCriterion('INI-TEST-001', {
          check: 'file_exists',
          path: 'tier1/strategic-mandate.md',
        });

        expect(result.passed).toBe(false);
        expect(result.reason).toContain('not found');
      });
    });

    describe('glob_min_count', () => {
      it('should pass when enough files match', async () => {
        const result = await checkCriterion('INI-TEST-003', {
          check: 'glob_min_count',
          pattern: 'tier2/epics/*.yaml',
          min: 1,
        });

        expect(result.passed).toBe(true);
        expect(result.found).toBe(2);
      });

      it('should fail when not enough files match', async () => {
        const result = await checkCriterion('INI-TEST-001', {
          check: 'glob_min_count',
          pattern: 'tier2/epics/*.yaml',
          min: 1,
        });

        expect(result.passed).toBe(false);
        expect(result.found).toBe(0);
      });
    });

    describe('field_value', () => {
      it('should pass when field has expected value', async () => {
        const result = await checkCriterion('INI-TEST-002', {
          check: 'field_value',
          path: 'tier1/strategic-mandate.md',
          field: 'vision_aligned',
          expected: true,
        });

        expect(result.passed).toBe(true);
      });

      it('should fail when field has wrong value', async () => {
        const result = await checkCriterion('INI-TEST-FAILING-GATE', {
          check: 'field_value',
          path: 'tier1/strategic-mandate.md',
          field: 'vision_aligned',
          expected: true,
        });

        expect(result.passed).toBe(false);
        expect(result.actual).toBe(false);
      });
    });

    describe('field_not_empty', () => {
      it('should pass when field has value', async () => {
        const result = await checkCriterion('INI-TEST-002', {
          check: 'field_not_empty',
          path: 'tier1/strategic-mandate.md',
          field: 'sponsor',
        });

        expect(result.passed).toBe(true);
      });

      it('should fail when field is null', async () => {
        const result = await checkCriterion('INI-TEST-MISSING-SPONSOR', {
          check: 'field_not_empty',
          path: 'tier1/strategic-mandate.md',
          field: 'sponsor',
        });

        expect(result.passed).toBe(false);
      });
    });

    describe('all_have_field', () => {
      it('should pass when all matched files have field', async () => {
        const result = await checkCriterion('INI-TEST-003', {
          check: 'all_have_field',
          pattern: 'tier2/epics/*.yaml',
          field: 'moscow',
        });

        expect(result.passed).toBe(true);
        expect(result.checked).toBe(2);
      });

      it('should fail when some files missing field', async () => {
        const result = await checkCriterion('INI-TEST-PARTIAL-EPICS', {
          check: 'all_have_field',
          pattern: 'tier2/epics/*.yaml',
          field: 'moscow',
        });

        expect(result.passed).toBe(false);
        expect(result.missing).toBeDefined();
        expect(result.missing!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Full Gate Checks', () => {
    it('should pass strategic gate when all criteria met', async () => {
      const result = await checkGate('INI-TEST-002', 'strategic', schema);

      expect(result.gate).toBe('strategic');
      expect(result.passed).toBe(true);
      expect(result.criteriaMet).toBe(result.criteriaTotal);
    });

    it('should fail strategic gate when vision_aligned is false', async () => {
      const result = await checkGate('INI-TEST-FAILING-GATE', 'strategic', schema);

      expect(result.passed).toBe(false);
      expect(result.failingCriteria.length).toBeGreaterThan(0);
      
      const visionCriterion = result.failingCriteria.find(
        c => c.criterion === 'vision_aligned' || c.actual === false
      );
      expect(visionCriterion).toBeDefined();
    });

    it('should fail strategic gate when sponsor is missing', async () => {
      const result = await checkGate('INI-TEST-MISSING-SPONSOR', 'strategic', schema);

      expect(result.passed).toBe(false);
      const sponsorCriterion = result.failingCriteria.find(
        c => c.criterion === 'sponsor_identified'
      );
      expect(sponsorCriterion).toBeDefined();
    });

    it('should pass product gate when PRD and epics exist with moscow', async () => {
      const result = await checkGate('INI-TEST-003', 'product', schema);

      expect(result.gate).toBe('product');
      expect(result.passed).toBe(true);
    });

    it('should fail product gate when epics missing moscow', async () => {
      const result = await checkGate('INI-TEST-PARTIAL-EPICS', 'product', schema);

      expect(result.passed).toBe(false);
      const moscowCriterion = result.failingCriteria.find(
        c => c.criterion === 'moscow_applied'
      );
      expect(moscowCriterion).toBeDefined();
    });
  });

  describe('Gate Passability', () => {
    it('should indicate gate can be passed', async () => {
      const { canPass, result } = await canPassGate('INI-TEST-002', 'strategic', schema);

      expect(canPass).toBe(true);
      expect(result.passed).toBe(true);
    });

    it('should indicate gate cannot be passed with details', async () => {
      const { canPass, result } = await canPassGate('INI-TEST-FAILING-GATE', 'strategic', schema);

      expect(canPass).toBe(false);
      expect(result.failingCriteria.length).toBeGreaterThan(0);
    });
  });
});
