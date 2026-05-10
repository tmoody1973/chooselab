import RunwayML from '@runwayml/sdk';
import type { StoryArc } from '@/lib/adventure-types';
import { ADVENTURE, RUNWAY_MODELS, TIMEOUTS_MS } from '@/lib/constants';
import { buildTitleImagePrompt } from '@/lib/adventure/prompts';

interface CoverRequest {
  arc: StoryArc;
}

interface CoverResponse {
  coverUrl: string;
}

export async function POST(req: Request) {
  if (!process.env.RUNWAYML_API_SECRET) {
    return Response.json(
      { error: 'RUNWAYML_API_SECRET not configured' },
      { status: 500 }
    );
  }

  let body: CoverRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.arc?.title) {
    return Response.json({ error: 'Missing arc with title' }, { status: 400 });
  }

  const client = new RunwayML();

  try {
    const task = await client.textToImage
      .create({
        model: RUNWAY_MODELS.imageGeneration,
        promptText: buildTitleImagePrompt(body.arc),
        ratio: ADVENTURE.titleImageRatio,
      })
      .waitForTaskOutput({ timeout: TIMEOUTS_MS.panelImageGeneration });

    const coverUrl = task.output?.[0];
    if (!coverUrl) {
      return Response.json({ error: 'Cover task succeeded but returned no output' }, { status: 502 });
    }

    const response: CoverResponse = { coverUrl };
    return Response.json(response);
  } catch (err) {
    console.error('Cover generation failed:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Cover generation failed' },
      { status: 502 }
    );
  }
}
