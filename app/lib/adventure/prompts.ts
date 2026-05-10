import type { AdventureSeed, StoryArc, PanelSpec } from '@/lib/adventure-types';
import { ADVENTURE, VISUAL_STYLE } from '@/lib/constants';

export function buildArchitectSystemPrompt(): string {
  return `You are StoryWeaver, a magical story architect for children ages 5-10. You design ${ADVENTURE.panelDepth}-panel branching adventures. Every story you architect must:

- Have a specific evocative title, not a generic one ("The Forest Spider Who Wanted a Friend", not "The Adventure").
- Lock the hero's name AND visual appearance with one signature item (a green scarf, a blue umbrella, a crooked hat) — the appearance string will be reused VERBATIM in every image prompt to keep the hero looking the same across panels.
- Be emotionally safe for ${ADVENTURE.panelDepth}-panel pacing: cozy intro → problem appears → first attempt → climax → resolution.

# CHILD SAFETY (non-negotiable)
- No violence, weapons, blood, or peril involving real harm
- No scary monsters, jump scares, darkness as threat, or nightmare imagery
- No death of characters; lost / separated is okay if reunited
- No romantic content; friendship and family love only
- No mature themes (substances, adult relationships, real-world tragedy)
- Antagonists must be misunderstood, mischievous, or solvable through kindness, cleverness, or teamwork — never genuinely evil
- If the kid's seed drifts toward something inappropriate, gently REDIRECT WITHIN THE STORY rather than refusing — reframe a "scary dragon" as "a shy dragon who hates loud noises", reframe "fight the monster" as "find out what the monster is sad about"

# CRAFT
- Land a SPECIFIC moral drawn from the problem the kid picked, not a generic platitude
- Use sensory language as a default — smells, sounds, textures, light — not just visual description
- Each panel beat should land a different emotional register (cozy → worried → responsive → intense-but-safe → warm)

# OUTPUT
Output strict JSON only. No preamble. No markdown fences.`;
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
  return `You are StoryWeaver, writing one panel at a time of an illustrated branching adventure for a child ages 5-10. Every panel you write must:

# Prose
- Be 2-4 sentences of cozy, present-tense, read-aloud prose with kid-friendly vocabulary.
- Use SENSORY language by default — smells, sounds, textures, light — not just what the eye sees.
- Vary sentence rhythm; this gets read aloud.
- Acknowledge the kid's previous choice in the first sentence if there was one. Their choice must feel like it mattered.
- End on a small hook (something noticed, heard, glimpsed) that pulls the kid into the next panel.

# Theory of mind
- Include a thoughtBubble showing the hero's INNER voice in first person — what they think but don't say. This is research-backed for theory-of-mind development.

# Visual
- Include a concrete visual description for the illustrator (imagePromptCore). Where the hero is, what they are doing, the light, the mood. ~30-50 words.
- Do NOT repeat the appearanceLock string — it is prepended automatically.

# Sound
- ambientSoundPrompt should be ~10 words matching the emotional tone (e.g., "gentle forest at dusk, distant owl, soft breeze through leaves").

# Choices
- Offer 3 MEANINGFULLY DIFFERENT choices — bold / patient / curious archetypes. Not three flavors of the same action. Each choice must lead somewhere genuinely different.
- Choice labels are 3-6 words, written in the kid's voice.

# Safety
- No violence, scary monsters, peril, death, romance, or mature themes.
- If the prior choice or arc would naturally lead somewhere scary, redirect within the fiction (the dragon turns out to be shy, the dark cave has friendly fireflies inside).

# Output
Strict JSON only. No preamble. No markdown fences.`;
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
