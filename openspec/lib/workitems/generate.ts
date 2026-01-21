/**
 * Work Items Generation
 */

import { readFile, writeFile, mkdir, readdir, copyFile, rm } from 'fs/promises';
import { join } from 'path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type {
  UniversalEpic,
  UniversalStory,
  UniversalTask,
  WorkItemsManifest,
  ManifestTreeNode,
  GenerationResult,
  WorkItemStatus,
  WorkItemPriority,
  RelatedDocument,
} from './types.js';

const SCHEMA_VERSION = '1.0';
const WORKITEMS_DIR = 'workitems';
const TEMPLATES_DIR = 'openspec/schemas/workitems';

// =============================================================================
// Helpers
// =============================================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
}

function mapStatus(locusStatus?: string): WorkItemStatus {
  const mapping: Record<string, WorkItemStatus> = {
    'draft': 'backlog',
    'defined': 'todo',
    'ready': 'todo',
    'pending': 'todo',
    'in_progress': 'in_progress',
    'in-progress': 'in_progress',
    'review': 'in_review',
    'in_review': 'in_review',
    'done': 'done',
    'complete': 'done',
    'completed': 'done',
    'blocked': 'backlog',
    'cancelled': 'cancelled',
    'canceled': 'cancelled',
  };
  return mapping[locusStatus?.toLowerCase() ?? ''] ?? 'backlog';
}

function mapPriority(moscow?: string): WorkItemPriority {
  const mapping: Record<string, WorkItemPriority> = {
    'must': 'high',
    'should': 'medium',
    'could': 'low',
    'wont': 'none',
  };
  return mapping[moscow?.toLowerCase() ?? ''] ?? 'medium';
}

// =============================================================================
// Source Types
// =============================================================================

interface LocusEpic {
  id: string;
  title: string;
  description?: string;
  moscow?: string;
  status?: string;
  complexity?: string;
  estimated_weeks?: number;
  acceptance_criteria?: string[];
  dependencies?: Array<string | { type: string; description: string }>;
  risks?: Array<string | { description: string; mitigation?: string }>;
  success_metrics?: Array<string | { metric: string; target: string }>;
  labels?: string[];
  created_at?: string;
  updated_at?: string;
  _sourcePath?: string;
}

interface LocusStory {
  id: string;
  title: string;
  user_story?: string | { persona?: string; want?: string; benefit?: string };
  description?: string;
  epic_id?: string;
  moscow?: string;
  status?: string;
  story_points?: number;
  acceptance_criteria?: Array<string | { given: string; when: string; then: string }>;
  skills_required?: string[];
  dependencies?: string[];
  labels?: string[];
  created_at?: string;
  updated_at?: string;
  _sourcePath?: string;
}

interface LocusTask {
  id: string;
  title: string;
  description?: string;
  story_id?: string;
  status?: string;
  skills_required?: string[];
  estimated_hours?: number;
  dependencies?: string[];
  implementation_notes?: string;
  affected_files?: string[];
  test_requirements?: string[];
  created_at?: string;
  updated_at?: string;
  _sourcePath?: string;
}

// =============================================================================
// Read Locus Artifacts
// =============================================================================

async function readLocusEpics(initiativePath: string): Promise<LocusEpic[]> {
  const epicsDir = join(initiativePath, 'tier2', 'epics');
  try {
    const files = await readdir(epicsDir);
    const epics: LocusEpic[] = [];
    
    for (const file of files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))) {
      try {
        const content = await readFile(join(epicsDir, file), 'utf-8');
        const epic = parseYaml(content) as LocusEpic;
        epic._sourcePath = join('tier2', 'epics', file);
        epics.push(epic);
      } catch {
        // Skip malformed files
      }
    }
    
    return epics.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  } catch {
    return [];
  }
}

async function readLocusStories(initiativePath: string): Promise<LocusStory[]> {
  const storiesDir = join(initiativePath, 'tier3', 'stories');
  try {
    const files = await readdir(storiesDir);
    const stories: LocusStory[] = [];
    
    for (const file of files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))) {
      try {
        const content = await readFile(join(storiesDir, file), 'utf-8');
        const story = parseYaml(content) as LocusStory;
        story._sourcePath = join('tier3', 'stories', file);
        stories.push(story);
      } catch {
        // Skip malformed files
      }
    }
    
    return stories.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  } catch {
    return [];
  }
}

