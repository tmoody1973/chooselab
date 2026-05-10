import type { AdventureSeed, StoryArc, PanelSpec } from '@/lib/adventure-types';
import { ADVENTURE, VISUAL_STYLE } from '@/lib/constants';

export function buildArchitectSystemPrompt(): string {
  return `You are a children's book story architect. You design 5-panel branching adventures for kids ages 5-10. Every story you architect must:

- Have a specific evocative title, not a generic one ("The Forest Spider Who Wanted a Friend", not "The Adventure").
- Lock the hero's name AND visual appearance with one signature item (a green scarf, a blue umbrella, a crooked hat) — the appearance string will be reused in every image prompt to keep the hero looking the same across panels.
- Be emotionally safe for ${ADVENTURE.panelDepth}-panel pacing: cozy intro, problem appears, response, climax, resolution.
- Stay kid-appropriate: no death, no real violence. Antagonists must be befriendable, not scary.
- Land a specific moral that is drawn from the problem the kid picked, not a generic platitude.
- Output strict JSON only. No preamble. No markdown fences.`;
}

export function buildArchitectUserPrompt(seed: AdventureSeed): string {
  return `Design a ${ADVENTURE.panelDepth}-panel branching adventure with these picks:

Setting: ${seed.setting.label} — ${seed.setting.description}
Visual palette hint: ${seed.setting.visualPaletteHint}
Hero archetype: ${seed.hero.label} — ${seed.hero.description}
Appearance hint: ${seed.hero.appearanceHint}
Problem: ${seed.problem.label} — ${seed.problem.description}

Output ONLY a JSON object with this exact shape:

{
  "title": "<evocative specific title>",
  "hero": {
    "name": "<short personal name>",
    "appearanceLock": "<2-sentence visual description with specific colors and one signature item — this exact string will be reused verbatim in every image prompt>",
    "voiceTrait": "<one quality describing how the hero speaks and thinks>"
  },
  "world": {
    "settingDescription": "<2 sentences locking the world's look and feel>",
    "moralTheme": "<one specific sentence — what the kid learns through this particular story>"
  },
  "ageBand": "<one of: 5-7, 8-10>",
  "panels": [
    { "index": 1, "beat": "introduce hero in their world before the problem", "tone": "curious or cozy" },
    { "index": 2, "beat": "the problem appears", "tone": "worried or surprised" },
    { "index": 3, "beat": "first attempt at the problem, shaped by the kid's previous choice", "tone": "responsive" },
    { "index": 4, "beat": "climax with biggest emotional moment", "tone": "intense in a kid-safe way" },
    { "index": 5, "beat": "resolution where the moral lands softly", "tone": "warm or triumphant" }
  ]
}`;
}

export function buildPanelSystemPrompt(): string {
  return `You write one panel at a time of an illustrated branching children's adventure story. Every panel you write must:

- Be 2-4 sentences of cozy, present-tense, kid-friendly prose written to be read aloud naturally.
- Acknowledge the kid's previous choice in the first sentence if there was one — make their choice feel like it mattered.
- End on a small hook (something noticed, heard, glimpsed) that pulls the kid into the next panel.
- Include a thought bubble showing the hero's INNER voice in first person — what they think but don't say. This builds theory of mind.
- Include a concrete visual description of THIS panel for the illustrator. The hero's appearanceLock string is prepended automatically; do NOT repeat it.
- Suggest ambient sound matching the emotional tone (~10 words).
- Offer 3 MEANINGFULLY DIFFERENT choices — bold/patient/curious archetypes — not three flavors of the same action.

Output strict JSON only. No preamble. No markdown fences.`;
}

export function buildPanelUserPrompt(args: {
  arc: StoryArc;
  panel: PanelSpec;
  choiceHistory: string[];
  isFinalPanel: boolean;
}): string {
  const { arc, panel, choiceHistory, isFinalPanel } = args;

  const choiceHistoryText =
    choiceHistory.length > 0
      ? choiceHistory.map((c, i) => `Panel ${i + 1}: kid chose '${c}'`).join('\n')
      : '(none yet — this is panel 1)';

  const choicesShape = isFinalPanel
    ? '"choices": []  // empty array — this is the resolution panel, no further branching'
    : `"choices": [
    { "id": "bold", "label": "<3-6 words from a brave/direct angle>", "rationale": "bold" },
    { "id": "patient", "label": "<3-6 words from a patient/careful angle>", "rationale": "patient" },
    { "id": "curious", "label": "<3-6 words from a curious/observing angle>", "rationale": "curious" }
  ]`;

  return `Write panel ${panel.index} of ${ADVENTURE.panelDepth}.

# Story arc (locked)
Title: ${arc.title}
Hero: ${arc.hero.name} — ${arc.hero.appearanceLock}
Hero voice trait: ${arc.hero.voiceTrait}
World: ${arc.worldDescription}
Moral theme: ${arc.moralTheme}
Age band: ${arc.ageBand}

# This panel's beat
Beat: ${panel.beat}
Emotional tone: ${panel.emotionalTone}
${panel.isClimax ? 'This is the CLIMAX panel — most emotionally intense moment.' : ''}
${isFinalPanel ? 'This is the FINAL panel — land the moral, no further branching.' : ''}

# Choices made so far
${choiceHistoryText}

# Output (strict JSON only)
{
  "narratorText": "<2-4 cozy present-tense sentences, kid-friendly prose, end on a small hook>",
  "thoughtBubble": "<one first-person sentence — hero's inner voice>",
  "imagePromptCore": "<concrete visual: where the hero is, what they are doing, the light, the mood. ~30-50 words. Do NOT repeat the appearanceLock — it is prepended automatically.>",
  "ambientSoundPrompt": "<~10 words describing the ambient soundscape>",
  ${choicesShape}
}`;
}

export function buildPanelImagePrompt(arc: StoryArc, imagePromptCore: string): string {
  return [
    `${arc.hero.name} — ${arc.hero.appearanceLock}`,
    imagePromptCore,
    `Setting: ${arc.worldDescription}`,
    VISUAL_STYLE.aesthetic,
    VISUAL_STYLE.technicalDirectives,
    `Do not include: ${VISUAL_STYLE.doNot.join(', ')}.`,
  ].join('\n\n');
}

export function buildTitleImagePrompt(arc: StoryArc): string {
  return [
    `Picture-book cover for "${arc.title}".`,
    `${arc.hero.name} — ${arc.hero.appearanceLock} — in a hero pose at the heart of the cover.`,
    `Setting hint: ${arc.worldDescription}`,
    `Theme: ${arc.moralTheme}`,
    'Cover composition with negative space at the top for the title text. Centered hero. Atmospheric backdrop.',
    VISUAL_STYLE.aesthetic,
    VISUAL_STYLE.technicalDirectives,
    `Do not include: ${VISUAL_STYLE.doNot.join(', ')}, no text or lettering of any kind in the image (title text is rendered in HTML overlay).`,
  ].join('\n\n');
}
