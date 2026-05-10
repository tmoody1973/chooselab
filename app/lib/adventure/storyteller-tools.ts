import { SETTINGS, HEROES, PROBLEMS } from '@/lib/adventure/catalog';

const settingIds = SETTINGS.map((s) => s.id) as ['enchanted-forest', 'underwater-kingdom', 'sky-village'];
const heroIds = HEROES.map((h) => h.id) as ['shy-spider', 'curious-otter', 'gentle-dragon'];
const problemIds = PROBLEMS.map((p) => p.id) as ['lost-in-woods', 'making-first-friend', 'something-missing'];

export type SettingId = typeof settingIds[number];
export type HeroId = typeof heroIds[number];
export type ProblemId = typeof problemIds[number];

/**
 * Tool definitions in the raw API shape required by /v1/realtime_sessions.
 * Server-side use only. The client-side `clientTool()` helpers live alongside
 * the ConversationalPicker component since they import from
 * `@runwayml/avatars-react` which requires the "use client" directive.
 */
export const STORYTELLER_TOOL_DEFINITIONS = [
  {
    type: 'client_event' as const,
    name: 'set_setting',
    description:
      'CRITICAL TOOL — call this on the FIRST hint of the visitor naming a place. Do NOT ask "is that your final answer?" Do NOT repeat their answer back. Do NOT say "let me confirm." The MOMENT you hear them say anything resembling forest/woods/trees → call set_setting with id "enchanted-forest". The MOMENT you hear ocean/sea/water/underwater/fish → call with id "underwater-kingdom". The MOMENT you hear sky/clouds/stars/village/up high → call with id "sky-village". After calling, briefly say "OK, [place]!" and move STRAIGHT to the next question. Calling this tool IS your acknowledgement — they do not need a second confirmation. If they say something off-list (candy land, space, dinosaur planet), respond warmly with "Ooh! Of our three places — forest, underwater, or sky — which feels closest?" and call the tool on their NEXT answer.',
    parameters: [
      {
        type: 'string' as const,
        name: 'id',
        description: 'enchanted-forest for forest/trees/woods/magical/jungle. underwater-kingdom for ocean/sea/water/fish/coral/underwater. sky-village for sky/clouds/stars/village/up high/floating.',
        enum: settingIds,
      },
    ],
  },
  {
    type: 'client_event' as const,
    name: 'set_hero',
    description:
      'CRITICAL TOOL — call this on the FIRST hint of the visitor picking a hero. Do NOT ask "are you sure?" Do NOT repeat back. The MOMENT you hear them say anything resembling spider → call with id "shy-spider". The MOMENT you hear otter → call with id "curious-otter". The MOMENT you hear dragon → call with id "gentle-dragon". After calling, briefly say "OK, [hero]!" and move STRAIGHT to the next question. Calling the tool IS your acknowledgement. If they say something off-list (unicorn, rabbit, dinosaur), respond warmly with "Ooh! Out of our three — the shy spider, the curious otter, or the gentle dragon — who feels closest?" and call the tool on their NEXT answer.',
    parameters: [
      {
        type: 'string' as const,
        name: 'id',
        description: 'shy-spider for spider/shy/small/eight-legs. curious-otter for otter/curious/explorer/discovering. gentle-dragon for dragon/gentle/reader/books/scaly.',
        enum: heroIds,
      },
    ],
  },
  {
    type: 'client_event' as const,
    name: 'set_problem',
    description:
      'CRITICAL TOOL — call this on the FIRST hint of the visitor picking a challenge. Do NOT ask "is that the one?" Do NOT repeat back. The MOMENT you hear them say anything resembling lost/home/finding the way back → call with id "lost-in-woods". The MOMENT you hear friend/lonely/want a friend → call with id "making-first-friend". The MOMENT you hear missing/lost item/looking for something → call with id "something-missing". After calling, say "Great choices, hold on while I start painting the first scene of your adventure" and stop talking. Calling the tool IS your acknowledgement.',
    parameters: [
      {
        type: 'string' as const,
        name: 'id',
        description: 'lost-in-woods for lost/home/finding the way/getting back. making-first-friend for friend/lonely/wants a friend/no friends. something-missing for missing/lost item/searching/looking for/gone.',
        enum: problemIds,
      },
    ],
  },
];
