#!/usr/bin/env node
/**
 * Initiative Flow CLI
 * Command-line interface for managing initiatives
 */

import { parseArgs } from 'node:util';
import { join } from 'path';
import { loadSchema } from '../lib/schema.js';
import { getInitiativeStatus, getTierStatus } from '../lib/status.js';
import { checkGate } from '../lib/gates.js';
import { canTransition, applyTransition, getCurrentStage } from '../lib/state-machine.js';
import { workitemsCLI } from '../lib/workitems/cli.js';
import type { TierId, GateId, StageStatus } from '../lib/types.js';

const INITIATIVES_PATH = join(process.cwd(), 'openspec', 'initiatives');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function printHelp() {
  console.log(`
${colors.bold}Initiative Flow CLI${colors.reset}

${colors.cyan}Usage:${colors.reset}
  npx ts-node openspec/bin/cli.ts <command> [options]

${colors.cyan}Commands:${colors.reset}
  status <initiative-id>     Show full initiative status
  tier <initiative-id> <tier>  Show tier status (tier1, tier2, tier3, tier4)
  gate <initiative-id> <gate>  Check gate criteria (strategic, product, design, implementation)
  stage <initiative-id>      Show current stage
  next <initiative-id>       Show next action
  transition <initiative-id> <from> <to>  Apply stage transition
  workitems <subcommand>     Manage universal work items (init, validate, help)

${colors.cyan}Options:${colors.reset}
  --help, -h                 Show this help message
  --json                     Output as JSON

${colors.cyan}Examples:${colors.reset}
  npx ts-node openspec/bin/cli.ts status INI-001
  npx ts-node openspec/bin/cli.ts gate INI-001 strategic
  npx ts-node openspec/bin/cli.ts transition INI-001 tier1_active tier1_approved
`);
}

function formatStatus(status: 'blocked' | 'ready' | 'done' | 'passed' | 'pending'): string {
  switch (status) {
    case 'done':
    case 'passed':
      return `${colors.green}${status}${colors.reset}`;
    case 'ready':
    case 'pending':
      return `${colors.yellow}${status}${colors.reset}`;
    case 'blocked':
      return `${colors.red}${status}${colors.reset}`;
    default:
      return status;
  }
}

