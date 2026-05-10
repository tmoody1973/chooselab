import RunwayML from '@runwayml/sdk';
import { loadScenario } from '@/lib/load-rubric';
import { RUNWAY_MODELS, TIMEOUTS_MS, REPLAY_LENS } from '@/lib/constants';

interface ReplayLensRequest {
  scenarioId: string;
}

interface ReplayLensResponse {
  videoUrl: string;
  fallback: boolean;
  storyboardUrl?: string;
}

interface ReplayLensTemplate {
  model: string;
  duration_seconds: number;
  ratio: string;
  scene_intent: string;
  prompt_text: string;
  do_not?: string[];
}

interface ScenarioWithReplayLens {
  id: string;
  replay_lens_prompt_template?: ReplayLensTemplate;
}

const FALLBACK_PATH_BY_SCENARIO: Record<string, string> = {
  workplace_empathy_001: '/fallbacks/workplace_empathy.mp4',
  school_self_advocacy_001: '/fallbacks/school_self_advocacy.mp4',
  interview_prep_001: '/fallbacks/interview_prep.mp4',
};

export async function POST(req: Request) {
  const apiKey = process.env.RUNWAYML_API_SECRET;
  if (!apiKey) {
    return Response.json(
      { error: 'RUNWAYML_API_SECRET not configured' },
      { status: 500 }
    );
  }

  const requestParseResult = await parseRequestBody(req);
  if (!requestParseResult.ok) {
    return requestParseResult.response;
  }
  const { scenarioId } = requestParseResult.body;
  const fallbackUrl = FALLBACK_PATH_BY_SCENARIO[scenarioId];

  let template: ReplayLensTemplate;
  try {
    template = await loadReplayLensTemplate(scenarioId);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to load scenario' },
      { status: 400 }
    );
  }

  const client = new RunwayML();

  const storyboardResult = await generateStoryboardFrame(client, template);
  if (!storyboardResult.ok) {
    return respondWithFallback(fallbackUrl, storyboardResult.reason);
  }

  const videoResult = await generateReplayVideo(client, template, storyboardResult.imageUrl);
  if (!videoResult.ok) {
    return respondWithFallback(fallbackUrl, videoResult.reason);
  }

  const response: ReplayLensResponse = {
    videoUrl: videoResult.videoUrl,
    fallback: false,
    storyboardUrl: storyboardResult.imageUrl,
  };
  return Response.json(response);
}

async function parseRequestBody(
  req: Request
): Promise<{ ok: true; body: ReplayLensRequest } | { ok: false; response: Response }> {
  let body: ReplayLensRequest;
  try {
    body = await req.json();
  } catch {
    return { ok: false, response: Response.json({ error: 'Invalid JSON body' }, { status: 400 }) };
  }
  if (!body.scenarioId) {
    return {
      ok: false,
      response: Response.json({ error: 'Missing required field: scenarioId' }, { status: 400 }),
    };
  }
  return { ok: true, body };
}

async function loadReplayLensTemplate(scenarioId: string): Promise<ReplayLensTemplate> {
  const scenario = (await loadScenario(scenarioId)) as ScenarioWithReplayLens;
  const template = scenario.replay_lens_prompt_template;
  if (!template) {
    throw new Error(`Scenario ${scenarioId} has no replay_lens_prompt_template`);
  }
  return template;
}

async function generateStoryboardFrame(
  client: RunwayML,
  template: ReplayLensTemplate
): Promise<{ ok: true; imageUrl: string } | { ok: false; reason: string }> {
  try {
    const imageTask = await client.textToImage
      .create({
        model: RUNWAY_MODELS.imageGeneration,
        promptText: buildStoryboardPrompt(template),
        ratio: REPLAY_LENS.storyboardRatio,
      })
      .waitForTaskOutput({ timeout: TIMEOUTS_MS.storyboardImageGeneration });

    const imageUrl = imageTask.output?.[0];
    if (!imageUrl) {
      return { ok: false, reason: 'storyboard_no_output' };
    }
    return { ok: true, imageUrl };
  } catch (err) {
    console.error('Storyboard frame failed:', err);
    return { ok: false, reason: 'storyboard_failed' };
  }
}

async function generateReplayVideo(
  client: RunwayML,
  template: ReplayLensTemplate,
  storyboardUrl: string
): Promise<{ ok: true; videoUrl: string } | { ok: false; reason: string }> {
  try {
    const videoTask = await client.imageToVideo
      .create({
        model: RUNWAY_MODELS.imageToVideo,
        promptImage: storyboardUrl,
        promptText: template.prompt_text,
        ratio: (template.ratio as '1280:720') ?? REPLAY_LENS.videoRatio,
        duration: (template.duration_seconds as 5) ?? REPLAY_LENS.defaultDurationSeconds,
      })
      .waitForTaskOutput({ timeout: TIMEOUTS_MS.replayLensVideoGeneration });

    const videoUrl = videoTask.output?.[0];
    if (!videoUrl) {
      return { ok: false, reason: 'video_no_output' };
    }
    return { ok: true, videoUrl };
  } catch (err) {
    console.error('Replay Lens video generation failed:', err);
    return { ok: false, reason: 'video_failed' };
  }
}

function buildStoryboardPrompt(template: ReplayLensTemplate): string {
  const doNotList = (template.do_not ?? []).map((rule) => `- ${rule}`).join('\n');
  const styleGuide =
    'Photorealistic, cinematic still frame. Soft natural lighting, realistic skin tones, no exaggerated facial expressions, no dramatic shadows.';
  const doNotBlock = doNotList ? `Do not include:\n${doNotList}` : '';
  return [template.prompt_text, styleGuide, doNotBlock].filter(Boolean).join('\n\n');
}

function respondWithFallback(fallbackUrl: string | undefined, reason: string): Response {
  if (!fallbackUrl) {
    return Response.json(
      { error: 'Replay Lens generation failed and no fallback configured', reason },
      { status: 502 }
    );
  }
  const response: ReplayLensResponse = {
    videoUrl: fallbackUrl,
    fallback: true,
  };
  return Response.json(response);
}
