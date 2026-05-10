import RunwayML from '@runwayml/sdk';
import { ADVENTURE, RUNWAY_MODELS, STORY_GUIDE, TIMEOUTS_MS } from '@/lib/constants';

export const maxDuration = 300;

interface AssetsRequest {
  imagePrompt: string;
  ambientSoundPrompt: string;
  narratorText: string;
  /**
   * When true, also generates a climax animation by feeding the still image
   * back into gen4_turbo for a 5-second animated version. Adds ~60-120s.
   */
  generateClimaxAnimation?: boolean;
}

interface AssetsResponse {
  imageUrl: string;
  ambientSoundUrl: string;
  narrationAudioUrl: string;
  videoUrl?: string;
}

interface FailureBag {
  imageError?: string;
  ambientError?: string;
  narrationError?: string;
  videoError?: string;
}

export async function POST(req: Request) {
  if (!process.env.RUNWAYML_API_SECRET) {
    return Response.json(
      { error: 'RUNWAYML_API_SECRET not configured' },
      { status: 500 }
    );
  }

  let body: AssetsRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = validateAssetsRequest(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const client = new RunwayML();

  // Run image, ambient sound, and narration all in parallel.
  const [imageResult, ambientResult, narrationResult] = await Promise.allSettled([
    generatePanelImage(client, body.imagePrompt),
    generateAmbientSound(client, body.ambientSoundPrompt),
    generateNarrationAudio(client, body.narratorText),
  ]);

  const failures: FailureBag = {};
  const imageUrl = pickResult(imageResult, 'image', failures);
  const ambientSoundUrl = pickResult(ambientResult, 'ambient', failures);
  const narrationAudioUrl = pickResult(narrationResult, 'narration', failures);

  if (!imageUrl) {
    return Response.json(
      {
        error: 'Panel image generation failed — cannot render panel without illustration',
        failures,
      },
      { status: 502 }
    );
  }

  let videoUrl: string | undefined;
  if (body.generateClimaxAnimation) {
    try {
      videoUrl = await generateClimaxVideo(client, imageUrl, body.imagePrompt);
    } catch (err) {
      failures.videoError = err instanceof Error ? err.message : 'video failed';
      console.error('Climax video failed:', err);
      // Soft-fail: panel still renders without animation
    }
  }

  const response: AssetsResponse = {
    imageUrl,
    ambientSoundUrl: ambientSoundUrl ?? '',
    narrationAudioUrl: narrationAudioUrl ?? '',
    videoUrl,
  };

  return Response.json(response);
}

async function generatePanelImage(client: RunwayML, prompt: string): Promise<string> {
  const task = await client.textToImage
    .create({
      model: RUNWAY_MODELS.imageGeneration,
      promptText: prompt,
      ratio: ADVENTURE.panelImageRatio,
    })
    .waitForTaskOutput({ timeout: TIMEOUTS_MS.panelImageGeneration });
  const url = task.output?.[0];
  if (!url) throw new Error('Image task succeeded but returned no output');
  return url;
}

async function generateAmbientSound(client: RunwayML, prompt: string): Promise<string> {
  const task = await client.soundEffect
    .create({
      model: RUNWAY_MODELS.textToSoundEffect,
      promptText: prompt,
      duration: ADVENTURE.ambientSoundDurationSeconds,
    })
    .waitForTaskOutput({ timeout: TIMEOUTS_MS.ambientSoundGeneration });
  const url = task.output?.[0];
  if (!url) throw new Error('Sound task succeeded but returned no output');
  return url;
}

async function generateNarrationAudio(client: RunwayML, text: string): Promise<string> {
  const task = await client.textToSpeech
    .create({
      model: RUNWAY_MODELS.textToSpeech,
      promptText: text,
      voice: { type: 'runway-preset', presetId: STORY_GUIDE.voicePresetId },
    })
    .waitForTaskOutput({ timeout: TIMEOUTS_MS.ambientSoundGeneration });
  const url = task.output?.[0];
  if (!url) throw new Error('Narration task succeeded but returned no output');
  return url;
}

async function generateClimaxVideo(
  client: RunwayML,
  imageUrl: string,
  imagePrompt: string
): Promise<string> {
  const task = await client.imageToVideo
    .create({
      model: RUNWAY_MODELS.imageToVideo,
      promptImage: imageUrl,
      promptText: imagePrompt,
      ratio: ADVENTURE.climaxVideoRatio,
      duration: ADVENTURE.climaxVideoDurationSeconds,
    })
    .waitForTaskOutput({ timeout: TIMEOUTS_MS.climaxVideoGeneration });
  const url = task.output?.[0];
  if (!url) throw new Error('Video task succeeded but returned no output');
  return url;
}

function pickResult(
  result: PromiseSettledResult<string>,
  kind: 'image' | 'ambient' | 'narration',
  failures: FailureBag
): string | undefined {
  if (result.status === 'fulfilled') return result.value;
  const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
  console.error(`${kind} generation failed:`, message);
  if (kind === 'image') failures.imageError = message;
  if (kind === 'ambient') failures.ambientError = message;
  if (kind === 'narration') failures.narrationError = message;
  return undefined;
}

function validateAssetsRequest(body: AssetsRequest): { ok: true } | { ok: false; error: string } {
  if (!body.imagePrompt || typeof body.imagePrompt !== 'string') {
    return { ok: false, error: 'Missing imagePrompt' };
  }
  if (!body.ambientSoundPrompt || typeof body.ambientSoundPrompt !== 'string') {
    return { ok: false, error: 'Missing ambientSoundPrompt' };
  }
  if (!body.narratorText || typeof body.narratorText !== 'string') {
    return { ok: false, error: 'Missing narratorText' };
  }
  return { ok: true };
}
