import fs from 'fs/promises';
import path from 'path';

export interface RubricDimension {
  id: string;
  name: string;
  framework_source: string;
  scoring: Record<string, { label: string; criteria: string; example: string }>;
}

export interface Rubric {
  id: string;
  version: string;
  target_skill: string;
  scale_per_dimension: string;
  max_total: number;
  dimensions: RubricDimension[];
  worked_examples: {
    strong: Array<{ label: string; response: string; scores: Record<string, number>; total: number; reasoning: string }>;
    weak: Array<{ label: string; response: string; scores: Record<string, number>; total: number; reasoning: string }>;
  };
  do_not_score: string[];
  evaluator_directive: string;
  attribution: string;
}

export interface Scenario {
  id: string;
  rubric_id: string;
  target_skill: string;
  domain: string;
  character: { name: string; role: string };
  user_role: string;
  success_criteria: string[];
  common_missteps: string[];
}

const ROOT = path.resolve(process.cwd(), '..');
const RUBRIC_DIR = path.join(ROOT, 'data', 'rubrics');
const SCENARIO_DIR = path.join(ROOT, 'data', 'scenarios');

const RUBRIC_FILES: Record<string, string> = {
  empathy_v1: 'empathy.json',
  self_advocacy_v1: 'self_advocacy.json',
  interview_v1: 'interview.json',
};

const SCENARIO_FILES: Record<string, string> = {
  workplace_empathy_001: 'workplace_empathy.json',
  school_self_advocacy_001: 'school_self_advocacy.json',
  interview_prep_001: 'interview_prep.json',
};

export async function loadScenario(scenarioId: string): Promise<Scenario> {
  const filename = SCENARIO_FILES[scenarioId];
  if (!filename) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }
  const text = await fs.readFile(path.join(SCENARIO_DIR, filename), 'utf-8');
  return JSON.parse(text) as Scenario;
}

export async function loadRubric(rubricId: string): Promise<Rubric> {
  const filename = RUBRIC_FILES[rubricId];
  if (!filename) {
    throw new Error(`Unknown rubric: ${rubricId}`);
  }
  const text = await fs.readFile(path.join(RUBRIC_DIR, filename), 'utf-8');
  return JSON.parse(text) as Rubric;
}

export async function loadRubricForScenario(scenarioId: string): Promise<{ scenario: Scenario; rubric: Rubric }> {
  const scenario = await loadScenario(scenarioId);
  const rubric = await loadRubric(scenario.rubric_id);
  return { scenario, rubric };
}
