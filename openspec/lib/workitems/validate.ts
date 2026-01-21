/**
 * Work Items Validation
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  WorkItemsManifest,
  WorkItemLevel,
  WorkItemStatus,
  WorkItemPriority,
} from './types.js';

const VALID_STATUSES: WorkItemStatus[] = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];
const VALID_PRIORITIES: WorkItemPriority[] = ['urgent', 'high', 'medium', 'low', 'none'];
const VALID_LEVELS: WorkItemLevel[] = ['epic', 'story', 'task'];
const ID_PATTERN = /^\d+(\.\d+)*-.+$/;

interface ItemIndex {
  items: Map<string, { level: WorkItemLevel; parent?: string; children?: string[] }>;
}

async function readAllWorkItems(workitemsPath: string): Promise<{
  items: Array<Record<string, unknown> & { _filePath: string }>;
  manifest?: WorkItemsManifest;
}> {
  const items: Array<Record<string, unknown> & { _filePath: string }> = [];
  let manifest: WorkItemsManifest | undefined;
  
  async function readDir(dirPath: string): Promise<void> {
    const entries = await readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      if (entry.isDirectory()) {
        await readDir(fullPath);
      } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
        try {
          const content = await readFile(fullPath, 'utf-8');
          if (entry.name === 'manifest.yaml') {
            manifest = parseYaml(content) as WorkItemsManifest;
          } else if (entry.name !== '_schema.yaml') {
            const parsed = parseYaml(content) as Record<string, unknown>;
            parsed._filePath = fullPath.replace(workitemsPath + '\\', '').replace(workitemsPath + '/', '');
            items.push(parsed as Record<string, unknown> & { _filePath: string });
          }
        } catch {
          // Skip malformed YAML
        }
      }
    }
  }
  
  await readDir(workitemsPath);
  return { items, manifest };
}

function validateItem(item: Record<string, unknown>, path: string, index: ItemIndex): ValidationError[] {
  const errors: ValidationError[] = [];
  const meta = item._meta as Record<string, unknown> | undefined;
  const level = meta?.level as WorkItemLevel | undefined;
  
  // Required fields
  for (const field of ['id', 'title', 'description', 'status', 'created_at']) {
    if (!item[field] || (typeof item[field] === 'string' && !(item[field] as string).trim())) {
      errors.push({ path, field, rule: 'required_fields_present', message: `Required field '${field}' missing` });
    }
  }
  
  // ID format
  if (item.id && !ID_PATTERN.test(item.id as string)) {
    errors.push({ path, field: 'id', rule: 'valid_id_format', message: `Invalid ID format` });
  }
  
  // Status
  if (item.status && !VALID_STATUSES.includes(item.status as WorkItemStatus)) {
    errors.push({ path, field: 'status', rule: 'valid_status_value', message: `Invalid status` });
  }
  
  // Priority
  if (item.priority && !VALID_PRIORITIES.includes(item.priority as WorkItemPriority)) {
    errors.push({ path, field: 'priority', rule: 'valid_priority_value', message: `Invalid priority` });
  }
  
  // Level
  if (!level || !VALID_LEVELS.includes(level)) {
    errors.push({ path, field: '_meta.level', rule: 'valid_level', message: `Invalid level` });
  }
  
  // Parent exists
  if (item.parent && !index.items.has(item.parent as string)) {
    errors.push({ path, field: 'parent', rule: 'parent_exists', message: `Parent not found` });
  }
  
  // Children exist
  for (const childId of (item.children as string[]) ?? []) {
    if (!index.items.has(childId)) {
      errors.push({ path, field: 'children', rule: 'children_exist', message: `Child '${childId}' not found` });
    }
  }
  
  // Bidirectional relationships
  const id = item.id as string;
  const parent = item.parent as string | undefined;
  const children = item.children as string[] | undefined;
  
  if (parent) {
    const parentItem = index.items.get(parent);
    if (parentItem && !parentItem.children?.includes(id)) {
      errors.push({ path, field: 'parent', rule: 'bidirectional_relationships', message: `Parent doesn't list this as child` });
    }
  }
  
  if (children) {
    for (const childId of children) {
      const childItem = index.items.get(childId);
      if (childItem && childItem.parent !== id) {
        errors.push({ path, field: 'children', rule: 'bidirectional_relationships', message: `Child doesn't list this as parent` });
      }
    }
  }
  
  // Level hierarchy
  if (level === 'epic' && parent) {
    errors.push({ path, field: 'parent', rule: 'epics_have_no_parent', message: `Epics cannot have parent` });
  }
  
  if (level === 'task' && children && children.length > 0) {
    errors.push({ path, field: 'children', rule: 'tasks_are_leaves', message: `Tasks cannot have children` });
  }
  
  if (level === 'story' && parent) {
    const parentItem = index.items.get(parent);
    if (parentItem && parentItem.level !== 'epic') {
      errors.push({ path, field: 'parent', rule: 'level_hierarchy', message: `Story parent must be epic` });
    }
  }
  
  if (level === 'task' && parent) {
    const parentItem = index.items.get(parent);
    if (parentItem && parentItem.level !== 'story') {
      errors.push({ path, field: 'parent', rule: 'level_hierarchy', message: `Task parent must be story` });
    }
  }
  
  return errors;
}

export async function validateWorkItems(
  initiativeId: string,
  basePath: string = process.cwd()
): Promise<ValidationResult> {
  const workitemsPath = join(basePath, 'openspec', 'initiatives', initiativeId, 'workitems');
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  try {
    await stat(workitemsPath);
  } catch {
    return {
      valid: false,
      errors: [{ path: workitemsPath, rule: 'workitems_exists', message: 'workitems/ not found' }],
      warnings: [],
    };
  }
  
  const { items, manifest } = await readAllWorkItems(workitemsPath);
  
  if (!manifest) {
    errors.push({ path: 'manifest.yaml', rule: 'manifest_exists', message: 'manifest.yaml not found' });
  }
  
  const index: ItemIndex = {
    items: new Map(items.map(i => [
      i.id as string,
      { 
        level: (i._meta as Record<string, unknown> | undefined)?.level as WorkItemLevel, 
        parent: i.parent as string | undefined, 
        children: i.children as string[] | undefined 
      }
    ])),
  };
  
  // Validate each item
  for (const item of items) {
    errors.push(...validateItem(item, item._filePath, index));
  }
  
  // Unique IDs
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id as string)) {
      errors.push({ path: item._filePath, field: 'id', rule: 'unique_ids', message: `Duplicate ID` });
    }
    seen.add(item.id as string);
  }
  
  // Warnings
  if (items.length === 0) {
    warnings.push({ path: workitemsPath, message: 'No work items found' });
  }
  
  return { valid: errors.length === 0, errors, warnings };
}
