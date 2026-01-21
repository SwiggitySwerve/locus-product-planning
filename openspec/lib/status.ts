/**
 * Status Query Engine for Initiative Flow
 * Deterministic status queries based on filesystem state
 */

import { readFile, access } from 'fs/promises';
import { join } from 'path';
import { glob } from 'glob';
import { parse as parseYaml } from 'yaml';
import { loadSchema, getArtifactDef, getTierArtifacts, getTierDef, getArtifactOrder } from './schema.js';
import type {
  Schema,
  ArtifactStatus,
  ArtifactStatusResult,
  TierStatusResult,
  InitiativeStatusResult,
  InitiativeState,
  TierId,
  NextAction,
  StageStatus,
  GateId,
} from './types.js';

// Default fixtures path for testing
const FIXTURES_PATH = join(process.cwd(), 'tests', 'fixtures');

/**
 * Get the base path for an initiative
 */
export function getInitiativePath(initiativeId: string, basePath?: string): string {
  return join(basePath || FIXTURES_PATH, initiativeId);
}

/**
 * Check if a file exists
 */
async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load initiative state from state.yaml
 */
export async function loadInitiativeState(initiativeId: string, basePath?: string): Promise<InitiativeState> {
  const statePath = join(getInitiativePath(initiativeId, basePath), 'state.yaml');
  const content = await readFile(statePath, 'utf-8');
  return parseYaml(content) as InitiativeState;
}

/**
 * Get files matching a glob pattern within an initiative
 */
async function getMatchingFiles(initiativeId: string, pattern: string, basePath?: string): Promise<string[]> {
  const initPath = getInitiativePath(initiativeId, basePath);
  const fullPattern = join(initPath, pattern).replace(/\\/g, '/');
  const files = await glob(fullPattern);
  // Return relative paths
  return files.map(f => f.replace(initPath.replace(/\\/g, '/') + '/', ''));
}

/**
 * Check if an artifact is done (file/files exist)
 */
async function isArtifactDone(
  initiativeId: string,
  generates: string,
  basePath?: string
): Promise<{ done: boolean; paths: string[] }> {
  const initPath = getInitiativePath(initiativeId, basePath);
  
  // Check if it's a glob pattern
  if (generates.includes('*')) {
    const files = await getMatchingFiles(initiativeId, generates, basePath);
    return { done: files.length > 0, paths: files };
  }
  
  // Single file check
  const filePath = join(initPath, generates);
  const exists = await fileExists(filePath);
  return { done: exists, paths: exists ? [generates] : [] };
}

/**
 * Get the status of a single artifact
 */
export async function getArtifactStatus(
  initiativeId: string,
  artifactId: string,
  schema: Schema,
  basePath?: string
): Promise<ArtifactStatusResult> {
  const artifact = getArtifactDef(schema, artifactId);
  if (!artifact) {
    throw new Error(`Artifact '${artifactId}' not found in schema`);
  }

  // Check if artifact files exist (DONE state)
  const { done, paths } = await isArtifactDone(initiativeId, artifact.generates, basePath);
  
  if (done) {
    return {
      id: artifactId,
      tier: artifact.tier as TierId,
      status: 'done',
      path: paths.length === 1 ? paths[0] : undefined,
      paths: paths.length > 1 ? paths : undefined,
      missingDeps: [],
      description: artifact.description,
    };
  }

  // Check dependencies (BLOCKED vs READY)
  const missingDeps: string[] = [];
  for (const depId of artifact.requires) {
    const depArtifact = getArtifactDef(schema, depId);
    if (!depArtifact) continue;
    
    const { done: depDone } = await isArtifactDone(initiativeId, depArtifact.generates, basePath);
    if (!depDone) {
      missingDeps.push(depId);
    }
  }

  const status: ArtifactStatus = missingDeps.length > 0 ? 'blocked' : 'ready';

  return {
    id: artifactId,
    tier: artifact.tier as TierId,
    status,
    paths: [],
    missingDeps,
    description: artifact.description,
  };
}

/**
 * Get status of all artifacts in an initiative
 */
export async function getAllArtifactStatuses(
  initiativeId: string,
  schema: Schema,
  basePath?: string
): Promise<ArtifactStatusResult[]> {
  const order = getArtifactOrder(schema);
  const results: ArtifactStatusResult[] = [];

  for (const artifactId of order) {
    const status = await getArtifactStatus(initiativeId, artifactId, schema, basePath);
    results.push(status);
  }

  return results;
}

/**
 * Get status of a specific tier
 */
