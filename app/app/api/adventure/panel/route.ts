import type { StoryArc, PanelData, Choice } from '@/lib/adventure-types';
import { ADVENTURE } from '@/lib/constants';
import { callSonnetForJson } from '@/lib/adventure/sonnet';
import {
  buildPanelSystemPrompt,
  buildPanelUserPrompt,
  buildPanelImagePrompt,
} from '@/lib/adventure/prompts';

interface PanelRequest {
  arc: StoryArc;
  panelIndex: number;
  choiceHistory: string[];
}

interface PanelResponse {
  panelData: PanelData;
}

export async function POST(req: Request) {
  let body: PanelRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = validatePanelRequest(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const panel = body.arc.panels.find((p) => p.index === body.panelIndex);
  if (!panel) {
    return Response.json(
      { error: `Panel ${body.panelIndex} not found in arc` },
      { status: 400 }
    );
  }

  const isFinalPanel = body.panelIndex >= ADVENTURE.panelDepth;

  let writerResult: PanelWriterResult;
  try {
    writerResult = await callSonnetForJson<PanelWriterResult>({
      systemPrompt: buildPanelSystemPrompt(),
      userPrompt: buildPanelUserPrompt({
        arc: body.arc,
        panel,
        choiceHistory: body.choiceHistory,
        isFinalPanel,
      }),
      architectMode: false,
      maxTokens: 2500,
    });
  } catch (err) {
    console.error(`Panel ${body.panelIndex} writer failed:`, err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Panel writer failed' },
      { status: 502 }
    );
  }

  const fullImagePrompt = buildPanelImagePrompt(body.arc, writerResult.imagePromptCore);

  const panelData: PanelData = {
    panelId: panel.panelId,
    index: panel.index,
    isClimax: panel.isClimax,
    narratorText: writerResult.narratorText,
    thoughtBubble: writerResult.thoughtBubble,
    imageUrl: '',
    narrationAudioUrl: '',
    ambientSoundUrl: '',
    choices: normalizeChoices(writerResult.choices ?? [], isFinalPanel),
  };

  const response: PanelResponse = {
    panelData: {
      ...panelData,
      // Pass the asset prompts through so the asset orchestrator can call them.
      // We attach them on a sidecar field because PanelData is the persisted shape.
      // (See /api/adventure/assets which consumes these.)
    },
  };

  // Return both the panel data + the asset prompts for the orchestrator.
  return Response.json({
    panelData,
    assetPrompts: {
      imagePrompt: fullImagePrompt,
      ambientSoundPrompt: writerResult.ambientSoundPrompt,
      narratorText: writerResult.narratorText,
    },
  });
}

interface PanelWriterResult {
  narratorText: string;
  thoughtBubble: string;
  imagePromptCore: string;
  ambientSoundPrompt: string;
  choices?: Array<{ id: string; label: string; rationale: string }>;
}

function normalizeChoices(rawChoices: Array<{ id: string; label: string; rationale: string }>, isFinalPanel: boolean): Choice[] {
  if (isFinalPanel) return [];
  return rawChoices.slice(0, ADVENTURE.branchesPerChoice).map((c) => ({
    id: c.id,
    label: c.label,
    rationale: c.rationale,
  }));
}

function validatePanelRequest(body: PanelRequest): { ok: true } | { ok: false; error: string } {
  if (!body.arc) return { ok: false, error: 'Missing arc' };
  if (typeof body.panelIndex !== 'number') return { ok: false, error: 'Missing panelIndex' };
  if (!Array.isArray(body.choiceHistory)) {
    return { ok: false, error: 'Missing choiceHistory array' };
  }
  return { ok: true };
}