async function readLocusTasks(initiativePath: string): Promise<LocusTask[]> {
  const tasksDir = join(initiativePath, 'tier3', 'tasks');
  try {
    const files = await readdir(tasksDir);
    const tasks: LocusTask[] = [];
    
    for (const file of files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))) {
      try {
        const content = await readFile(join(tasksDir, file), 'utf-8');
        const task = parseYaml(content) as LocusTask;
        task._sourcePath = join('tier3', 'tasks', file);
        tasks.push(task);
      } catch {
        // Skip malformed files
      }
    }
    
    return tasks.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  } catch {
    return [];
  }
}

async function readADRs(initiativePath: string): Promise<RelatedDocument[]> {
  const adrsDir = join(initiativePath, 'tier3', 'adrs');
  try {
    const files = await readdir(adrsDir);
    return files.filter(f => f.endsWith('.md')).map(file => ({
      type: 'adr' as const,
      id: file.replace('.md', ''),
      title: file.replace('.md', '').replace(/-/g, ' '),
      path: join('..', 'tier3', 'adrs', file),
    }));
  } catch {
    return [];
  }
}

// =============================================================================
// Build Relationships
// =============================================================================

interface Relationships {
  epicToStories: Map<string, string[]>;
  storyToTasks: Map<string, string[]>;
  storyToEpic: Map<string, string>;
  taskToStory: Map<string, string>;
}

function buildRelationships(
  epics: LocusEpic[],
  stories: LocusStory[],
  tasks: LocusTask[]
): Relationships {
  const rel: Relationships = {
    epicToStories: new Map(),
    storyToTasks: new Map(),
    storyToEpic: new Map(),
    taskToStory: new Map(),
  };
  
  for (const epic of epics) {
    rel.epicToStories.set(epic.id, []);
  }
  
  for (const story of stories) {
    if (story.epic_id) {
      const epicStories = rel.epicToStories.get(story.epic_id) ?? [];
      epicStories.push(story.id);
      rel.epicToStories.set(story.epic_id, epicStories);
      rel.storyToEpic.set(story.id, story.epic_id);
    }
    rel.storyToTasks.set(story.id, []);
  }
  
  for (const task of tasks) {
    if (task.story_id) {
      const storyTasks = rel.storyToTasks.get(task.story_id) ?? [];
      storyTasks.push(task.id);
      rel.storyToTasks.set(task.story_id, storyTasks);
      rel.taskToStory.set(task.id, task.story_id);
    }
  }
  
  return rel;
}

// =============================================================================
// ID Mapping
// =============================================================================

interface IDMapping {
  locusToUniversal: Map<string, string>;
  universalToLocus: Map<string, string>;
}

function generateIDMappings(
  epics: LocusEpic[],
  stories: LocusStory[],
  tasks: LocusTask[],
  rel: Relationships
): IDMapping {
  const mapping: IDMapping = {
    locusToUniversal: new Map(),
    universalToLocus: new Map(),
  };
  
  epics.forEach((epic, i) => {
    const uid = `${i + 1}`;
    mapping.locusToUniversal.set(epic.id, uid);
    mapping.universalToLocus.set(uid, epic.id);
  });
  
  for (const epic of epics) {
    const epicUid = mapping.locusToUniversal.get(epic.id)!;
    const epicStories = rel.epicToStories.get(epic.id) ?? [];
    
    epicStories.forEach((storyId, i) => {
      const uid = `${epicUid}.${i + 1}`;
      mapping.locusToUniversal.set(storyId, uid);
      mapping.universalToLocus.set(uid, storyId);
    });
  }
  
  for (const story of stories) {
    const storyUid = mapping.locusToUniversal.get(story.id);
    if (!storyUid) continue;
    
    const storyTasks = rel.storyToTasks.get(story.id) ?? [];
    storyTasks.forEach((taskId, i) => {
      const uid = `${storyUid}.${i + 1}`;
      mapping.locusToUniversal.set(taskId, uid);
      mapping.universalToLocus.set(uid, taskId);
    });
  }
  
  return mapping;
}

// =============================================================================
// Transform
// =============================================================================

