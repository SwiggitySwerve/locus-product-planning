/**
 * Auto-Generation Hook
 */

import { watch } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import { generateWorkItems } from './generate.js';
import type { WorkItemsConfig } from './types.js';

const WATCH_PATHS = ['tier2/epics', 'tier3/stories', 'tier3/tasks'];
const DEBOUNCE_MS = 500;

export function setupAutoGeneration(initiativeId: string, basePath = process.cwd()): () => void {
  const initiativePath = join(basePath, 'openspec', 'initiatives', initiativeId);
  let debounceTimer: NodeJS.Timeout | null = null;
  let isGenerating = false;
  let pendingRegenerate = false;
  const watchers: ReturnType<typeof watch>[] = [];
  
  async function regenerate(): Promise<void> {
    if (isGenerating) { pendingRegenerate = true; return; }
    isGenerating = true;
    
    try {
      console.log(`\n🔄 Auto-regenerating work items...`);
      const result = await generateWorkItems(initiativeId, basePath);
      console.log(result.success ? '✅ Updated' : `❌ ${result.errors?.join(', ')}`);
    } finally {
      isGenerating = false;
      if (pendingRegenerate) { pendingRegenerate = false; regenerate(); }
    }
  }
  
  function handleChange(_eventType: string, filename: string | null): void {
    if (!filename?.endsWith('.yaml') && !filename?.endsWith('.yml')) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => { debounceTimer = null; regenerate(); }, DEBOUNCE_MS);
  }
  
  for (const watchPath of WATCH_PATHS) {
    try {
      watchers.push(watch(join(initiativePath, watchPath), { recursive: true }, handleChange));
    } catch {
      // Directory may not exist
    }
  }
  
  return () => {
    watchers.forEach(w => w.close());
    if (debounceTimer) clearTimeout(debounceTimer);
  };
}

export async function isAutoGenerateEnabled(initiativeId: string, basePath = process.cwd()): Promise<boolean> {
  try {
    const config = parseYaml(await readFile(join(basePath, 'openspec', 'config.yaml'), 'utf-8')) as Record<string, unknown>;
    const wc = (config.workitems as Record<string, WorkItemsConfig> | undefined)?.[initiativeId];
    return !!(wc?.enabled && wc?.auto_generate);
  } catch { return false; }
}

export async function triggerAutoGenerate(initiativeId: string, basePath = process.cwd()): Promise<void> {
  if (await isAutoGenerateEnabled(initiativeId, basePath)) {
    try { await generateWorkItems(initiativeId, basePath); } catch {
      // Silently fail
    }
  }
}
