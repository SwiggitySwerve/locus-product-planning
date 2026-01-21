/**
 * Core types for the Initiative Flow system
 * OpenSpec-aligned type definitions
 */

// ============================================================================
// Artifact States (OpenSpec pattern)
// ============================================================================

export type ArtifactStatus = 'blocked' | 'ready' | 'done';

export type StageStatus = 
  | 'draft'
  | 'tier1_active' | 'tier1_approved' | 'tier1_blocked'
  | 'tier2_active' | 'tier2_approved' | 'tier2_blocked'
  | 'tier3_active' | 'tier3_approved' | 'tier3_blocked'
  | 'tier4_active' | 'tier4_review' | 'tier4_approved' | 'tier4_blocked'
  | 'completed' | 'cancelled';

export type TierId = 'tier1' | 'tier2' | 'tier3' | 'tier4';

export type GateId = 'strategic' | 'product' | 'design' | 'implementation';

export type MoSCoW = 'must' | 'should' | 'could' | 'wont';

// ============================================================================
// Schema Definitions
// ============================================================================

export interface TierDefinition {
  id: TierId;
  name: string;
  council: string;
  coordinator?: string;
  skills: string[] | Record<string, string[]>;
}

export interface ArtifactDefinition {
  id: string;
  tier: TierId;
  generates: string;  // File path or glob pattern
  template: string;
  description: string;
  instruction: string;
  requires: string[];  // Dependency artifact IDs
  gate?: GateId;       // Gate this artifact contributes to
}

export interface GateCriterion {
  id?: string;
  check: 'file_exists' | 'glob_min_count' | 'field_value' | 'field_not_empty' | 'all_have_field' | 'all_have_field_value';
  path?: string;
  pattern?: string;
  field?: string;
  expected?: unknown;
  not_empty?: boolean;
  min?: number;
  description?: string;
}

export interface GateDefinition {
  id: GateId;
  description: string;
  from_artifacts: string[];
  to_tier?: TierId;
  terminal?: boolean;
  criteria: GateCriterion[];
}

export interface Schema {
  name: string;
  version: number;
  description: string;
  tiers: TierDefinition[];
  artifacts: ArtifactDefinition[];
  gates: Record<GateId, GateDefinition>;
  apply: {
    requires: string[];
    tracks: string;
    instruction: string;
  };
  archive: {
    destination: string;
    update_specs: boolean;
  };
}

// ============================================================================
// Initiative State
// ============================================================================

export interface InitiativeMetadata {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  mode: 'strict' | 'auto';
  allow_overlap: boolean;
}

export interface StageTransition {
  from: StageStatus;
  to: StageStatus;
  timestamp: string;
  gate?: GateId;
  actor?: string;
}

export interface Escalation {
  id: string;
  from_tier: TierId;
  to_tier: TierId;
  severity: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  created_at: string;
  resolved_at?: string;
  resolution?: string;
}

export interface InitiativeState {
  metadata: InitiativeMetadata;
  stage: StageStatus;
  history: StageTransition[];
  escalations: Escalation[];
  blockers: string[];
}

// ============================================================================
// Status Query Results
// ============================================================================

export interface ArtifactStatusResult {
  id: string;
  tier: TierId;
  status: ArtifactStatus;
  path?: string;
  paths?: string[];
  missingDeps: string[];
  description: string;
}

export interface TierStatusResult {
  tier: TierId;
  name: string;
  council: string;
  artifacts: ArtifactStatusResult[];
  completionPct: number;
  isBlocked: boolean;
  blockedBy: string[];
}

export interface GateCriterionResult {
  criterion: string;
  check: string;
  passed: boolean;
  reason?: string;
  expected?: unknown;
  actual?: unknown;
  found?: number;
  checked?: number;
  missing?: string[];
}

export interface GateCheckResult {
  gate: GateId;
  passed: boolean;
  criteria: GateCriterionResult[];
  criteriaMet: number;
  criteriaTotal: number;
  failingCriteria: GateCriterionResult[];
}

export interface NextAction {
  artifact: string;
  tier: TierId;
  description: string;
  generates: string;
}

export interface InitiativeStatusResult {
  initiative: string;
  title: string;
  currentStage: StageStatus;
  currentTier: TierId | null;
  completedTiers: TierId[];
  artifacts: ArtifactStatusResult[];
  gates: {
    id: GateId;
    status: 'passed' | 'pending' | 'blocked';
    passedAt?: string;
    criteriaMet?: number;
    criteriaTotal?: number;
  }[];
  escalations: Escalation[];
  blockers: string[];
  nextAction: NextAction | null;
  isComplete: boolean;
}

// ============================================================================
// State Machine
// ============================================================================

export interface TransitionValidation {
  valid: boolean;
  reason?: string;
  gateCheck?: GateCheckResult;
}

export interface TransitionResult {
  success: boolean;
  previousStage: StageStatus;
  newStage: StageStatus;
  error?: string;
}

// ============================================================================
// Config
// ============================================================================

export interface ProjectConfig {
  schema: string;
  context: string;
  rules: Record<string, string[]>;
  gates: {
    mode: 'strict' | 'auto' | 'configurable';
  };
  escalation: {
    auto_escalate: {
      scope_increase_percent: number;
      timeline_slip_days: number;
      blocker_unresolved_hours: number;
    };
  };
}
