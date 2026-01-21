/**
 * Gate Checker for Initiative Flow
 * Machine-checkable gate criteria validation
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { glob } from 'glob';
import { parse as parseYaml } from 'yaml';
import { getGateDef } from './schema.js';
import { getInitiativePath, loadInitiativeState } from './status.js';
import type {
  Schema,
  GateId,
  GateCriterion,
  GateCriterionResult,
  GateCheckResult,
} from './types.js';

/**
 * Extract frontmatter from markdown file
 */
async function extractFrontmatter(filePath: string): Promise<Record<string, unknown>> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (match) {
      return parseYaml(match[1]) as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Load YAML file
 */
async function loadYamlFile(filePath: string): Promise<Record<string, unknown>> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return parseYaml(content) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * Check if file exists
 */
async function checkFileExists(
  initiativeId: string,
  path: string,
  basePath?: string
): Promise<GateCriterionResult> {
  const filePath = join(getInitiativePath(initiativeId, basePath), path);
  
  try {
    await readFile(filePath);
    return {
      criterion: 'file_exists',
      check: 'file_exists',
      passed: true,
    };
  } catch {
    return {
      criterion: 'file_exists',
      check: 'file_exists',
      passed: false,
      reason: `File not found: ${path}`,
    };
  }
}

/**
 * Check if glob matches minimum count
 */
async function checkGlobMinCount(
  initiativeId: string,
  pattern: string,
  min: number,
  basePath?: string
): Promise<GateCriterionResult> {
  const initPath = getInitiativePath(initiativeId, basePath);
  const fullPattern = join(initPath, pattern).replace(/\\/g, '/');
  const files = await glob(fullPattern);
  
  return {
    criterion: 'glob_min_count',
    check: 'glob_min_count',
    passed: files.length >= min,
    found: files.length,
    expected: min,
    reason: files.length < min ? `Found ${files.length} files, need at least ${min}` : undefined,
  };
}

/**
 * Check if field has expected value
 */
async function checkFieldValue(
  initiativeId: string,
  path: string,
  field: string,
  expected: unknown,
  basePath?: string
): Promise<GateCriterionResult> {
  const filePath = join(getInitiativePath(initiativeId, basePath), path);
  
  let data: Record<string, unknown>;
  if (path.endsWith('.md')) {
    data = await extractFrontmatter(filePath);
  } else {
    data = await loadYamlFile(filePath);
  }
  
  const actual = data[field];
  const passed = actual === expected;
  
  return {
    criterion: 'field_value',
    check: 'field_value',
    passed,
    expected,
    actual,
    reason: !passed ? `Field '${field}' is ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}` : undefined,
  };
}

/**
 * Check if field is not empty
 */
async function checkFieldNotEmpty(
  initiativeId: string,
  path: string,
  field: string,
  basePath?: string
): Promise<GateCriterionResult> {
  const filePath = join(getInitiativePath(initiativeId, basePath), path);
  
  let data: Record<string, unknown>;
  if (path.endsWith('.md')) {
    data = await extractFrontmatter(filePath);
  } else {
    data = await loadYamlFile(filePath);
  }
  
  const value = data[field];
  const isEmpty = value === null || value === undefined || value === '' || 
    (Array.isArray(value) && value.length === 0);
  
  return {
    criterion: 'field_not_empty',
    check: 'field_not_empty',
    passed: !isEmpty,
    actual: value,
    reason: isEmpty ? `Field '${field}' is empty or null` : undefined,
  };
}

/**
 * Check if all files matching pattern have a field
 */
async function checkAllHaveField(
  initiativeId: string,
  pattern: string,
  field: string,
  basePath?: string
): Promise<GateCriterionResult> {
  const initPath = getInitiativePath(initiativeId, basePath);
  const fullPattern = join(initPath, pattern).replace(/\\/g, '/');
  const files = await glob(fullPattern);
  
  if (files.length === 0) {
    return {
      criterion: 'all_have_field',
      check: 'all_have_field',
      passed: false,
      checked: 0,
      reason: `No files found matching pattern: ${pattern}`,
    };
  }
  
  const missing: string[] = [];
  
  for (const file of files) {
    const data = await loadYamlFile(file);
    if (!(field in data) || data[field] === null || data[field] === undefined) {
      // Get relative path
      missing.push(file.replace(initPath.replace(/\\/g, '/') + '/', ''));
    }
  }
  
  return {
    criterion: 'all_have_field',
    check: 'all_have_field',
    passed: missing.length === 0,
    checked: files.length,
    missing: missing.length > 0 ? missing : undefined,
    reason: missing.length > 0 ? `Files missing '${field}': ${missing.join(', ')}` : undefined,
  };
}

/**
 * Check a single criterion
 */
export async function checkCriterion(
  initiativeId: string,
  criterion: GateCriterion,
  basePath?: string
): Promise<GateCriterionResult> {
  switch (criterion.check) {
    case 'file_exists':
      return checkFileExists(initiativeId, criterion.path!, basePath);
      
    case 'glob_min_count':
      return checkGlobMinCount(initiativeId, criterion.pattern!, criterion.min!, basePath);
      
    case 'field_value':
      return checkFieldValue(initiativeId, criterion.path!, criterion.field!, criterion.expected, basePath);
      
    case 'field_not_empty':
      return checkFieldNotEmpty(initiativeId, criterion.path!, criterion.field!, basePath);
      
    case 'all_have_field':
      return checkAllHaveField(initiativeId, criterion.pattern!, criterion.field!, basePath);
      
    case 'all_have_field_value':
      // For simplicity, treat this similar to all_have_field but check value
      return checkAllHaveField(initiativeId, criterion.pattern!, criterion.field!, basePath);
      
    default:
      return {
        criterion: criterion.check,
        check: criterion.check,
        passed: false,
        reason: `Unknown check type: ${criterion.check}`,
      };
  }
}

/**
 * Check all criteria for a gate
 */
export async function checkGate(
  initiativeId: string,
  gateId: GateId,
  schema: Schema,
  basePath?: string
): Promise<GateCheckResult> {
  const gate = getGateDef(schema, gateId);
  if (!gate) {
    throw new Error(`Gate '${gateId}' not found in schema`);
  }
  
  const criteriaResults: GateCriterionResult[] = [];
  const failingCriteria: GateCriterionResult[] = [];
  
  for (const criterion of gate.criteria) {
    const result = await checkCriterion(initiativeId, criterion, basePath);
    // Add criterion ID/description if available
    result.criterion = criterion.id || criterion.description || criterion.check;
    criteriaResults.push(result);
    
    if (!result.passed) {
      failingCriteria.push(result);
    }
  }
  
  // Also check for unresolved escalations
  try {
    const state = await loadInitiativeState(initiativeId, basePath);
    const unresolvedEscalations = state.escalations.filter(e => !e.resolved_at);
    if (unresolvedEscalations.length > 0) {
      const escalationResult: GateCriterionResult = {
        criterion: 'no_unresolved_escalations',
        check: 'escalations',
        passed: false,
        reason: `${unresolvedEscalations.length} unresolved escalation(s)`,
      };
      criteriaResults.push(escalationResult);
      failingCriteria.push(escalationResult);
    }
  } catch {
    // State file might not exist or be readable
  }
  
  const criteriaMet = criteriaResults.filter(c => c.passed).length;
  
  return {
    gate: gateId,
    passed: failingCriteria.length === 0,
    criteria: criteriaResults,
    criteriaMet,
    criteriaTotal: criteriaResults.length,
    failingCriteria,
  };
}

/**
 * Check if an initiative can pass a specific gate
 */
export async function canPassGate(
  initiativeId: string,
  gateId: GateId,
  schema: Schema,
  basePath?: string
): Promise<{ canPass: boolean; result: GateCheckResult }> {
  const result = await checkGate(initiativeId, gateId, schema, basePath);
  return {
    canPass: result.passed,
    result,
  };
}
