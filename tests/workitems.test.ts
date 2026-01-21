/**
 * Comprehensive Work Items Test Suite
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm, readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { generateWorkItems } from '../openspec/lib/workitems/generate.js';
import { validateWorkItems } from '../openspec/lib/workitems/validate.js';
import type { WorkItemsManifest, UniversalEpic, UniversalStory } from '../openspec/lib/workitems/types.js';

// =============================================================================
// Test Setup
// =============================================================================

const TEST_BASE = join(process.cwd(), 'tests', 'fixtures');
const TEST_INITIATIVE = 'INI-WORKITEMS-TEST';

function getInitiativePath(): string {
  return join(TEST_BASE, 'openspec', 'initiatives', TEST_INITIATIVE);
}

function getWorkitemsPath(): string {
  return join(TEST_BASE, 'openspec', 'initiatives', TEST_INITIATIVE, 'workitems');
}

async function createDirectoryStructure(): Promise<void> {
  const p = getInitiativePath();
  await mkdir(join(p, 'tier2', 'epics'), { recursive: true });
  await mkdir(join(p, 'tier3', 'stories'), { recursive: true });
  await mkdir(join(p, 'tier3', 'tasks'), { recursive: true });
  await mkdir(join(p, 'tier3', 'adrs'), { recursive: true });
}

async function writeState(title = 'Test Initiative'): Promise<void> {
  await writeFile(
    join(getInitiativePath(), 'state.yaml'),
    `metadata:\n  id: ${TEST_INITIATIVE}\n  title: "${title}"\n  created_at: "2024-01-15T09:00:00Z"\nstage: tier2_active`
  );
}

async function writePRD(problemStatement = 'This is the problem we are solving.'): Promise<void> {
  await writeFile(
    join(getInitiativePath(), 'tier2', 'prd.md'),
    `---\nstatus: draft\n---\n\n# PRD\n\n## Problem Statement\n\n${problemStatement}\n\n## User Personas\n\nTBD`
  );
}

async function writeEpic(id: string, data: Record<string, unknown>): Promise<void> {
  const filename = `${id}-${(data.title as string || 'epic').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.yaml`;
  await writeFile(
    join(getInitiativePath(), 'tier2', 'epics', filename),
    stringifyYaml({ id, ...data })
  );
}

async function writeStory(id: string, data: Record<string, unknown>): Promise<void> {
  const filename = `${id}-${(data.title as string || 'story').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.yaml`;
  await writeFile(
    join(getInitiativePath(), 'tier3', 'stories', filename),
    stringifyYaml({ id, ...data })
  );
}

async function writeTask(id: string, data: Record<string, unknown>): Promise<void> {
  const filename = `${id}-${(data.title as string || 'task').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.yaml`;
  await writeFile(
    join(getInitiativePath(), 'tier3', 'tasks', filename),
    stringifyYaml({ id, ...data })
  );
}

async function writeADR(id: string, title: string): Promise<void> {
  await writeFile(
    join(getInitiativePath(), 'tier3', 'adrs', `${id}.md`),
    `# ${title}\n\n## Status\n\nAccepted\n\n## Context\n\nTBD`
  );
}

async function readManifest(): Promise<WorkItemsManifest> {
  const content = await readFile(join(getWorkitemsPath(), 'manifest.yaml'), 'utf-8');
  return parseYaml(content) as WorkItemsManifest;
}

async function readWorkItem<T = Record<string, unknown>>(relativePath: string): Promise<T> {
  const content = await readFile(join(getWorkitemsPath(), relativePath), 'utf-8');
  return parseYaml(content) as T;
}

async function writeWorkItem(relativePath: string, data: Record<string, unknown>): Promise<void> {
  await writeFile(join(getWorkitemsPath(), relativePath), stringifyYaml(data));
}

async function cleanup(): Promise<void> {
  try {
    await rm(getInitiativePath(), { recursive: true, force: true });
  } catch {
    // Ignore
  }
}

// =============================================================================
// Generation Tests
// =============================================================================

describe('Work Items Generation', () => {
  beforeEach(async () => {
    await cleanup();
    await createDirectoryStructure();
    await writeState();
  });

  afterEach(cleanup);

  describe('Basic Generation', () => {
    it('generates workitems folder with correct structure', async () => {
      await writeEpic('EP-001', { title: 'Navigation', moscow: 'must', status: 'in_progress' });
      await writeStory('ST-001', { title: 'Bottom Nav', epic_id: 'EP-001', moscow: 'must' });
      await writeTask('TK-001', { title: 'Scaffold', story_id: 'ST-001', status: 'done' });

      const result = await generateWorkItems(TEST_INITIATIVE, TEST_BASE);

      expect(result.success).toBe(true);
      expect(result.itemsGenerated).toEqual({ epics: 1, stories: 1, tasks: 1 });

      const workitemsDir = await readdir(getWorkitemsPath());
      expect(workitemsDir).toContain('manifest.yaml');
    });

    it('creates nested folder structure (epic/story/tasks)', async () => {
      await writeEpic('EP-001', { title: 'Navigation', moscow: 'must' });
      await writeStory('ST-001', { title: 'Bottom Nav', epic_id: 'EP-001', moscow: 'must' });
      await writeTask('TK-001', { title: 'Scaffold', story_id: 'ST-001' });
      await writeTask('TK-002', { title: 'Icons', story_id: 'ST-001' });

      await generateWorkItems(TEST_INITIATIVE, TEST_BASE);

      const epicDir = await readdir(join(getWorkitemsPath(), '1-navigation'));
      expect(epicDir).toContain('epic.yaml');

      const storyDir = await readdir(join(getWorkitemsPath(), '1-navigation', '1.1-bottom-nav'));
      expect(storyDir).toContain('story.yaml');
    });

    it('generates manifest with complete tree', async () => {
      await writeEpic('EP-001', { title: 'Epic One', moscow: 'must' });
      await writeEpic('EP-002', { title: 'Epic Two', moscow: 'should' });
      await writeStory('ST-001', { title: 'Story One', epic_id: 'EP-001', moscow: 'must' });
      await writeTask('TK-001', { title: 'Task One', story_id: 'ST-001' });

      await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
      const manifest = await readManifest();

      expect(manifest.schema_version).toBe('1.0');
      expect(manifest.source).toBe('locus');
      expect(manifest.project.id).toBe(TEST_INITIATIVE);
      expect(manifest.tree).toHaveLength(2);
      expect(manifest.tree[0].children).toHaveLength(1);
      expect(manifest.tree[0].children![0].children).toHaveLength(1);
    });

    it('fails gracefully when no epics exist', async () => {
      const result = await generateWorkItems(TEST_INITIATIVE, TEST_BASE);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No epics found in tier2/epics/');
    });
  });

  describe('ID Assignment', () => {
    it('assigns sequential IDs to epics', async () => {
      await writeEpic('EP-001', { title: 'First Epic', moscow: 'must' });
      await writeEpic('EP-002', { title: 'Second Epic', moscow: 'must' });
      await writeEpic('EP-003', { title: 'Third Epic', moscow: 'must' });

      await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
      const manifest = await readManifest();

      expect(manifest.tree[0].id).toMatch(/^1-/);
      expect(manifest.tree[1].id).toMatch(/^2-/);
      expect(manifest.tree[2].id).toMatch(/^3-/);
    });

    it('assigns hierarchical IDs to stories (epic.story)', async () => {
      await writeEpic('EP-001', { title: 'Epic', moscow: 'must' });
      await writeStory('ST-001', { title: 'Story A', epic_id: 'EP-001', moscow: 'must' });
      await writeStory('ST-002', { title: 'Story B', epic_id: 'EP-001', moscow: 'must' });

      await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
      const manifest = await readManifest();

      expect(manifest.tree[0].children![0].id).toMatch(/^1\.1-/);
      expect(manifest.tree[0].children![1].id).toMatch(/^1\.2-/);
    });

    it('assigns hierarchical IDs to tasks (epic.story.task)', async () => {
      await writeEpic('EP-001', { title: 'Epic', moscow: 'must' });
      await writeStory('ST-001', { title: 'Story', epic_id: 'EP-001', moscow: 'must' });
      await writeTask('TK-001', { title: 'Task A', story_id: 'ST-001' });
      await writeTask('TK-002', { title: 'Task B', story_id: 'ST-001' });
      await writeTask('TK-003', { title: 'Task C', story_id: 'ST-001' });

      await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
      const manifest = await readManifest();

      const tasks = manifest.tree[0].children![0].children!;
      expect(tasks[0].id).toMatch(/^1\.1\.1-/);
      expect(tasks[1].id).toMatch(/^1\.1\.2-/);
      expect(tasks[2].id).toMatch(/^1\.1\.3-/);
    });

    it('includes slugified title in ID', async () => {
      await writeEpic('EP-001', { title: 'Navigation Redesign', moscow: 'must' });

      await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
      const manifest = await readManifest();

      expect(manifest.tree[0].id).toBe('1-navigation-redesign');
    });
  });

  describe('Status Mapping', () => {
    const statusMappings = [
      { input: 'draft', expected: 'backlog' },
      { input: 'defined', expected: 'todo' },
      { input: 'in_progress', expected: 'in_progress' },
      { input: 'done', expected: 'done' },
      { input: 'cancelled', expected: 'cancelled' },
      { input: undefined, expected: 'backlog' },
    ];

    for (const { input, expected } of statusMappings) {
      it(`maps status "${input}" to "${expected}"`, async () => {
        await writeEpic('EP-001', { title: 'Epic', moscow: 'must', status: input });

        await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
        const manifest = await readManifest();

        expect(manifest.tree[0].status).toBe(expected);
      });
    }
  });

  describe('Priority Mapping (MoSCoW)', () => {
    const priorityMappings = [
      { moscow: 'must', expected: 'high' },
      { moscow: 'should', expected: 'medium' },
      { moscow: 'could', expected: 'low' },
      { moscow: 'wont', expected: 'none' },
      { moscow: undefined, expected: 'medium' },
    ];

    for (const { moscow, expected } of priorityMappings) {
      it(`maps moscow "${moscow}" to priority "${expected}"`, async () => {
        await writeEpic('EP-001', { title: 'Epic', moscow });

        await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
        const manifest = await readManifest();

        expect(manifest.tree[0].priority).toBe(expected);
      });
    }
  });

  describe('Relationships', () => {
    it('sets parent reference on stories', async () => {
      await writeEpic('EP-001', { title: 'My Epic', moscow: 'must' });
      await writeStory('ST-001', { title: 'Story', epic_id: 'EP-001' });

      await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
      const story = await readWorkItem<UniversalStory>('1-my-epic/1.1-story/story.yaml');

      expect(story.parent).toBe('1-my-epic');
    });

    it('sets children array on epics', async () => {
      await writeEpic('EP-001', { title: 'Epic', moscow: 'must' });
      await writeStory('ST-001', { title: 'Story A', epic_id: 'EP-001' });
      await writeStory('ST-002', { title: 'Story B', epic_id: 'EP-001' });

      await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
      const epic = await readWorkItem<UniversalEpic>('1-epic/epic.yaml');

      expect(epic.children).toHaveLength(2);
    });

    it('handles orphan stories (no epic_id)', async () => {
      await writeEpic('EP-001', { title: 'Epic', moscow: 'must' });
      await writeStory('ST-001', { title: 'Orphan Story' });

      await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
      const manifest = await readManifest();

      expect(manifest.tree[0].children).toBeUndefined();
    });
  });

  describe('Summary Calculation', () => {
    it('calculates total items correctly', async () => {
      await writeEpic('EP-001', { title: 'Epic 1', moscow: 'must' });
      await writeEpic('EP-002', { title: 'Epic 2', moscow: 'must' });
      await writeStory('ST-001', { title: 'Story', epic_id: 'EP-001' });
      await writeTask('TK-001', { title: 'Task 1', story_id: 'ST-001' });
      await writeTask('TK-002', { title: 'Task 2', story_id: 'ST-001' });

      await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
      const manifest = await readManifest();

      expect(manifest.summary.total_items).toBe(5);
      expect(manifest.summary.by_level.epic).toBe(2);
      expect(manifest.summary.by_level.story).toBe(1);
      expect(manifest.summary.by_level.task).toBe(2);
    });
  });

  describe('Related Documents', () => {
    it('references ADRs in manifest', async () => {
      await writeADR('ADR-001', 'Use React Native');
      await writeADR('ADR-002', 'State Management');
      await writeEpic('EP-001', { title: 'Epic', moscow: 'must' });

      await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
      const manifest = await readManifest();

      expect(manifest.related_documents?.adrs).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('handles epics with no stories', async () => {
      await writeEpic('EP-001', { title: 'Empty Epic', moscow: 'must' });

      const result = await generateWorkItems(TEST_INITIATIVE, TEST_BASE);

      expect(result.success).toBe(true);
      expect(result.itemsGenerated.stories).toBe(0);
    });

    it('handles missing state.yaml', async () => {
      await rm(join(getInitiativePath(), 'state.yaml'));
      await writeEpic('EP-001', { title: 'Epic', moscow: 'must' });

      const result = await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
      const manifest = await readManifest();

      expect(result.success).toBe(true);
      expect(manifest.project.id).toBe(TEST_INITIATIVE);
    });
  });
});

// =============================================================================
// Validation Tests
// =============================================================================

describe('Work Items Validation', () => {
  beforeEach(async () => {
    await cleanup();
    await createDirectoryStructure();
    await writeState();
    await writeEpic('EP-001', { title: 'Epic', moscow: 'must', status: 'in_progress' });
    await writeStory('ST-001', { title: 'Story', epic_id: 'EP-001', moscow: 'must' });
    await writeTask('TK-001', { title: 'Task', story_id: 'ST-001', status: 'done' });
    await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
  });

  afterEach(cleanup);

  describe('Basic Validation', () => {
    it('validates correct workitems structure', async () => {
      const result = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails when workitems folder does not exist', async () => {
      await rm(getWorkitemsPath(), { recursive: true });

      const result = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);

      expect(result.valid).toBe(false);
      expect(result.errors[0].rule).toBe('workitems_exists');
    });

    it('fails when manifest.yaml is missing', async () => {
      await rm(join(getWorkitemsPath(), 'manifest.yaml'));

      const result = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.rule === 'manifest_exists')).toBe(true);
    });
  });

  describe('Required Fields', () => {
    const requiredFields = ['id', 'title', 'description', 'status', 'created_at'];

    for (const field of requiredFields) {
      it(`fails when ${field} is missing`, async () => {
        const epicPath = '1-epic/epic.yaml';
        const epic = await readWorkItem(epicPath);
        delete epic[field];
        await writeWorkItem(epicPath, epic);

        const result = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);

        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.rule === 'required_fields_present' && e.field === field)).toBe(true);
      });
    }
  });

  describe('Status Validation', () => {
    const validStatuses = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];

    for (const status of validStatuses) {
      it(`accepts valid status: ${status}`, async () => {
        const epicPath = '1-epic/epic.yaml';
        const epic = await readWorkItem(epicPath);
        epic.status = status;
        await writeWorkItem(epicPath, epic);

        const result = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);

        const statusErrors = result.errors.filter(e => e.rule === 'valid_status_value');
        expect(statusErrors).toHaveLength(0);
      });
    }

    it('fails on invalid status', async () => {
      const epicPath = '1-epic/epic.yaml';
      const epic = await readWorkItem(epicPath);
      epic.status = 'invalid_status';
      await writeWorkItem(epicPath, epic);

      const result = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.rule === 'valid_status_value')).toBe(true);
    });
  });

  describe('Priority Validation', () => {
    const validPriorities = ['urgent', 'high', 'medium', 'low', 'none'];

    for (const priority of validPriorities) {
      it(`accepts valid priority: ${priority}`, async () => {
        const epicPath = '1-epic/epic.yaml';
        const epic = await readWorkItem(epicPath);
        epic.priority = priority;
        await writeWorkItem(epicPath, epic);

        const result = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);

        const priorityErrors = result.errors.filter(e => e.rule === 'valid_priority_value');
        expect(priorityErrors).toHaveLength(0);
      });
    }

    it('fails on invalid priority', async () => {
      const epicPath = '1-epic/epic.yaml';
      const epic = await readWorkItem(epicPath);
      epic.priority = 'super_high';
      await writeWorkItem(epicPath, epic);

      const result = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.rule === 'valid_priority_value')).toBe(true);
    });
  });

  describe('ID Format Validation', () => {
    it('fails on invalid ID format', async () => {
      const epicPath = '1-epic/epic.yaml';
      const epic = await readWorkItem(epicPath);
      epic.id = 'invalid-id-format';
      await writeWorkItem(epicPath, epic);

      const result = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.rule === 'valid_id_format')).toBe(true);
    });
  });

  describe('Hierarchy Validation', () => {
    it('fails when epic has parent', async () => {
      const epicPath = '1-epic/epic.yaml';
      const epic = await readWorkItem(epicPath);
      epic.parent = 'some-parent';
      await writeWorkItem(epicPath, epic);

      const result = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.rule === 'epics_have_no_parent')).toBe(true);
    });

    it('fails when task has children', async () => {
      const taskPath = '1-epic/1.1-story/1.1.1-task.yaml';
      const task = await readWorkItem(taskPath);
      task.children = ['some-child'];
      await writeWorkItem(taskPath, task);

      const result = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.rule === 'tasks_are_leaves')).toBe(true);
    });
  });

  describe('Unique ID Validation', () => {
    it('fails when duplicate IDs exist', async () => {
      const epicPath = '1-epic/epic.yaml';
      const epic = await readWorkItem(epicPath);
      
      const storyPath = '1-epic/1.1-story/story.yaml';
      const story = await readWorkItem(storyPath);
      story.id = epic.id;
      await writeWorkItem(storyPath, story);

      const result = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.rule === 'unique_ids')).toBe(true);
    });
  });

  describe('Warnings', () => {
    it('warns when no work items found', async () => {
      await rm(join(getWorkitemsPath(), '1-epic'), { recursive: true });

      const result = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);

      expect(result.warnings.some(w => w.message === 'No work items found')).toBe(true);
    });
  });
});

// =============================================================================
// Reprioritization Tests
// =============================================================================

describe('Reprioritization', () => {
  beforeEach(async () => {
    await cleanup();
    await createDirectoryStructure();
    await writeState();
  });

  afterEach(cleanup);

  it('reflects ID changes when source IDs change', async () => {
    await writeEpic('EP-001', { title: 'First Epic', moscow: 'must' });
    await writeEpic('EP-002', { title: 'Second Epic', moscow: 'should' });

    await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
    let manifest = await readManifest();

    expect(manifest.tree[0].id).toBe('1-first-epic');
    expect(manifest.tree[1].id).toBe('2-second-epic');

    await rm(join(getInitiativePath(), 'tier2', 'epics'), { recursive: true });
    await mkdir(join(getInitiativePath(), 'tier2', 'epics'), { recursive: true });
    
    await writeEpic('EP-001', { title: 'Second Epic', moscow: 'must' });
    await writeEpic('EP-002', { title: 'First Epic', moscow: 'should' });

    await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
    manifest = await readManifest();

    expect(manifest.tree[0].id).toBe('1-second-epic');
    expect(manifest.tree[1].id).toBe('2-first-epic');
  });

  it('updates priority field when MoSCoW changes', async () => {
    await writeEpic('EP-001', { title: 'Epic', moscow: 'must' });

    await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
    let epic = await readWorkItem<UniversalEpic>('1-epic/epic.yaml');
    expect(epic.priority).toBe('high');

    await writeEpic('EP-001', { title: 'Epic', moscow: 'could' });

    await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
    epic = await readWorkItem<UniversalEpic>('1-epic/epic.yaml');
    expect(epic.priority).toBe('low');
  });
});

// =============================================================================
// Regeneration Tests
// =============================================================================

describe('Regeneration', () => {
  beforeEach(async () => {
    await cleanup();
    await createDirectoryStructure();
    await writeState();
  });

  afterEach(cleanup);

  it('overwrites existing workitems on regeneration', async () => {
    await writeEpic('EP-001', { title: 'Original Title', moscow: 'must' });
    await generateWorkItems(TEST_INITIATIVE, TEST_BASE);

    let manifest = await readManifest();
    expect(manifest.tree[0].title).toBe('Original Title');

    // Remove old epic file (filename changes with title) and write new one
    await rm(join(getInitiativePath(), 'tier2', 'epics', 'EP-001-original-title.yaml'));
    await writeEpic('EP-001', { title: 'Updated Title', moscow: 'must' });
    await generateWorkItems(TEST_INITIATIVE, TEST_BASE);

    manifest = await readManifest();
    expect(manifest.tree[0].title).toBe('Updated Title');
  });

  it('removes deleted items on regeneration', async () => {
    await writeEpic('EP-001', { title: 'Epic 1', moscow: 'must' });
    await writeEpic('EP-002', { title: 'Epic 2', moscow: 'must' });
    await generateWorkItems(TEST_INITIATIVE, TEST_BASE);

    let manifest = await readManifest();
    expect(manifest.tree).toHaveLength(2);

    await rm(join(getInitiativePath(), 'tier2', 'epics', 'EP-002-epic-2.yaml'));
    await generateWorkItems(TEST_INITIATIVE, TEST_BASE);

    manifest = await readManifest();
    expect(manifest.tree).toHaveLength(1);
  });

  it('updates generated_at timestamp on regeneration', async () => {
    await writeEpic('EP-001', { title: 'Epic', moscow: 'must' });
    await generateWorkItems(TEST_INITIATIVE, TEST_BASE);

    const manifest1 = await readManifest();
    const timestamp1 = manifest1.generated_at;

    await new Promise(resolve => setTimeout(resolve, 10));
    await generateWorkItems(TEST_INITIATIVE, TEST_BASE);

    const manifest2 = await readManifest();
    const timestamp2 = manifest2.generated_at;

    expect(new Date(timestamp2).getTime()).toBeGreaterThan(new Date(timestamp1).getTime());
  });
});

// =============================================================================
// Complex Scenario Tests
// =============================================================================

describe('Complex Scenarios', () => {
  beforeEach(async () => {
    await cleanup();
    await createDirectoryStructure();
    await writeState('Complex Project');
    await writePRD('A complex project with many moving parts.');
  });

  afterEach(cleanup);

  it('handles large project with multiple levels', async () => {
    for (let e = 1; e <= 3; e++) {
      await writeEpic(`EP-00${e}`, { title: `Epic ${e}`, moscow: 'must' });
      for (let s = 1; s <= 2; s++) {
        const storyNum = (e - 1) * 2 + s;
        await writeStory(`ST-00${storyNum}`, {
          title: `Story ${storyNum}`,
          epic_id: `EP-00${e}`
        });
        for (let t = 1; t <= 3; t++) {
          const taskNum = (storyNum - 1) * 3 + t;
          const taskId = taskNum < 10 ? `TK-00${taskNum}` : `TK-0${taskNum}`;
          await writeTask(taskId, {
            title: `Task ${taskNum}`,
            story_id: `ST-00${storyNum}`
          });
        }
      }
    }

    const result = await generateWorkItems(TEST_INITIATIVE, TEST_BASE);

    expect(result.success).toBe(true);
    expect(result.itemsGenerated.epics).toBe(3);
    expect(result.itemsGenerated.stories).toBe(6);
    expect(result.itemsGenerated.tasks).toBe(18);

    const manifest = await readManifest();
    expect(manifest.summary.total_items).toBe(27);

    const validation = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);
    expect(validation.valid).toBe(true);
  });

  it('handles complete workflow: generate -> validate -> regenerate', async () => {
    await writeEpic('EP-001', { title: 'Epic', moscow: 'must' });
    await writeStory('ST-001', { title: 'Story', epic_id: 'EP-001' });

    let result = await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
    expect(result.success).toBe(true);

    let validation = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);
    expect(validation.valid).toBe(true);

    await writeTask('TK-001', { title: 'Task', story_id: 'ST-001' });
    await writeADR('ADR-001', 'Architecture Decision');

    result = await generateWorkItems(TEST_INITIATIVE, TEST_BASE);
    expect(result.success).toBe(true);
    expect(result.itemsGenerated.tasks).toBe(1);

    validation = await validateWorkItems(TEST_INITIATIVE, TEST_BASE);
    expect(validation.valid).toBe(true);

    const manifest = await readManifest();
    expect(manifest.related_documents?.adrs).toHaveLength(1);
  });
});
