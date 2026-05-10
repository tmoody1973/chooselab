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
  panelImageRatio: '1344:768',
  titleImageRatio: '1344:768',
  climaxVideoRatio: '1280:720',
  climaxVideoDurationSeconds: 5,
  ambientSoundDurationSeconds: 8,
  panelDepth: 5,
  branchesPerChoice: 3,
} as const;

/**
 * Single source of truth for the visual aesthetic across every image
 * generated for ChooseLab — title illustrations, panel illustrations,
 * bookshelf covers. Always appended to the prompt for gemini_image3_pro
 * so the look stays coherent across calls.
 */
export const VISUAL_STYLE = {
  aesthetic:
    'Watercolor and ink storybook illustration with visible pencil sketch lines underneath the wash, soft loose color washes, gentle paper texture, warm earthy palette. Hand-painted picture-book feel, not digital, not photorealistic. Cozy, warm, gentle mood appropriate for a young audience.',
  technicalDirectives:
    'Soft edges, organic ink line work showing through the wash, slight bleed at color boundaries, off-white paper background, warm sunlight color grading. Composition is calm and uncluttered.',
  doNot: [
    'no photorealism',
    'no glossy or 3D-rendered look',
    'no harsh outlines or vector-art flatness',
    'no anime style',
    'no scary or intense expressions',
    'no exaggerated cartoon proportions',
    'no real public figures',
  ],
} as const;

export const STORY_GUIDE = {
  /** Voice preset for the narrator (TTS via eleven_multilingual_v2). Picks a warm, storytelling-friendly voice. */
  voicePresetId: 'Eleanor',
  /** Realtime avatar voice (gwm1_avatars uses different preset names than TTS). */
  realtimeVoicePresetId: 'clara',
  /** Lyra — the conversational storyteller who picks the adventure with the kid via realtime tool calls.
   *  Note: backed by the avatar with this ID (originally created for ScenarioLab v1; PATCHed with Lyra's
   *  storyteller persona for V2). The avatar's reference image is a friendly Black woman; the UI fallback
   *  shows a different watercolor portrait until the realtime stream connects. */
  lyraAvatarId: 'e6c8e3f2-ae0b-4aeb-98c8-ea217a2d3827',
  fallbackName: 'Lyra',
  defaultGreeting:
    "Hi! I'm Lyra. Want to make an adventure together?",
} as const;

export const EVALUATOR = {
  maxResponseTokens: 800,
} as const;
