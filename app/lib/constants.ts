export const RUNWAY_MODELS = {
  realtimeAvatars: 'gwm1_avatars',
  imageGeneration: 'gemini_image3_pro',
  imageToVideo: 'gen4_turbo',
  textToSpeech: 'eleven_multilingual_v2',
  textToSoundEffect: 'eleven_text_to_sound_v2',
} as const;

export const CLAUDE_MODELS = {
  evaluator: 'claude-haiku-4-5-20251001',
  storyArchitect: 'claude-sonnet-4-6',
  panelWriter: 'claude-sonnet-4-6',
} as const;

export const TIMEOUTS_MS = {
  realtimeSessionReady: 90_000,
  realtimeSessionPollInterval: 1_000,
  panelImageGeneration: 60_000,
  climaxVideoGeneration: 180_000,
  ambientSoundGeneration: 60_000,
  storyGeneration: 60_000,
} as const;

export const RUNWAY_API_VERSION = '2024-11-06';

export const ADVENTURE = {
  panelImageRatio: '1920:1080',
  titleImageRatio: '1920:1080',
  climaxVideoRatio: '1280:720',
  climaxVideoDurationSeconds: 5,
  ambientSoundDurationSeconds: 8,
  panelDepth: 5,
  branchesPerChoice: 3,
} as const;

export const STORY_GUIDE = {
  voicePresetId: 'clara',
  fallbackName: 'Lyra',
  defaultGreeting:
    "Hi! I'm your story buddy. We're going to make an adventure together. Click a setting, a hero, and a problem when you're ready.",
} as const;

export const EVALUATOR = {
  maxResponseTokens: 800,
} as const;