async function commandStatus(initiativeId: string, asJson: boolean) {
  const schema = await loadSchema('initiative-flow');
  const status = await getInitiativeStatus(initiativeId, schema, INITIATIVES_PATH);

  if (asJson) {
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  console.log(`\n${colors.bold}Initiative: ${status.initiative}${colors.reset}`);
  console.log(`Title: ${status.title}`);
  console.log(`Stage: ${colors.cyan}${status.currentStage}${colors.reset}`);
  console.log(`Complete: ${status.isComplete ? colors.green + 'Yes' : colors.yellow + 'No'}${colors.reset}`);
  
  if (status.completedTiers.length > 0) {
    console.log(`Completed Tiers: ${status.completedTiers.join(', ')}`);
  }

  console.log(`\n${colors.bold}Artifacts:${colors.reset}`);
  for (const artifact of status.artifacts) {
    const statusStr = formatStatus(artifact.status);
    const deps = artifact.missingDeps.length > 0 ? ` (blocked by: ${artifact.missingDeps.join(', ')})` : '';
    console.log(`  ${artifact.tier}/${artifact.id}: ${statusStr}${deps}`);
  }

  console.log(`\n${colors.bold}Gates:${colors.reset}`);
  for (const gate of status.gates) {
    const statusStr = formatStatus(gate.status);
    console.log(`  ${gate.id}: ${statusStr}`);
  }

  if (status.nextAction) {
    console.log(`\n${colors.bold}Next Action:${colors.reset}`);
    console.log(`  Create ${colors.cyan}${status.nextAction.artifact}${colors.reset} -> ${status.nextAction.generates}`);
  }

  if (status.blockers.length > 0) {
    console.log(`\n${colors.red}Blockers:${colors.reset}`);
    for (const blocker of status.blockers) {
      console.log(`  - ${blocker}`);
    }
  }

  if (status.escalations.length > 0) {
    console.log(`\n${colors.yellow}Escalations:${colors.reset}`);
    for (const esc of status.escalations) {
      const resolved = esc.resolved_at ? colors.green + ' (resolved)' : colors.red + ' (open)';
      console.log(`  - ${esc.id}: ${esc.reason}${resolved}${colors.reset}`);
    }
  }

  console.log('');
}

async function commandTier(initiativeId: string, tierId: string, asJson: boolean) {
  const schema = await loadSchema('initiative-flow');
  const status = await getTierStatus(initiativeId, tierId as TierId, schema, INITIATIVES_PATH);

  if (asJson) {
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  console.log(`\n${colors.bold}Tier: ${status.name} (${status.tier})${colors.reset}`);
  console.log(`Council: ${status.council}`);
  console.log(`Completion: ${status.completionPct.toFixed(0)}%`);
  console.log(`Blocked: ${status.isBlocked ? colors.red + 'Yes' : colors.green + 'No'}${colors.reset}`);

  console.log(`\n${colors.bold}Artifacts:${colors.reset}`);
  for (const artifact of status.artifacts) {
    const statusStr = formatStatus(artifact.status);
    console.log(`  ${artifact.id}: ${statusStr}`);
  }

  if (status.blockedBy.length > 0) {
    console.log(`\n${colors.red}Blocked by:${colors.reset} ${status.blockedBy.join(', ')}`);
  }

  console.log('');
}

async function commandGate(initiativeId: string, gateId: string, asJson: boolean) {
  const schema = await loadSchema('initiative-flow');
  const result = await checkGate(initiativeId, gateId as GateId, schema, INITIATIVES_PATH);

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const passedStr = result.passed
    ? `${colors.green}PASSED${colors.reset}`
    : `${colors.red}FAILED${colors.reset}`;

  console.log(`\n${colors.bold}Gate: ${result.gate}${colors.reset} - ${passedStr}`);
  console.log(`Criteria: ${result.criteriaMet}/${result.criteriaTotal}`);

  console.log(`\n${colors.bold}Criteria:${colors.reset}`);
  for (const criterion of result.criteria) {
    const statusStr = criterion.passed
      ? `${colors.green}PASS${colors.reset}`
      : `${colors.red}FAIL${colors.reset}`;
    console.log(`  [${statusStr}] ${criterion.criterion}`);
    if (!criterion.passed && criterion.reason) {
      console.log(`       ${colors.dim}${criterion.reason}${colors.reset}`);
    }
  }

  console.log('');
}

async function commandStage(initiativeId: string, asJson: boolean) {
  const stage = await getCurrentStage(initiativeId, INITIATIVES_PATH);

  if (asJson) {
    console.log(JSON.stringify({ stage }));
    return;
  }

  console.log(`\nCurrent stage: ${colors.cyan}${stage}${colors.reset}\n`);
}

async function commandNext(initiativeId: string, asJson: boolean) {
  const schema = await loadSchema('initiative-flow');
  const status = await getInitiativeStatus(initiativeId, schema, INITIATIVES_PATH);

  if (asJson) {
    console.log(JSON.stringify(status.nextAction));
    return;
  }

  if (!status.nextAction) {
    console.log(`\n${colors.green}No pending actions - initiative complete or blocked${colors.reset}\n`);
    return;
  }

  console.log(`\n${colors.bold}Next Action:${colors.reset}`);
  console.log(`  Artifact: ${colors.cyan}${status.nextAction.artifact}${colors.reset}`);
  console.log(`  Tier: ${status.nextAction.tier}`);
  console.log(`  Generates: ${status.nextAction.generates}`);
  console.log(`  Description: ${status.nextAction.description}`);
  console.log('');
}

async function commandTransition(
  initiativeId: string,
  from: string,
  to: string,
  asJson: boolean
) {
  const schema = await loadSchema('initiative-flow');

  // First validate
  const validation = await canTransition(
    initiativeId,
    from as StageStatus,
    to as StageStatus,
    schema,
    INITIATIVES_PATH
  );

  if (!validation.valid) {
    if (asJson) {
      console.log(JSON.stringify({ success: false, error: validation.reason }));
      process.exit(1);
    }
    console.log(`\n${colors.red}Cannot transition: ${validation.reason}${colors.reset}\n`);
    process.exit(1);
  }

  // Apply transition
  const result = await applyTransition(
    initiativeId,
    from as StageStatus,
    to as StageStatus,
    schema,
    INITIATIVES_PATH
  );

  if (asJson) {
    console.log(JSON.stringify(result));
    return;
  }

  if (result.success) {
    console.log(`\n${colors.green}Transition successful${colors.reset}`);
    console.log(`  ${result.previousStage} -> ${result.newStage}\n`);
  } else {
    console.log(`\n${colors.red}Transition failed: ${result.error}${colors.reset}\n`);
    process.exit(1);
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      json: { type: 'boolean' },
    },
  });

  if (values.help || positionals.length === 0) {
    printHelp();
    process.exit(0);
  }

  const [command, ...args] = positionals;
  const asJson = values.json ?? false;

  try {
    switch (command) {
      case 'status':
        if (!args[0]) throw new Error('Missing initiative ID');
        await commandStatus(args[0], asJson);
        break;

      case 'tier':
        if (!args[0] || !args[1]) throw new Error('Usage: tier <initiative-id> <tier>');
        await commandTier(args[0], args[1], asJson);
        break;

      case 'gate':
        if (!args[0] || !args[1]) throw new Error('Usage: gate <initiative-id> <gate>');
        await commandGate(args[0], args[1], asJson);
        break;

      case 'stage':
        if (!args[0]) throw new Error('Missing initiative ID');
        await commandStage(args[0], asJson);
        break;

      case 'next':
        if (!args[0]) throw new Error('Missing initiative ID');
        await commandNext(args[0], asJson);
        break;

      case 'transition':
        if (!args[0] || !args[1] || !args[2]) {
          throw new Error('Usage: transition <initiative-id> <from> <to>');
        }
        await commandTransition(args[0], args[1], args[2], asJson);
        break;

      case 'workitems':
        await workitemsCLI(args);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
  } catch (error) {
    if (asJson) {
      console.log(JSON.stringify({ error: (error as Error).message }));
    } else {
      console.error(`${colors.red}Error: ${(error as Error).message}${colors.reset}`);
    }
    process.exit(1);
  }
}

main();