export async function getTierStatus(
  initiativeId: string,
  tierId: TierId,
  schema: Schema,
  basePath?: string
): Promise<TierStatusResult> {
  const tierDef = getTierDef(schema, tierId);
  if (!tierDef) {
    throw new Error(`Tier '${tierId}' not found in schema`);
  }

  const tierArtifacts = getTierArtifacts(schema, tierId);
  const artifactStatuses: ArtifactStatusResult[] = [];
  let doneCount = 0;
  const blockedBy: string[] = [];

  for (const artifact of tierArtifacts) {
    const status = await getArtifactStatus(initiativeId, artifact.id, schema, basePath);
    artifactStatuses.push(status);
    
    if (status.status === 'done') {
      doneCount++;
    }
    
    if (status.status === 'blocked') {
      blockedBy.push(...status.missingDeps);
    }
  }

  const completionPct = tierArtifacts.length > 0 
    ? (doneCount / tierArtifacts.length) * 100 
    : 0;

  return {
    tier: tierId,
    name: tierDef.name,
    council: tierDef.council,
    artifacts: artifactStatuses,
    completionPct,
    isBlocked: blockedBy.length > 0,
    blockedBy: [...new Set(blockedBy)], // Unique blockers
  };
}

/**
 * Determine current tier from stage
 */
function getTierFromStage(stage: StageStatus): TierId | null {
  if (stage.startsWith('tier1')) return 'tier1';
  if (stage.startsWith('tier2')) return 'tier2';
  if (stage.startsWith('tier3')) return 'tier3';
  if (stage.startsWith('tier4')) return 'tier4';
  return null;
}

/**
 * Get completed tiers from stage
 */
function getCompletedTiers(stage: StageStatus): TierId[] {
  const tiers: TierId[] = [];
  const tierOrder: TierId[] = ['tier1', 'tier2', 'tier3', 'tier4'];
  
  for (const tier of tierOrder) {
    // A tier is complete if we've moved past its _approved stage
    if (stage === 'completed') {
      tiers.push(tier);
    } else if (stage.startsWith('tier')) {
      const currentTierNum = parseInt(stage.charAt(4));
      const tierNum = parseInt(tier.charAt(4));
      
      // Previous tiers are complete
      if (tierNum < currentTierNum) {
        tiers.push(tier);
      }
      // Current tier is complete if in _approved state
      if (tierNum === currentTierNum && stage.endsWith('_approved')) {
        tiers.push(tier);
      }
    }
  }
  
  return tiers;
}

/**
 * Find the next action (first READY artifact)
 */
function findNextAction(artifacts: ArtifactStatusResult[], schema: Schema): NextAction | null {
  // Find first ready artifact in dependency order
  const order = getArtifactOrder(schema);
  
  for (const artifactId of order) {
    const status = artifacts.find(a => a.id === artifactId);
    if (status && status.status === 'ready') {
      const artifact = getArtifactDef(schema, artifactId);
      return {
        artifact: artifactId,
        tier: status.tier,
        description: `Create ${artifactId}`,
        generates: artifact?.generates || '',
      };
    }
  }
  
  return null;
}

/**
 * Get full initiative status
 */
export async function getInitiativeStatus(
  initiativeId: string,
  schema?: Schema,
  basePath?: string
): Promise<InitiativeStatusResult> {
  // Load schema if not provided
  const resolvedSchema = schema || await loadSchema('initiative-flow');
  
  // Load initiative state
  const state = await loadInitiativeState(initiativeId, basePath);
  
  // Get all artifact statuses
  const artifacts = await getAllArtifactStatuses(initiativeId, resolvedSchema, basePath);
  
  // Determine current tier and completed tiers
  const currentTier = getTierFromStage(state.stage);
  const completedTiers = getCompletedTiers(state.stage);
  
  // Build gate status from history
  const gateStatuses: InitiativeStatusResult['gates'] = [];
  const gateOrder: GateId[] = ['strategic', 'product', 'design', 'implementation'];
  
  for (const gateId of gateOrder) {
    const passedEntry = state.history.find(h => h.gate === gateId);
    if (passedEntry) {
      gateStatuses.push({
        id: gateId,
        status: 'passed',
        passedAt: passedEntry.timestamp,
      });
    } else {
      // Determine if pending or blocked
      gateStatuses.push({
        id: gateId,
        status: 'pending',
      });
    }
  }
  
  // Find next action
  const nextAction = state.stage === 'completed' ? null : findNextAction(artifacts, resolvedSchema);
  
  return {
    initiative: initiativeId,
    title: state.metadata.title,
    currentStage: state.stage,
    currentTier,
    completedTiers,
    artifacts,
    gates: gateStatuses,
    escalations: state.escalations,
    blockers: state.blockers,
    nextAction,
    isComplete: state.stage === 'completed',
  };
}