function transformEpic(
  epic: LocusEpic,
  uid: string,
  childrenIds: string[],
  generatedAt: string
): UniversalEpic {
  const slug = slugify(epic.title);
  
  return {
    _meta: {
      schema_version: SCHEMA_VERSION,
      level: 'epic',
      source: { type: 'locus_epic', path: epic._sourcePath! },
      generated_at: generatedAt,
    },
    id: `${uid}-${slug}`,
    title: epic.title,
    description: epic.description || `Epic: ${epic.title}`,
    status: mapStatus(epic.status),
    priority: mapPriority(epic.moscow),
    created_at: epic.created_at ?? generatedAt,
    updated_at: epic.updated_at,
    labels: epic.labels,
    estimate: epic.complexity 
      ? { value: epic.complexity as 'XS' | 'S' | 'M' | 'L' | 'XL', unit: 't-shirt' } 
      : undefined,
    children: childrenIds.length > 0 ? childrenIds : undefined,
    acceptance_criteria: epic.acceptance_criteria,
    success_metrics: epic.success_metrics?.map(m => 
      typeof m === 'string' ? { metric: m, target: '' } : m
    ),
    dependencies: epic.dependencies?.map(d =>
      typeof d === 'string' ? { type: 'external' as const, description: d } : { type: d.type as 'internal' | 'external', description: d.description }
    ),
    risks: epic.risks?.map(r =>
      typeof r === 'string' ? { description: r } : r
    ),
  };
}

function transformStory(
  story: LocusStory,
  uid: string,
  parentId: string,
  childrenIds: string[],
  generatedAt: string
): UniversalStory {
  const slug = slugify(story.title);
  
  let userStory = undefined;
  if (story.user_story) {
    if (typeof story.user_story === 'string') {
      const match = story.user_story.match(/As an? (.+?),? I want (.+?),? [Ss]o that (.+)/i);
      if (match) {
        userStory = { as_a: match[1], i_want: match[2], so_that: match[3] };
      }
    } else {
      userStory = {
        as_a: story.user_story.persona ?? '',
        i_want: story.user_story.want ?? '',
        so_that: story.user_story.benefit ?? '',
      };
    }
  }
  
  return {
    _meta: {
      schema_version: SCHEMA_VERSION,
      level: 'story',
      source: { type: 'locus_story', path: story._sourcePath! },
      generated_at: generatedAt,
    },
    id: `${uid}-${slug}`,
    title: story.title,
    description: story.description || `Story: ${story.title}`,
    status: mapStatus(story.status),
    priority: mapPriority(story.moscow),
    created_at: story.created_at ?? generatedAt,
    updated_at: story.updated_at,
    labels: story.labels ?? story.skills_required,
    estimate: story.story_points 
      ? { value: story.story_points, unit: 'points' } 
      : undefined,
    parent: parentId,
    children: childrenIds.length > 0 ? childrenIds : undefined,
    blocked_by: story.dependencies,
    user_story: userStory,
    acceptance_criteria: story.acceptance_criteria,
  };
}

function transformTask(
  task: LocusTask,
  uid: string,
  parentId: string,
  generatedAt: string
): UniversalTask {
  const slug = slugify(task.title);
  
  return {
    _meta: {
      schema_version: SCHEMA_VERSION,
      level: 'task',
      source: { type: 'locus_task', path: task._sourcePath! },
      generated_at: generatedAt,
    },
    id: `${uid}-${slug}`,
    title: task.title,
    description: task.description || `Task: ${task.title}`,
    status: mapStatus(task.status),
    priority: 'medium',
    created_at: task.created_at ?? generatedAt,
    updated_at: task.updated_at,
    labels: task.skills_required,
    estimate: task.estimated_hours 
      ? { value: task.estimated_hours, unit: 'hours' } 
      : undefined,
    parent: parentId,
    blocked_by: task.dependencies,
    implementation_notes: task.implementation_notes,
    affected_files: task.affected_files,
    acceptance_criteria: task.test_requirements,
  };
}

// =============================================================================
// Generate Files
// =============================================================================

