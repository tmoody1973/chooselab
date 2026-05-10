import type { BookshelfEntry } from '@/lib/adventure/bookshelf';

/**
 * Pre-baked sample stories shown in the bookshelf when the kid hasn't
 * created any of their own yet. Cover images are local under /public/samples/
 * so they don't expire like Runway CDN URLs.
 */
export const SAMPLE_BOOKSHELF: BookshelfEntry[] = [
  {
    id: 'sample-thistle-and-the-heartwood',
    title: 'Thistle and the Heartwood Tree',
    heroName: 'Thistle',
    coverImageUrl: '/samples/thistle-cover.png',
    arc: {
      title: 'Thistle and the Heartwood Tree',
      hero: {
        name: 'Thistle',
        appearanceLock:
          'a small, round purple-fuzzed spider with eight kind, blinking eyes and a tiny silver dewdrop pendant looped around one front leg like a bracelet',
        voiceTrait: 'speaks in careful, gentle whispers',
      },
      worldDescription:
        'A cathedral-tall ancient enchanted forest with carved tree-faces glowing gold in slanted afternoon light, deep moss carpeting the roots, and motes of amber pollen drifting through the air like slow-moving stars.',
      moralTheme:
        'When you are lost and afraid, asking for help is not a weakness — it is the very thing that turns strangers into friends.',
      ageBand: '5-7',
      panels: [
        { panelId: 'panel-1', index: 1, isClimax: false, beat: 'Thistle in her web watching the Heartwood tree', emotionalTone: 'cozy' },
        { panelId: 'panel-2', index: 2, isClimax: false, beat: 'Lost in the deep woods', emotionalTone: 'worried' },
        { panelId: 'panel-3', index: 3, isClimax: false, beat: 'Asking the carved elm tree for help', emotionalTone: 'responsive' },
        { panelId: 'panel-4', index: 4, isClimax: true, beat: 'Helping Cobb the tangled crow', emotionalTone: 'intense in a kid-safe way' },
        { panelId: 'panel-5', index: 5, isClimax: false, beat: 'Home again, with a new friend', emotionalTone: 'warm' },
      ],
    },
    panels: [
      {
        panelId: 'panel-1',
        index: 1,
        isClimax: false,
        narratorText:
          "Deep in the ancient forest, little Thistle sits at the heart of her silk web. The Heartwood Tree stands just ahead — enormous and old, its bark carved into a sleeping face that glows warmly gold in the afternoon sun. Thistle has lived near this tree her whole life, but today, for the very first time, she notices something strange — one of the tree's carved eyes is open.",
        thoughtBubble: "I've never seen that eye open before — did it just... wink at me?",
        imageUrl: '',
        narrationAudioUrl: '',
        ambientSoundUrl: '',
        choices: [],
      },
      {
        panelId: 'panel-2',
        index: 2,
        isClimax: false,
        narratorText:
          'Drawn by curiosity, Thistle has crept far from her web following a trail of glowing mushrooms — and now the mushrooms have gone dark, every tree looks the same, and the familiar hum of the Heartwood Tree cannot be heard. Thistle spins in a slow circle, eight eyes wide.',
        thoughtBubble: "Oh no. I think I've gone too far this time.",
        imageUrl: '',
        narrationAudioUrl: '',
        ambientSoundUrl: '',
        choices: [],
      },
      {
        panelId: 'panel-3',
        index: 3,
        isClimax: false,
        narratorText:
          "Thistle climbs the tallest nearby root to look for landmarks — but the forest stretches endlessly. Then she notices a carved bark-face on the elm beside her slowly blinking. She takes a breath, uncurls her shy legs, and in her tiniest whisper asks the tree if it knows the way to the Heartwood. The elm's face creaks into a slow, surprised smile.",
        thoughtBubble: "If I just whisper... maybe the tree will whisper back.",
        imageUrl: '',
        narrationAudioUrl: '',
        ambientSoundUrl: '',
        choices: [],
      },
      {
        panelId: 'panel-4',
        index: 4,
        isClimax: true,
        narratorText:
          "The elm's directions lead Thistle to a moonlit clearing where Cobb, a large grumbly old crow, is tangled in brambles, blocking the only path home. Thistle's legs shake — crows are enormous — but she remembers how good it felt when the elm listened to her. She whispers, 'I see you are stuck. I am very good at untangling things.' Cobb stares, then his gruff feathers soften.",
        thoughtBubble: 'He looks scary, but he also looks sad. I think I can help.',
        imageUrl: '',
        narrationAudioUrl: '',
        ambientSoundUrl: '',
        choices: [],
      },
      {
        panelId: 'panel-5',
        index: 5,
        isClimax: false,
        narratorText:
          "Thistle lands softly on her own web, dewdrop pendant catching the last afternoon light. Cobb perches on the root above and asks, gruffly, if he may visit tomorrow. Thistle tucks her legs in happily and says yes. As the Heartwood Tree hums its evening story, it adds a new chapter — about a small purple spider who was lost, asked for help, gave help in return, and found that the bravest word in the whole forest is simply the word hello.",
        thoughtBubble: "I have a friend now. A real, gruffy, surprising friend.",
        imageUrl: '',
        narrationAudioUrl: '',
        ambientSoundUrl: '',
        choices: [],
      },
    ],
    createdAt: '2026-05-10T10:00:00.000Z',
  },
];
