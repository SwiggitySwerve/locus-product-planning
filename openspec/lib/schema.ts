/**
 * Schema loader for Initiative Flow
 * Loads and validates schema definitions from YAML files
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import type { Schema, ArtifactDefinition, GateDefinition, TierDefinition, GateId } from './types.js';

// Base path for openspec directory
const OPENSPEC_BASE = join(process.cwd(), 'openspec');
const SCHEMAS_DIR = join(OPENSPEC_BASE, 'schemas');

/**
 * Load a schema by name
 */
export async function loadSchema(schemaName: string): Promise<Schema> {
  const schemaPath = join(SCHEMAS_DIR, schemaName, 'schema.yaml');
  
  try {
    const content = await readFile(schemaPath, 'utf-8');
    const raw = parseYaml(content);
    return validateSchema(raw, schemaName);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Schema '${schemaName}' not found at ${schemaPath}`);
    }
    throw error;
  }
}

/**
 * Validate and transform raw schema YAML to typed Schema
 */
function validateSchema(raw: unknown, schemaName: string): Schema {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Invalid schema: ${schemaName}`);
  }

  const obj = raw as Record<string, unknown>;

  // Validate required fields
  if (!obj.name || typeof obj.name !== 'string') {
    throw new Error(`Schema ${schemaName} missing 'name' field`);
  }
  if (!obj.version || typeof obj.version !== 'number') {
    throw new Error(`Schema ${schemaName} missing 'version' field`);
  }
  if (!Array.isArray(obj.artifacts)) {
    throw new Error(`Schema ${schemaName} missing 'artifacts' array`);
  }
  if (!obj.gates || typeof obj.gates !== 'object') {
    throw new Error(`Schema ${schemaName} missing 'gates' object`);
  }

  // Build tiers array
  const tiers: TierDefinition[] = Array.isArray(obj.tiers) 
    ? obj.tiers as TierDefinition[]
    : [];

  // Build artifacts array
  const artifacts: ArtifactDefinition[] = (obj.artifacts as unknown[]).map((a, i) => {
    const artifact = a as Record<string, unknown>;
    if (!artifact.id || !artifact.generates) {
      throw new Error(`Artifact ${i} missing required fields`);
    }
    return {
      id: artifact.id as string,
      tier: artifact.tier as string,
      generates: artifact.generates as string,
      template: artifact.template as string || '',
      description: artifact.description as string || '',
      instruction: artifact.instruction as string || '',
      requires: Array.isArray(artifact.requires) ? artifact.requires as string[] : [],
      gate: artifact.gate as GateId | undefined,
    } as ArtifactDefinition;
  });

  // Build gates record
  const gates: Record<GateId, GateDefinition> = {} as Record<GateId, GateDefinition>;
  const rawGates = obj.gates as Record<string, unknown>;
  for (const [gateId, gateDef] of Object.entries(rawGates)) {
    const g = gateDef as Record<string, unknown>;
    gates[gateId as GateId] = {
      id: gateId as GateId,
      description: g.description as string || '',
      from_artifacts: Array.isArray(g.from_artifacts) ? g.from_artifacts as string[] : [],
      to_tier: g.to_tier as string | undefined,
      terminal: g.terminal as boolean | undefined,
      criteria: Array.isArray(g.criteria) ? g.criteria : [],
    } as GateDefinition;
  }

  return {
    name: obj.name as string,
    version: obj.version as number,
    description: obj.description as string || '',
    tiers,
    artifacts,
    gates,
    apply: obj.apply as Schema['apply'] || { requires: [], tracks: '', instruction: '' },
    archive: obj.archive as Schema['archive'] || { destination: '', update_specs: false },
  };
}

/**
 * Get artifact definition by ID
 */
export function getArtifactDef(schema: Schema, artifactId: string): ArtifactDefinition | undefined {
  return schema.artifacts.find(a => a.id === artifactId);
}

/**
 * Get all artifacts for a tier
 */
export function getTierArtifacts(schema: Schema, tierId: string): ArtifactDefinition[] {
  return schema.artifacts.filter(a => a.tier === tierId);
}

/**
 * Get tier definition by ID
 */
export function getTierDef(schema: Schema, tierId: string): TierDefinition | undefined {
  return schema.tiers.find(t => t.id === tierId);
}

/**
 * Get gate definition by ID
 */
export function getGateDef(schema: Schema, gateId: GateId): GateDefinition | undefined {
  return schema.gates[gateId];
}

/**
 * Get artifacts that depend on a given artifact
 */
export function getDependents(schema: Schema, artifactId: string): ArtifactDefinition[] {
  return schema.artifacts.filter(a => a.requires.includes(artifactId));
}

/**
 * Topological sort of artifacts based on dependencies
 */
export function getArtifactOrder(schema: Schema): string[] {
  const visited = new Set<string>();
  const order: string[] = [];

  function visit(artifactId: string) {
    if (visited.has(artifactId)) return;
    visited.add(artifactId);

    const artifact = getArtifactDef(schema, artifactId);
    if (!artifact) return;

    for (const dep of artifact.requires) {
      visit(dep);
    }
    order.push(artifactId);
  }

  for (const artifact of schema.artifacts) {
    visit(artifact.id);
  }

  return order;
}

/**
 * Get the tier order (tier1 -> tier2 -> tier3 -> tier4)
 */
export function getTierOrder(): string[] {
  return ['tier1', 'tier2', 'tier3', 'tier4'];
}
