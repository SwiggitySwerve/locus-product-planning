/**
 * State Machine for Initiative Flow
 * Handles stage transitions and validation
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { checkGate } from './gates.js';
import { getInitiativePath, loadInitiativeState } from './status.js';
import type {
  Schema,
  StageStatus,
  GateId,
  TransitionValidation,
  TransitionResult,
  InitiativeState,
} from './types.js';

/**
 * Valid stage transitions
 */
const VALID_TRANSITIONS: Record<StageStatus, StageStatus[]> = {
  // Pre-planning
  draft: ['tier1_active', 'cancelled'],
  
  // Tier 1: Strategic
  tier1_active: ['tier1_approved', 'tier1_blocked', 'cancelled'],
  tier1_approved: ['tier2_active'],
  tier1_blocked: ['tier1_active', 'cancelled'],
  
  // Tier 2: Product
  tier2_active: ['tier2_approved', 'tier2_blocked', 'tier1_active'], // Can escalate back
  tier2_approved: ['tier3_active'],
  tier2_blocked: ['tier2_active', 'tier1_active'],
  
  // Tier 3: Architecture
  tier3_active: ['tier3_approved', 'tier3_blocked', 'tier2_active'],
  tier3_approved: ['tier4_active'],
  tier3_blocked: ['tier3_active', 'tier2_active'],
  
  // Tier 4: Implementation
  tier4_active: ['tier4_review', 'tier4_blocked', 'tier3_active'],
  tier4_review: ['tier4_approved', 'tier4_active'],
  tier4_approved: ['completed'],
  tier4_blocked: ['tier4_active', 'tier3_active'],
  
  // Terminal states
  completed: [],
  cancelled: [],
};

/**
 * Gate required for transition
 */
const GATE_REQUIREMENTS: Partial<Record<StageStatus, GateId>> = {
  tier1_approved: 'strategic',
  tier2_approved: 'product',
  tier3_approved: 'design',
  tier4_approved: 'implementation',
};

/**
 * Get the current stage from initiative state
 */
export async function getCurrentStage(
  initiativeId: string,
  basePath?: string
): Promise<StageStatus> {
  const state = await loadInitiativeState(initiativeId, basePath);
  return state.stage;
}

/**
 * Get valid transitions from a stage
 */
export function getValidTransitions(stage: StageStatus): StageStatus[] {
  return VALID_TRANSITIONS[stage] || [];
}

/**
 * Check if a transition is structurally valid
 */
export function isValidTransition(from: StageStatus, to: StageStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Validate a transition (including gate check if needed)
 */
export async function canTransition(
  initiativeId: string,
  from: StageStatus,
  to: StageStatus,
  schema?: Schema,
  basePath?: string
): Promise<TransitionValidation> {
  // Check if structurally valid
  if (!isValidTransition(from, to)) {
    return {
      valid: false,
      reason: `Invalid transition: ${from} -> ${to}. Valid transitions: ${VALID_TRANSITIONS[from]?.join(', ') || 'none'}`,
    };
  }
  
  // Check if gate is required
  const requiredGate = GATE_REQUIREMENTS[to];
  if (requiredGate && schema) {
    const gateResult = await checkGate(initiativeId, requiredGate, schema, basePath);
    if (!gateResult.passed) {
      return {
        valid: false,
        reason: `Gate criteria not met for '${requiredGate}': ${gateResult.failingCriteria.map(c => c.criterion).join(', ')}`,
        gateCheck: gateResult,
      };
    }
  }
  
  return { valid: true };
}

/**
 * Apply a stage transition
 */
export async function applyTransition(
  initiativeId: string,
  from: StageStatus,
  to: StageStatus,
  schema?: Schema,
  basePath?: string
): Promise<TransitionResult> {
  // Validate first
  const validation = await canTransition(initiativeId, from, to, schema, basePath);
  if (!validation.valid) {
    return {
      success: false,
      previousStage: from,
      newStage: from,
      error: validation.reason,
    };
  }
  
  // Load current state
  const statePath = join(getInitiativePath(initiativeId, basePath), 'state.yaml');
  const state = await loadInitiativeState(initiativeId, basePath);
  
  // Verify current stage matches
  if (state.stage !== from) {
    return {
      success: false,
      previousStage: state.stage,
      newStage: state.stage,
      error: `Current stage is ${state.stage}, expected ${from}`,
    };
  }
  
  // Apply transition
  const previousStage = state.stage;
  state.stage = to;
  state.metadata.updated_at = new Date().toISOString();
  
  // Record in history
  const historyEntry = {
    from: previousStage,
    to,
    timestamp: new Date().toISOString(),
    gate: GATE_REQUIREMENTS[to],
  };
  state.history.push(historyEntry);
  
  // Write updated state
  await writeFile(statePath, stringifyYaml(state), 'utf-8');
  
  return {
    success: true,
    previousStage,
    newStage: to,
  };
}

/**
 * Get the next stage in the happy path
 */
export function getNextStage(current: StageStatus): StageStatus | null {
  const happyPath: Record<StageStatus, StageStatus | null> = {
    draft: 'tier1_active',
    tier1_active: 'tier1_approved',
    tier1_approved: 'tier2_active',
    tier1_blocked: 'tier1_active',
    tier2_active: 'tier2_approved',
    tier2_approved: 'tier3_active',
    tier2_blocked: 'tier2_active',
    tier3_active: 'tier3_approved',
    tier3_approved: 'tier4_active',
    tier3_blocked: 'tier3_active',
    tier4_active: 'tier4_review',
    tier4_review: 'tier4_approved',
    tier4_approved: 'completed',
    tier4_blocked: 'tier4_active',
    completed: null,
    cancelled: null,
  };
  
  return happyPath[current] ?? null;
}

/**
 * Get the escalation target stage
 */
export function getEscalationTarget(current: StageStatus): StageStatus | null {
  const escalationTargets: Partial<Record<StageStatus, StageStatus>> = {
    tier2_active: 'tier1_active',
    tier2_blocked: 'tier1_active',
    tier3_active: 'tier2_active',
    tier3_blocked: 'tier2_active',
    tier4_active: 'tier3_active',
    tier4_blocked: 'tier3_active',
  };
  
  return escalationTargets[current] ?? null;
}

/**
 * Check if a stage is terminal
 */
export function isTerminalStage(stage: StageStatus): boolean {
  return stage === 'completed' || stage === 'cancelled';
}

/**
 * Check if a stage is blocked
 */
export function isBlockedStage(stage: StageStatus): boolean {
  return stage.endsWith('_blocked');
}

/**
 * Check if a stage is approved (gate passed)
 */
export function isApprovedStage(stage: StageStatus): boolean {
  return stage.endsWith('_approved');
}
