/**
 * Work Items CLI
 */

import { generateWorkItems } from './generate.js';
import { validateWorkItems } from './validate.js';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type { WorkItemsConfig, WorkItemsManifest } from './types.js';

const CONFIG_PATH = 'openspec/config.yaml';

async function setWorkItemsConfig(basePath: string, initiativeId: string, config: WorkItemsConfig): Promise<void> {
  const configPath = join(basePath, CONFIG_PATH);
  let fullConfig: Record<string, unknown> = {};
  try {
    fullConfig = parseYaml(await readFile(configPath, 'utf-8')) as Record<string, unknown>;
  } catch {
    // Config doesn't exist
  }
  if (!fullConfig.workitems) fullConfig.workitems = {};
  (fullConfig.workitems as Record<string, unknown>)[initiativeId] = config;
  await writeFile(configPath, stringifyYaml(fullConfig));
}

export async function workitemsInit(initiativeId: string, basePath = process.cwd()): Promise<void> {
  console.log(`\n📦 Initializing work items for ${initiativeId}...\n`);
  
  const result = await generateWorkItems(initiativeId, basePath);
  
  if (!result.success) {
    console.error('❌ Failed:', result.errors?.join(', '));
    process.exit(1);
  }
  
  await setWorkItemsConfig(basePath, initiativeId, {
    enabled: true,
    auto_generate: true,
    initialized_at: new Date().toISOString(),
  });
  
  console.log('✅ Work items initialized!\n');
  console.log(`   📁 ${result.path}`);
  console.log(`   📊 ${result.itemsGenerated.epics} epics, ${result.itemsGenerated.stories} stories, ${result.itemsGenerated.tasks} tasks`);
  console.log(`\n   Auto-generation enabled.\n`);
}

export async function workitemsGenerate(initiativeId: string, basePath = process.cwd()): Promise<void> {
  console.log(`\n🔄 Generating work items for ${initiativeId}...\n`);
  
  const result = await generateWorkItems(initiativeId, basePath);
  
  if (!result.success) {
    console.error('❌ Failed:', result.errors?.join(', '));
    process.exit(1);
  }
  
  console.log('✅ Generated!\n');
  console.log(`   ${result.itemsGenerated.epics} epics, ${result.itemsGenerated.stories} stories, ${result.itemsGenerated.tasks} tasks\n`);
}

export async function workitemsValidate(initiativeId: string, basePath = process.cwd()): Promise<void> {
  console.log(`\n🔍 Validating work items for ${initiativeId}...\n`);
  
  const result = await validateWorkItems(initiativeId, basePath);
  
  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    result.warnings.forEach(w => console.log(`   ${w.path}: ${w.message}`));
  }
  
  if (result.errors.length > 0) {
    console.error('❌ Errors:');
    result.errors.forEach(e => console.error(`   ${e.path}: [${e.rule}] ${e.message}`));
    process.exit(1);
  }
  
  console.log('✅ Valid!\n');
}

export async function workitemsTree(initiativeId: string, basePath = process.cwd()): Promise<void> {
  const manifestPath = join(basePath, 'openspec', 'initiatives', initiativeId, 'workitems', 'manifest.yaml');
  
  try {
    const manifest = parseYaml(await readFile(manifestPath, 'utf-8')) as WorkItemsManifest;
    
    console.log(`\n📋 ${manifest.project.title}`);
    console.log('═'.repeat(50));
    
    function printTree(nodes: typeof manifest.tree, indent = ''): void {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const isLast = i === nodes.length - 1;
        const prefix = isLast ? '└── ' : '├── ';
        const childIndent = isLast ? '    ' : '│   ';
        
        const statusIcon: Record<string, string> = { 
          backlog: '⬜', 
          todo: '📋', 
          in_progress: '🔄', 
          in_review: '👀', 
          done: '✅', 
          cancelled: '❌' 
        };
        const levelIcon: Record<string, string> = { 
          epic: '📦', 
          story: '📖', 
          task: '✏️' 
        };
        
        console.log(`${indent}${prefix}${levelIcon[node.level] ?? '?'} ${statusIcon[node.status] ?? '⬜'} ${node.id} ${node.title}`);
        if (node.children) printTree(node.children, indent + childIndent);
      }
    }
    
    printTree(manifest.tree);
    console.log('\n' + '─'.repeat(50));
    console.log(`📊 ${manifest.summary.total_items} items | Done: ${manifest.summary.by_status.done} | In Progress: ${manifest.summary.by_status.in_progress}\n`);
  } catch {
    console.error(`\n❌ Run "workitems init ${initiativeId}" first.\n`);
    process.exit(1);
  }
}

export async function workitemsCLI(args: string[]): Promise<void> {
  const [command, initiativeId] = args;
  
  if (!command || command === 'help') {
    console.log(`
📦 Work Items CLI

  init <id>      Initialize (enables auto-generation)
  generate <id>  Regenerate from Locus artifacts
  validate <id>  Validate structure
  tree <id>      Display tree
`);
    return;
  }
  
  if (!initiativeId) {
    console.error('❌ Missing initiative ID');
    process.exit(1);
  }
  
  switch (command) {
    case 'init': await workitemsInit(initiativeId); break;
    case 'generate': await workitemsGenerate(initiativeId); break;
    case 'validate': await workitemsValidate(initiativeId); break;
    case 'tree': await workitemsTree(initiativeId); break;
    default: console.error(`❌ Unknown: ${command}`); process.exit(1);
  }
}
