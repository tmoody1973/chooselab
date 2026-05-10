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
      'CRITICAL TIMING RULE: do NOT call this tool when YOU yourself are listing the three options to the visitor. Only call it AFTER the visitor speaks and identifies their pick. Wait for the visitor to respond. When the VISITOR says forest/woods/trees → call with id enchanted-forest. When the VISITOR says ocean/sea/water/underwater → call with id underwater-kingdom. When the VISITOR says sky/clouds/stars/up high → call with id sky-village. After calling once, briefly affirm ("OK, [place]!") and move on to the hero question. Do NOT call this tool a second time on the same conversation turn. Do NOT call this tool when YOU restate the options. Only call once per visitor pick.',
    parameters: [
      {
        type: 'string' as const,
        name: 'id',
        description: 'enchanted-forest for forest/trees/woods/jungle. underwater-kingdom for ocean/sea/water/fish/coral. sky-village for sky/clouds/stars/up high/floating.',
        enum: settingIds,
      },
    ],
  },
  {
    type: 'client_event' as const,
    name: 'set_hero',
    description:
      'CRITICAL TIMING RULE: do NOT call this tool when YOU yourself are listing the three hero options. Only call it AFTER the visitor speaks and picks a hero. Wait for the visitor to respond. When the VISITOR says spider → call with id shy-spider. When the VISITOR says otter → call with id curious-otter. When the VISITOR says dragon → call with id gentle-dragon. After calling once, briefly affirm and move on to the problem question. Do NOT call this tool a second time on the same conversation turn. Do NOT call this tool when YOU restate the options. Only call once per visitor pick.',
    parameters: [
      {
        type: 'string' as const,
        name: 'id',
        description: 'shy-spider for spider/shy/small. curious-otter for otter/curious/explorer. gentle-dragon for dragon/gentle/reader/books.',
        enum: heroIds,
      },
    ],
  },
  {
    type: 'client_event' as const,
    name: 'set_problem',
    description:
      'CRITICAL TIMING RULE: do NOT call this tool when YOU yourself are listing the three problem options. Only call it AFTER the visitor speaks and picks a challenge. Wait for the visitor to respond. When the VISITOR says lost/home/finding the way → call with id lost-in-woods. When the VISITOR says friend/lonely/want a friend → call with id making-first-friend. When the VISITOR says missing/lost item/looking for → call with id something-missing. After calling once, say "Great choices, hold on while I start painting your adventure" and stop talking. Do NOT call this tool a second time on the same turn. Do NOT call when YOU restate the options.',
    parameters: [
      {
        type: 'string' as const,
        name: 'id',
        description: 'lost-in-woods for lost/home/finding the way. making-first-friend for friend/lonely/no friends. something-missing for missing/lost item/searching/gone.',
        enum: problemIds,
      },
    ],
  },
];
