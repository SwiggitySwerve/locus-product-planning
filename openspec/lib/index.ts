/**
 * Initiative Flow Framework
 * OpenSpec-aligned orchestration for organizational workflows
 */

// Types
export type {
  // Core states
  ArtifactStatus,
  StageStatus,
  TierId,
  GateId,
  MoSCoW,

  // Schema definitions
  TierDefinition,
  ArtifactDefinition,
  GateCriterion,
  GateDefinition,
  Schema,

  // Initiative state
  InitiativeMetadata,
  StageTransition,
  Escalation,
  InitiativeState,

  // Status query results
  ArtifactStatusResult,
  TierStatusResult,
  GateCriterionResult,
  GateCheckResult,
  NextAction,
  InitiativeStatusResult,

  // State machine
  TransitionValidation,
  TransitionResult,

  // Config
  ProjectConfig,
} from './types.js';

// Schema utilities
export {
  loadSchema,
  getArtifactDef,
  getTierArtifacts,
  getTierDef,
  getGateDef,
  getDependents,
  getArtifactOrder,
  getTierOrder,
} from './schema.js';

// Status queries
export {
  getInitiativePath,
  loadInitiativeState,
  getArtifactStatus,
  getAllArtifactStatuses,
  getTierStatus,
  getInitiativeStatus,
} from './status.js';

// Gate checks
export {
  checkCriterion,
  checkGate,
  canPassGate,
} from './gates.js';

// State machine
export {
  getCurrentStage,
  getValidTransitions,
  isValidTransition,
  canTransition,
  applyTransition,
  getNextStage,
  getEscalationTarget,
  isTerminalStage,
  isBlockedStage,
  isApprovedStage,
} from './state-machine.js';