async function generateWorkItemsFolder(
  initiativePath: string,
  epics: UniversalEpic[],
  stories: Map<string, UniversalStory>,
  tasks: Map<string, UniversalTask>,
  manifest: WorkItemsManifest,
  basePath: string
): Promise<void> {
  const workitemsPath = join(initiativePath, WORKITEMS_DIR);
  
  // Remove existing workitems folder to ensure clean state
  try {
    await rm(workitemsPath, { recursive: true, force: true });
  } catch {
    // Folder may not exist
  }
  
  await mkdir(workitemsPath, { recursive: true });
  
  await writeFile(
    join(workitemsPath, 'manifest.yaml'),
    stringifyYaml(manifest, { lineWidth: 100 })
  );
  
  try {
    await copyFile(
      join(basePath, TEMPLATES_DIR, '_schema.yaml'),
      join(workitemsPath, '_schema.yaml')
    );
    await copyFile(
      join(basePath, TEMPLATES_DIR, 'README.md'),
      join(workitemsPath, 'README.md')
    );
  } catch {
    // Templates may not exist yet
  }
  
  for (const epic of epics) {
    const epicDir = join(workitemsPath, epic.id);
    await mkdir(epicDir, { recursive: true });
    await writeFile(join(epicDir, 'epic.yaml'), stringifyYaml(epic, { lineWidth: 100 }));
    
    for (const storyId of epic.children ?? []) {
      const story = stories.get(storyId);
      if (!story) continue;
      
      const storyDir = join(epicDir, story.id);
      await mkdir(storyDir, { recursive: true });
      await writeFile(join(storyDir, 'story.yaml'), stringifyYaml(story, { lineWidth: 100 }));
      
      for (const taskId of story.children ?? []) {
        const task = tasks.get(taskId);
        if (!task) continue;
        await writeFile(join(storyDir, `${task.id}.yaml`), stringifyYaml(task, { lineWidth: 100 }));
      }
    }
  }
}

function buildManifestTree(
  epics: UniversalEpic[],
  stories: Map<string, UniversalStory>,
  tasks: Map<string, UniversalTask>
): ManifestTreeNode[] {
  const result: ManifestTreeNode[] = [];
  
  for (const epic of epics) {
    const storyNodes: ManifestTreeNode[] = [];
    
    for (const storyId of epic.children ?? []) {
      const story = stories.get(storyId);
      if (!story) continue;
      
      const taskNodes: ManifestTreeNode[] = [];
      for (const taskId of story.children ?? []) {
        const task = tasks.get(taskId);
        if (!task) continue;
        taskNodes.push({
          id: task.id,
          title: task.title,
          slug: slugify(task.title),
          level: 'task',
          status: task.status,
          priority: task.priority,
          path: `${epic.id}/${story.id}/${task.id}.yaml`,
        });
      }
      
      storyNodes.push({
        id: story.id,
        title: story.title,
        slug: slugify(story.title),
        level: 'story',
        status: story.status,
        priority: story.priority,
        path: `${epic.id}/${story.id}/story.yaml`,
        children: taskNodes.length > 0 ? taskNodes : undefined,
      });
    }
    
    result.push({
      id: epic.id,
      title: epic.title,
      slug: slugify(epic.title),
      level: 'epic',
      status: epic.status,
      priority: epic.priority,
      path: `${epic.id}/epic.yaml`,
      children: storyNodes.length > 0 ? storyNodes : undefined,
    });
  }
  
  return result;
}

function calculateSummary(
  epics: UniversalEpic[],
  stories: Map<string, UniversalStory>,
  tasks: Map<string, UniversalTask>
): WorkItemsManifest['summary'] {
  const allItems = [...epics, ...stories.values(), ...tasks.values()];
  
  const byStatus: Record<WorkItemStatus, number> = {
    backlog: 0, todo: 0, in_progress: 0, in_review: 0, done: 0, cancelled: 0,
  };
  const byPriority: Record<WorkItemPriority, number> = {
    urgent: 0, high: 0, medium: 0, low: 0, none: 0,
  };
  
  for (const item of allItems) {
    byStatus[item.status]++;
    byPriority[item.priority ?? 'medium']++;
  }
  
  return {
    total_items: allItems.length,
    by_level: { epic: epics.length, story: stories.size, task: tasks.size },
    by_status: byStatus,
    by_priority: byPriority,
  };
}

// =============================================================================
// Main
// =============================================================================

