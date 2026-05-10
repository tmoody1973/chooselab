# ChooseLab V2 — AI-Powered Choose Your Own Adventure

Generated 2026-05-10 during pivot from ScenarioLab v1 (autistic-adult workplace practice) to ChooseLab v2 (kid CYOA). Final hackathon submission target: 2026-05-11 09:00 ET.

## Product

A kid picks a setting, hero, and problem. ChooseLab generates a 5-panel illustrated, narrated, branching adventure with sound design. A persistent storyteller guide (Runway Characters API) introduces the story, narrates each panel in their own voice, and reacts to the kid's choices. After the kid finishes, the adventure is saved to their bookshelf with a generated cover for later revisits.

## Runway endpoints used (6)

| # | Endpoint | Role | Calls per story |
|---|---|---|---|
| 1 | `gwm1_avatars` | Persistent storyteller guide. Intro + outro + Q&A about story. | 1-2 sessions |
| 2 | `gemini_image3_pro` (Nano Banana Pro) | Title illustration + 5 panel illustrations + bookshelf cover. Character-consistent across all calls. | 7 |
| 3 | `gen4_turbo` | Climax panel animation (panel 4 only). | 1 |
| 4 | `eleven_multilingual_v2` | Narration TTS in guide's voice + character lines. | 5-6 |
| 5 | `eleven_text_to_sound_v2` | Ambient sound bed per panel. | 5 |
| 6 | Documents API | Story state, vocabulary glossary, content guardrails attached to guide. | Per session |

Plus Claude Sonnet 4.6 for story-arc + per-panel writing.

## Story generation — three-tier architecture

### Tier 1: Story Architect (one Sonnet call at adventure start)
Locks the arc, the hero's appearance description, the moral theme, the panel beats. Returns a JSON skeleton.

### Tier 2: Panel Writer (one Sonnet call per panel)
Reads arc skeleton + choice history. Writes panel prose, thought bubble, image prompt (always including the hero's appearance lock string verbatim), ambient sound prompt, and 3 choices.

### Tier 3: Asset Generation (parallel)
Image, sound, narration generated in parallel after Panel Writer completes. Climax panel adds gen4_turbo animation.

## Documents API strategy

The storyteller guide gets three Documents attached:

1. **Story-state context** — generated per session, contains the full arc + current panel + choice history. Lets the guide answer "what just happened?" in context.
2. **Vocabulary glossary** — persistent, kid-friendly definitions of common adventure words.
3. **Content guardrails** — persistent, topics to redirect, reading level, safety rules.

## Engagement strategy

- **Visible choice consequence** — every panel opens by acknowledging the kid's previous choice in prose
- **Meaningful branching** — three choices lead to genuinely different next panels, not converging endings
- **Internal monologue** — each panel has a thought bubble showing the protagonist's inner voice (research-backed for theory-of-mind development)
- **Cliffhanger pacing** — each panel ends on a small hook resolved by the next
- **Climax animation** — panel 4 surprises with gen4_turbo motion

## Bookshelf

After each adventure, the full story (arc + panel data + generated cover) saves to localStorage. The kid can revisit any story from the bookshelf grid. Hard cap of 20 stories before pruning oldest. Pre-populated with 3-5 sample stories for demo.

## Research grounding

- **CYOA improves reading engagement** — multiple studies in '80s-'00s on agency-driven narrative for reluctant readers and neurodivergent kids
- **Branching narratives improve theory of mind** — Mar et al. on narrative comprehension
- **Personalized stories increase retention** — Fivush, McAdams autobiographical-memory work
- **"Thought bubble" / internal-monologue convention** helps autistic kids develop theory of mind — Frith & Happé
- **Multimodal stories aid ESL + neurodivergent kids** — joint-attention research, Whitehurst's dialogic reading
- **Co-reading with present adult dramatically improves comprehension** — research literature on joint attention

The guide-as-companion pattern simulates dialogic reading without requiring a present adult.

## What we kept from ScenarioLab v1

- Next.js 15 + React 19 scaffold
- @runwayml/sdk + @anthropic-ai/sdk integration
- `lib/constants.ts` Boy Scout pass (extended for V2)
- The research-grounded approach (different research, same rigor)
- Vercel deploy plumbing

## What changed

- 3 scenario JSONs → adventure schema (kid CYOA shape)
- 3 rubric JSONs → story-coherence quality metrics (no rubric for stories)
- 3 personality files → 1 storyteller guide personality
- 3 fallback MP4s → 1 fully pre-generated demo adventure
- Evaluator route → /api/adventure/* family
- Page UI → adventure flow
