/**
 * Universal Work Items Types
 * Tool-agnostic work breakdown structure
 */

// =============================================================================
// Core Enums
// =============================================================================

export type WorkItemLevel = 'epic' | 'story' | 'task';

export type WorkItemStatus = 
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'done'
  | 'cancelled';

export type WorkItemPriority = 
  | 'urgent'
  | 'high'
  | 'medium'
  | 'low'
  | 'none';

export type EstimateUnit = 'points' | 'hours' | 'days' | 't-shirt';

export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

// =============================================================================
// Work Item Structures
// =============================================================================

export interface WorkItemMeta {
  schema_version: string;
  level: WorkItemLevel;
  source: {
    type: 'locus_epic' | 'locus_story' | 'locus_task';
    path: string;
  };
  generated_at: string;
}

export interface Estimate {
  value: number | TShirtSize;
  unit: EstimateUnit;
}

export interface UserStory {
  as_a: string;
  i_want: string;
  so_that: string;
}

export interface AcceptanceCriterionGWT {
  given: string;
  when: string;
  then: string;
}

export interface Dependency {
  type: 'internal' | 'external';
  id?: string;
  description?: string;
}

export interface Risk {
  description: string;
  mitigation?: string;
}

export interface SuccessMetric {
  metric: string;
  target: string;
}

// =============================================================================
// Base Work Item
// =============================================================================

export interface BaseWorkItem {
  _meta: WorkItemMeta;
  
  // Required
  id: string;
  title: string;
  description: string;
  status: WorkItemStatus;
  created_at: string;
  
  // Common
  updated_at?: string;
  priority?: WorkItemPriority;
  assignee?: string;
  labels?: string[];
  estimate?: Estimate;
  due_date?: string;
  
  // Relationships
  parent?: string;
  children?: string[];
  blocked_by?: string[];
  blocks?: string[];
  
  // Acceptance criteria
  acceptance_criteria?: (string | AcceptanceCriterionGWT)[];
}

// =============================================================================
// Level-Specific Work Items
// =============================================================================

export interface UniversalEpic extends BaseWorkItem {
  _meta: WorkItemMeta & { level: 'epic' };
  parent?: never;
  success_metrics?: SuccessMetric[];
  dependencies?: Dependency[];
  risks?: Risk[];
}

export interface UniversalStory extends BaseWorkItem {
  _meta: WorkItemMeta & { level: 'story' };
  parent: string;
  user_story?: UserStory;
}

export interface UniversalTask extends BaseWorkItem {
  _meta: WorkItemMeta & { level: 'task' };
  parent: string;
  children?: never;
  implementation_notes?: string;
  affected_files?: string[];
}

export type UniversalWorkItem = UniversalEpic | UniversalStory | UniversalTask;

// =============================================================================
// Manifest
// =============================================================================

export interface ManifestTreeNode {
  id: string;
  title: string;
  slug: string;
  level: WorkItemLevel;
  status: WorkItemStatus;
  priority?: WorkItemPriority;
  path: string;
  children?: ManifestTreeNode[];
}

export interface RelatedDocument {
  type: 'adr' | 'prd' | 'other';
  id: string;
  title: string;
  path: string;
}

export interface WorkItemsSummary {
  total_items: number;
  by_level: Record<WorkItemLevel, number>;
  by_status: Record<WorkItemStatus, number>;
  by_priority: Record<WorkItemPriority, number>;
}

export interface WorkItemsManifest {
  schema_version: string;
  generated_at: string;
  source: 'locus';
  
  project: {
    id: string;
    title: string;
    description: string;
  };
  
  tree: ManifestTreeNode[];
  
  related_documents?: {
    adrs?: RelatedDocument[];
    prd?: RelatedDocument;
  };
  
  summary: WorkItemsSummary;
}

// =============================================================================
// Results
// =============================================================================

export interface GenerationResult {
  success: boolean;
  path: string;
  itemsGenerated: {
    epics: number;
    stories: number;
    tasks: number;
  };
  errors?: string[];
  warnings?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  field?: string;
  rule: string;
  message: string;
}

export interface ValidationWarning {
  path: string;
  field?: string;
  message: string;
}

export interface WorkItemsConfig {
  enabled: boolean;
  auto_generate: boolean;
  initialized_at?: string;
}
