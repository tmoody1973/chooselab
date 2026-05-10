export const RUNWAY_MODELS = {
  realtimeAvatars: 'gwm1_avatars',
  imageGeneration: 'gen4_image',
  imageToVideo: 'gen4_turbo',
} as const;

export const CLAUDE_MODELS = {
  evaluator: 'claude-haiku-4-5-20251001',
} as const;

export const TIMEOUTS_MS = {
  realtimeSessionReady: 90_000,
  realtimeSessionPollInterval: 1_000,
  storyboardImageGeneration: 30_000,
  replayLensVideoGeneration: 90_000,
} as const;

export const RUNWAY_API_VERSION = '2024-11-06';

export const REPLAY_LENS = {
  storyboardRatio: '1920:1080',
  videoRatio: '1280:720',
  defaultDurationSeconds: 5,
} as const;

export const EVALUATOR = {
  maxResponseTokens: 800,
} as const;
