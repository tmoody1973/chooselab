import Runway from '@runwayml/sdk';
import { getPresetAvatarMetadata } from '@/lib/preset-avatars';
import { RUNWAY_MODELS, TIMEOUTS_MS } from '@/lib/constants';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

const TERMINAL_FAILURE_STATUSES = new Set(['COMPLETED', 'FAILED', 'CANCELLED']);

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  const avatar = resolveAvatarReference(avatarId);

  const { id: sessionId } = await client.realtimeSessions.create({
    model: RUNWAY_MODELS.realtimeAvatars,
    avatar,
  });

  const session = await pollSessionUntilReady(sessionId);

  return Response.json({ sessionId, sessionKey: session.sessionKey });
}

function resolveAvatarReference(avatarId: string) {
  return getPresetAvatarMetadata(avatarId)
    ? ({ type: 'runway-preset' as const, presetId: avatarId })
    : ({ type: 'custom' as const, avatarId });
}

async function pollSessionUntilReady(sessionId: string) {
  const deadline = Date.now() + TIMEOUTS_MS.realtimeSessionReady;

  while (Date.now() < deadline) {
    const session = await client.realtimeSessions.retrieve(sessionId);

    if (session.status === 'READY') return session;

    if (TERMINAL_FAILURE_STATUSES.has(session.status)) {
      throw new Error(`Session ${session.status.toLowerCase()} before becoming ready`);
    }

    await sleep(TIMEOUTS_MS.realtimeSessionPollInterval);
  }

  throw new Error('Session creation timed out');
}

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}
