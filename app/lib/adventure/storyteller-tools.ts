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
      'Fire IMMEDIATELY when the visitor tells you where they want the adventure to happen. Ask them to choose between three places: an enchanted forest (id: enchanted-forest), an underwater kingdom (id: underwater-kingdom), or a sky village made of clouds (id: sky-village). When they answer, fire this tool with the matching id. If they say something off-list ("a candy land!"), reflect warmly and ask them which of the three places feels closest to their idea, then fire with the matching id. Do not wait for confirmation — fire as soon as you identify their pick.',
    parameters: [
      {
        type: 'string' as const,
        name: 'id',
        description: 'The setting id the visitor picked. enchanted-forest if they said forest/trees/woods. underwater-kingdom if they said ocean/sea/water/fish. sky-village if they said sky/clouds/stars/up high.',
        enum: settingIds,
      },
    ],
  },
  {
    type: 'client_event' as const,
    name: 'set_hero',
    description:
      'Fire IMMEDIATELY when the visitor tells you who the hero of the adventure should be. Ask them to choose between three heroes: a shy spider who wishes for a friend (id: shy-spider), a curious otter who loves discovering things (id: curious-otter), or a gentle dragon who is happiest when reading (id: gentle-dragon). When they answer, fire this tool with the matching id. If they suggest something off-list, reflect warmly and ask which of the three feels closest. Do not wait for confirmation — fire as soon as you identify their pick.',
    parameters: [
      {
        type: 'string' as const,
        name: 'id',
        description: 'The hero id. shy-spider if they said spider/shy/small. curious-otter if they said otter/curious/discoverer. gentle-dragon if they said dragon/gentle/reader/books.',
        enum: heroIds,
      },
    ],
  },
  {
    type: 'client_event' as const,
    name: 'set_problem',
    description:
      'Fire IMMEDIATELY when the visitor tells you what challenge the hero will face. Ask them to choose between three challenges: lost and trying to find the way home (id: lost-in-woods), wanting to make a first friend (id: making-first-friend), or looking for something important that has gone missing (id: something-missing). When they answer, fire this tool with the matching id. If they suggest something off-list, reflect warmly and ask which of the three feels closest. Do not wait for confirmation — fire as soon as you identify their pick.',
    parameters: [
      {
        type: 'string' as const,
        name: 'id',
        description: 'The problem id. lost-in-woods if they said lost/home/way back. making-first-friend if they said friend/lonely. something-missing if they said missing/lost item/looking for.',
        enum: problemIds,
      },
    ],
  },
];
