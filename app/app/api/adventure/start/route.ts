import type { AdventureSeed, StoryArc, PanelSpec } from '@/lib/adventure-types';
import { ADVENTURE } from '@/lib/constants';
import { callSonnetForJson } from '@/lib/adventure/sonnet';
import {
  buildArchitectSystemPrompt,
  buildArchitectUserPrompt,
} from '@/lib/adventure/prompts';

export const maxDuration = 60;

interface StartAdventureRequest {
  seed: AdventureSeed;
}

interface StartAdventureResponse {
  arc: StoryArc;
  sessionId: string;
}

export async function POST(req: Request) {
  let body: StartAdventureRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = validateSeed(body.seed);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  let architectResult: ArchitectResult;
  try {
    architectResult = await callSonnetForJson<ArchitectResult>({
      systemPrompt: buildArchitectSystemPrompt(),
      userPrompt: buildArchitectUserPrompt(body.seed),
      architectMode: true,
      maxTokens: 3000,
    });
  } catch (err) {
    console.error('Story architect failed:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Story architect failed' },
      { status: 502 }
    );
  }

  const arc = normalizeArc(architectResult);
  const sessionId = crypto.randomUUID();

  const response: StartAdventureResponse = { arc, sessionId };
  return Response.json(response);
}

interface ArchitectResult {
  title: string;
  hero: { name: string; appearanceLock: string; voiceTrait: string };
  world: { settingDescription: string; moralTheme: string };
  ageBand: '5-7' | '8-10';
  panels: Array<{ index: number; beat: string; tone: string }>;
}

function normalizeArc(result: ArchitectResult): StoryArc {
  const panels: PanelSpec[] = result.panels
    .sort((a, b) => a.index - b.index)
    .map((p) => ({
      panelId: `panel-${p.index}`,
      index: p.index,
      isClimax: p.index === ADVENTURE.panelDepth - 1,
      beat: p.beat,
      emotionalTone: p.tone,
    }));

  return {
    title: result.title,
    hero: result.hero,
    worldDescription: result.world.settingDescription,
    moralTheme: result.world.moralTheme,
    ageBand: result.ageBand,
    panels,
  };
}

function validateSeed(seed: AdventureSeed | undefined): { ok: true } | { ok: false; error: string } {
  if (!seed) return { ok: false, error: 'Missing seed' };
  if (!seed.setting?.id || !seed.hero?.id || !seed.problem?.id) {
    return { ok: false, error: 'Seed must include setting, hero, and problem' };
  }
  return { ok: true };
}
