import Runway from '@runwayml/sdk';
import { RUNWAY_MODELS, STORY_GUIDE, TIMEOUTS_MS } from '@/lib/constants';
import { STORYTELLER_TOOL_DEFINITIONS } from '@/lib/adventure/storyteller-tools';

export const maxDuration = 120;

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

const TERMINAL_FAILURE_STATUSES = new Set(['COMPLETED', 'FAILED', 'CANCELLED']);

export async function POST() {
  const { id: sessionId } = await client.realtimeSessions.create({
    model: RUNWAY_MODELS.realtimeAvatars,
    avatar: { type: 'custom', avatarId: STORY_GUIDE.lyraAvatarId },
    tools: STORYTELLER_TOOL_DEFINITIONS,
  });

  const session = await pollSessionUntilReady(sessionId);

  return Response.json({ sessionId, sessionKey: session.sessionKey });
}

async function pollSessionUntilReady(sessionId: string) {
  const deadline = Date.now() + TIMEOUTS_MS.realtimeSessionReady;

  while (Date.now() < deadline) {
    const session = await client.realtimeSessions.retrieve(sessionId);

    if (session.status === 'READY') return session;

    if (TERMINAL_FAILURE_STATUSES.has(session.status)) {
      throw new Error(`Storyteller session ${session.status.toLowerCase()} before becoming ready`);
    }

    await sleep(TIMEOUTS_MS.realtimeSessionPollInterval);
  }

  throw new Error('Storyteller session creation timed out');
}

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}
