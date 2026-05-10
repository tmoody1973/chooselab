import RunwayML from '@runwayml/sdk';
import { loadScenario } from '@/lib/load-rubric';

interface ReplayLensRequest {
  scenarioId: string;
}

interface ReplayLensResponse {
  videoUrl: string;
  fallback: boolean;
  storyboardUrl?: string;
}

interface ScenarioWithReplayLens {
  id: string;
  replay_lens_prompt_template?: {
    model: string;
    duration_seconds: number;
    ratio: string;
    scene_intent: string;
    prompt_text: string;
    do_not?: string[];
  };
}

const FALLBACK_PATH: Record<string, string> = {
  workplace_empathy_001: '/fallbacks/workplace_empathy.mp4',
  school_self_advocacy_001: '/fallbacks/school_self_advocacy.mp4',
  interview_prep_001: '/fallbacks/interview_prep.mp4',
};

const VIDEO_TIMEOUT_MS = 90_000;
const IMAGE_TIMEOUT_MS = 30_000;

export async function POST(req: Request) {
  if (!process.env.RUNWAYML_API_SECRET) {
    return Response.json(
      { error: 'RUNWAYML_API_SECRET not configured' },
      { status: 500 }
    );
  }

  let body: ReplayLensRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.scenarioId) {
    return Response.json(
      { error: 'Missing required field: scenarioId' },
      { status: 400 }
    );
  }

  const fallbackUrl = FALLBACK_PATH[body.scenarioId];

  let scenario: ScenarioWithReplayLens;
  try {
    scenario = (await loadScenario(body.scenarioId)) as ScenarioWithReplayLens;
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to load scenario' },
      { status: 400 }
    );
  }

  const template = scenario.replay_lens_prompt_template;
  if (!template) {
    return Response.json(
      { error: `Scenario ${body.scenarioId} has no replay_lens_prompt_template` },
      { status: 400 }
    );
  }

  const client = new RunwayML();

  let storyboardUrl: string | undefined;

  try {
    const imageTask = await client.textToImage
      .create({
        model: 'gen4_image',
        promptText: buildStoryboardPrompt(template),
        ratio: '1920:1080',
      })
      .waitForTaskOutput({ timeout: IMAGE_TIMEOUT_MS });

    storyboardUrl = imageTask.output?.[0];
    if (!storyboardUrl) {
      throw new Error('Image task succeeded but returned no output');
    }
  } catch (err) {
    console.error('Storyboard frame failed:', err);
    return respondWithFallback(fallbackUrl, 'storyboard_failed');
  }

  try {
    const videoTask = await client.imageToVideo
      .create({
        model: 'gen4_turbo',
        promptImage: storyboardUrl,
        promptText: template.prompt_text,
        ratio: (template.ratio as '1280:720') ?? '1280:720',
        duration: (template.duration_seconds as 5) ?? 5,
      })
      .waitForTaskOutput({ timeout: VIDEO_TIMEOUT_MS });

    const videoUrl = videoTask.output?.[0];
    if (!videoUrl) {
      throw new Error('Video task succeeded but returned no output');
    }

    const response: ReplayLensResponse = {
      videoUrl,
      fallback: false,
      storyboardUrl,
    };
    return Response.json(response);
  } catch (err) {
    console.error('Replay Lens video generation failed:', err);
    return respondWithFallback(fallbackUrl, 'video_failed');
  }
}

function buildStoryboardPrompt(template: NonNullable<ScenarioWithReplayLens['replay_lens_prompt_template']>): string {
  const doNot = (template.do_not ?? []).map((rule) => `- ${rule}`).join('\n');
  return [
    template.prompt_text,
    'Photorealistic, cinematic still frame. Soft natural lighting, realistic skin tones, no exaggerated facial expressions, no dramatic shadows.',
    doNot ? `Do not include:\n${doNot}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
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
