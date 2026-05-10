import type { Setting, Hero, Problem } from '@/lib/adventure-types';

export const SETTINGS: Setting[] = [
  {
    id: 'enchanted-forest',
    label: 'Enchanted Forest',
    emoji: '🌳',
    description: 'An ancient forest where every tree might be hiding a secret and the moss is full of stories.',
    visualPaletteHint: 'deep greens, mossy browns, golden afternoon light, drifting amber pollen',
  },
  {
    id: 'underwater-kingdom',
    label: 'Underwater Kingdom',
    emoji: '🐚',
    description: 'A glittering city beneath the waves where coral grows like castles and seahorses deliver mail.',
    visualPaletteHint: 'aquamarine, soft coral pinks, dappled sunlight through water, shimmering scales',
  },
  {
    id: 'sky-village',
    label: 'Sky Village',
    emoji: '☁️',
    description: 'A small village built on top of soft clouds where the streets are made of starlight and the houses bounce.',
    visualPaletteHint: 'pale blues, peach sunset, fluffy white clouds, golden lantern light',
  },
];

export const HEROES: Hero[] = [
  {
    id: 'shy-spider',
    label: 'A shy spider',
    emoji: '🕷️',
    description: 'Small and gentle, wishes for a friend, brave when it matters.',
    appearanceHint: 'small purple-fuzzed spider with eight kind eyes, one signature item like a tiny scarf or pendant',
  },
  {
    id: 'curious-otter',
    label: 'A curious otter',
    emoji: '🦦',
    description: 'Loves discovering new things, asks lots of questions, never gives up.',
    appearanceHint: 'soft brown otter with bright eyes, one signature item like a tiny rope-belt full of pockets or a striped scarf',
  },
  {
    id: 'gentle-dragon',
    label: 'A gentle dragon',
    emoji: '🐉',
    description: 'Bigger than they look, happiest when reading, scared of being too loud.',
    appearanceHint: 'small bookish dragon with soft mossy-green scales, round spectacles or a small leather satchel as signature',
  },
];

export const PROBLEMS: Problem[] = [
  {
    id: 'lost-in-woods',
    label: 'Lost and trying to find the way home',
    emoji: '🗺️',
    description: 'Wandered too far and now everything looks unfamiliar. Needs help finding the way back.',
  },
  {
    id: 'making-first-friend',
    label: 'Wants to make a first friend',
    emoji: '🤝',
    description: 'Has felt lonely. Wants to make a friend but doesn\'t know how to start.',
  },
  {
    id: 'something-missing',
    label: 'Something important is missing',
    emoji: '🔍',
    description: 'A precious thing has gone missing. Needs to figure out where it went and how to get it back.',
  },
];

export function getSettingById(id: string): Setting | undefined {
  return SETTINGS.find((s) => s.id === id);
}

export function getHeroById(id: string): Hero | undefined {
  return HEROES.find((h) => h.id === id);
}

export function getProblemById(id: string): Problem | undefined {
  return PROBLEMS.find((p) => p.id === id);
}