export async function generateWorkItems(
  initiativeId: string,
  basePath: string = process.cwd()
): Promise<GenerationResult> {
  const initiativePath = join(basePath, 'openspec', 'initiatives', initiativeId);
  const generatedAt = new Date().toISOString();
  
  try {
    const locusEpics = await readLocusEpics(initiativePath);
    const locusStories = await readLocusStories(initiativePath);
    const locusTasks = await readLocusTasks(initiativePath);
    const adrs = await readADRs(initiativePath);
    
    if (locusEpics.length === 0) {
      return {
        success: false,
        path: join(initiativePath, WORKITEMS_DIR),
        itemsGenerated: { epics: 0, stories: 0, tasks: 0 },
        errors: ['No epics found in tier2/epics/'],
      };
    }
    
    const rel = buildRelationships(locusEpics, locusStories, locusTasks);
    const idMapping = generateIDMappings(locusEpics, locusStories, locusTasks, rel);
    
    const universalEpics: UniversalEpic[] = [];
    const universalStories = new Map<string, UniversalStory>();
    const universalTasks = new Map<string, UniversalTask>();
    
    for (const epic of locusEpics) {
      const uid = idMapping.locusToUniversal.get(epic.id)!;
      const childIds = (rel.epicToStories.get(epic.id) ?? []).map(sid => {
        const suid = idMapping.locusToUniversal.get(sid)!;
        const s = locusStories.find(x => x.id === sid)!;
        return `${suid}-${slugify(s.title)}`;
      });
      universalEpics.push(transformEpic(epic, uid, childIds, generatedAt));
    }
    
    for (const story of locusStories) {
      const uid = idMapping.locusToUniversal.get(story.id);
      if (!uid) continue;
      
      const epicId = rel.storyToEpic.get(story.id);
      const epicUid = epicId ? idMapping.locusToUniversal.get(epicId) : undefined;
      const epic = epicId ? locusEpics.find(e => e.id === epicId) : undefined;
      const parentId = epicUid && epic ? `${epicUid}-${slugify(epic.title)}` : '';
      
      const childIds = (rel.storyToTasks.get(story.id) ?? []).map(tid => {
        const tuid = idMapping.locusToUniversal.get(tid)!;
        const t = locusTasks.find(x => x.id === tid)!;
        return `${tuid}-${slugify(t.title)}`;
      });
      
      const us = transformStory(story, uid, parentId, childIds, generatedAt);
      universalStories.set(us.id, us);
    }
    
    for (const task of locusTasks) {
      const uid = idMapping.locusToUniversal.get(task.id);
      if (!uid) continue;
      
      const storyId = rel.taskToStory.get(task.id);
      const storyUid = storyId ? idMapping.locusToUniversal.get(storyId) : undefined;
      const story = storyId ? locusStories.find(s => s.id === storyId) : undefined;
      const parentId = storyUid && story ? `${storyUid}-${slugify(story.title)}` : '';
      
      const ut = transformTask(task, uid, parentId, generatedAt);
      universalTasks.set(ut.id, ut);
    }
    
    let projectTitle = initiativeId;
    let projectDescription = '';
    
    try {
      const stateContent = await readFile(join(initiativePath, 'state.yaml'), 'utf-8');
      const state = parseYaml(stateContent) as Record<string, unknown>;
      const metadata = state.metadata as Record<string, unknown> | undefined;
      projectTitle = (metadata?.title as string) ?? initiativeId;
    } catch {
      // State file may not exist
    }
    
    try {
      const prd = await readFile(join(initiativePath, 'tier2', 'prd.md'), 'utf-8');
      const match = prd.match(/## Problem Statement\s+([\s\S]*?)(?=\n##|$)/);
      if (match) projectDescription = match[1].trim().substring(0, 500);
    } catch {
      // PRD may not exist
    }
    
    const manifest: WorkItemsManifest = {
      schema_version: SCHEMA_VERSION,
      generated_at: generatedAt,
      source: 'locus',
      project: { id: initiativeId, title: projectTitle, description: projectDescription },
      tree: buildManifestTree(universalEpics, universalStories, universalTasks),
      related_documents: {
        prd: { type: 'prd', id: 'prd', title: 'Product Requirements Document', path: '../tier2/prd.md' },
        adrs: adrs.length > 0 ? adrs : undefined,
      },
      summary: calculateSummary(universalEpics, universalStories, universalTasks),
    };
    
    await generateWorkItemsFolder(initiativePath, universalEpics, universalStories, universalTasks, manifest, basePath);
    
    return {
      success: true,
      path: join(initiativePath, WORKITEMS_DIR),
      itemsGenerated: {
        epics: universalEpics.length,
        stories: universalStories.size,
        tasks: universalTasks.size,
      },
    };
  } catch (error) {
    return {
      success: false,
      path: join(initiativePath, WORKITEMS_DIR),
      itemsGenerated: { epics: 0, stories: 0, tasks: 0 },
      errors: [(error as Error).message],
    };
  }
}
