# ChooseLab

**An AI-powered Choose Your Own Adventure for kids.** The kid talks to Lyra, a Pixar-style storyteller, who asks three questions through voice. Their answers generate a personalized 5-panel illustrated, narrated, branching adventure with watercolor art, Lyra reading along on every page, and a bookshelf where every story is saved.

Built for the **Runway API Hackathon** (May 8-11, 2026).

🎬 **Live demo:** https://chooselab-tmoody1973s-projects.vercel.app/
📦 **Repo:** https://github.com/tmoody1973/chooselab

---

## The 60-second pitch

Books still exist as a category in 2026 because the **format** is irreplaceable, even if the medium changes. ChooseLab is "books for the AI era" — Choose Your Own Adventure reanimated with multimodal generation. Every part of the experience is generated live: the story, the watercolor illustrations, the ambient soundscape, the narrator's voice, and a Pixar character who actually talks to the kid to plan the adventure.

**The kid is the author. The AI is the illustrator, the soundtrack, and the storyteller.**

---

## Mapping to the hackathon criteria

### 1. Creativity — a real problem with a culturally legible answer

CYOA is a beloved 1970s-2000s format every parent and judge over 35 has nostalgia for. Reanimating it with AI is specific, named, ownable. Not "another AI app."

The product anchor: kids who don't engage with passive screens will engage with **agency**. Branching narratives improve theory of mind (Mar et al.), personalized stories increase retention (Fivush, McAdams), thought-bubble convention helps autistic kids develop perspective-taking (Frith & Happé). ChooseLab uses every one.

### 2. Technical depth — the format DEMANDS multimodal generation

Most submissions will use one or two Runway endpoints. ChooseLab uses **eight** because the experience requires them, not as bolt-ons:

| # | Endpoint | Role in the product |
|---|---|---|
| 1 | **`gwm1_avatars`** (Characters API, realtime) | Lyra the storyteller — kid talks to her, she fires `client_event` tools to record their picks |
| 2 | **`gemini_image3_pro`** (Nano Banana Pro) | All story illustrations — character-consistent across panels via the `appearanceLock` pattern |
| 3 | **`gen4_turbo`** (image-to-video) | Climax panel animation — the moment the still illustration suddenly moves |
| 4 | **`eleven_multilingual_v2`** (TTS) | Narration in Lyra's voice. Every panel reads aloud automatically. |
| 5 | **`eleven_text_to_sound_v2`** (sound effects) | Ambient sound bed per panel — forest at dusk, ocean tide, sky-village wind |
| 6 | **`gen4_image`** (initial Lyra portrait) | Pixar-style render that passes face detection for the avatar processor |
| 7 | **Documents API** | Storyteller's vocabulary glossary + guardrails (architecture in place; full population is V3) |
| 8 | **Realtime tool calling** (`client_event`) | `set_setting` / `set_hero` / `set_problem` fire as Lyra identifies kid's picks — no clicking |

Plus **Claude Sonnet 4.6** in a three-tier story architecture (Story Architect → Panel Writer → Asset Pipeline) that locks character appearance and arc coherence across branches.

### 3. Impact — could it become a real product?

Yes. Real demand: parents looking for screen time that builds rather than depletes. Real moat: the rubric-grade pedagogical framing (theory-of-mind via thought bubbles, sensory language, branching agency) plus the fact that ChooseLab actually **listens** — Lyra is conversational, not a form.

V2 ships as a credible prototype. V3 roadmap: Convex for multi-device sync + family bookshelves, Clerk for parent/kid dual-mode auth + content guardrails, parent-curated story themes, ESL voice-dubbing (`eleven_voice_dubbing`).

---

## Architecture in 60 seconds

```
                 ┌─────────────────────────────────────┐
   Kid lands → Lyra realtime session → 3 tool calls   │ gwm1_avatars
                 └─────────────────────────────────────┘
                                  ↓ {setting, hero, problem}
                 ┌─────────────────────────────────────┐
                 │ Story Architect (Claude Sonnet 4.6) │
                 │ Locks: title, hero appearance,      │
                 │ moral theme, 5-panel arc skeleton   │
                 └─────────────────────────────────────┘
                                  ↓
                 ┌─────────────────────────────────────┐
                 │ Per-panel pipeline (×5):            │
                 │  1. Panel Writer (Sonnet) → text    │
                 │     + thought bubble + 3 choices    │
                 │  2. PROGRESSIVE REVEAL — text shows │
                 │     immediately (~5s). Image, audio │
                 │     ambient generate in parallel:   │
                 │     - gemini_image3_pro (Nano Banana│
                 │       Pro) ← appearanceLock locked  │
                 │     - eleven_multilingual_v2 (TTS)  │
                 │     - eleven_text_to_sound_v2       │
                 │     - gen4_turbo (climax panel)     │
                 └─────────────────────────────────────┘
                                  ↓
                 ┌─────────────────────────────────────┐
                 │ On finish: cover (gemini_image3_pro)│
                 │ + save to localStorage bookshelf    │
                 └─────────────────────────────────────┘
```

### Three-tier story architecture (the IP)

The hardest problem in AI storytelling is **panels staying coherent across branches**. Naive panel-by-panel generation breaks fast. Solution:

1. **Story Architect** (one Sonnet call at adventure start): generates full arc skeleton with `appearanceLock` — a 2-sentence visual description with one signature item (e.g., "small purple-fuzzed spider with a tiny silver dewdrop pendant"). This string is **prepended verbatim** to every image prompt.
2. **Panel Writer** (one Sonnet call per panel as kid arrives): generates panel prose + thought bubble + asset prompts, grounded in the locked arc.
3. **Asset Pipeline** (parallel after Panel Writer): nano-banana, sound, narration, optional gen4_turbo on climax.

Result: Thistle looks like Thistle in every panel. Moral arc holds. Choice consequences land in the next panel's prose.

### Why Lyra is a Pixar character, not photorealistic

Watercolor + photorealistic are both legit, but kids' product wants stylized warmth. Pixar-style 3D render via `gen4_image` passes Runway's avatar face detection (a hard constraint) while feeling like a fictional character, not a real person.

### Why panel narration uses TTS, not realtime continuous

Runway realtime sessions cap at 5 minutes. A full adventure runs 5-15 minutes. Multi-session handoff is doable but risky for hackathon scope. Pre-generated TTS in a warm voice (Eleanor preset) is the kid's "Lyra reads to me" experience without the cap risk. Lyra's portrait pulses with the audio so the felt experience holds.

---

## How to run locally

```bash
git clone https://github.com/tmoody1973/chooselab
cd chooselab/app
cp .env.example .env.local
# Fill in:
#   ANTHROPIC_API_KEY=sk-ant-...      (https://console.anthropic.com/settings/keys)
#   RUNWAYML_API_SECRET=key_298d...   (https://dev.runwayml.com/)

npm install
npx next dev
# → http://localhost:3000
```

**You'll need:** Node 20+, an Anthropic API key, a Runway API key with credit. A typical adventure costs ~50-100 Runway credits + some Anthropic tokens.

---

## What's in this repo

```
chooselab/
├── app/                       Next.js 15 app
│   ├── app/
│   │   ├── api/
│   │   │   ├── adventure/
│   │   │   │   ├── start/    Sonnet architect
│   │   │   │   ├── panel/    Sonnet panel writer
│   │   │   │   ├── assets/   parallel asset orchestrator
│   │   │   │   └── cover/    gemini_image3_pro cover
│   │   │   └── storyteller/connect/  realtime Lyra session + tools
│   │   ├── globals.css       watercolor-friendly UI
│   │   └── page.tsx          state machine: home / adventure / bookshelf
│   ├── components/
│   │   ├── ConversationalPicker.tsx  Lyra realtime + tool listeners
│   │   ├── AdventureRunner.tsx       progressive reveal state machine
│   │   ├── PanelView.tsx             per-panel renderer + Lyra corner
│   │   └── Bookshelf.tsx             localStorage + sample stories
│   ├── lib/
│   │   ├── adventure-types.ts          schema
│   │   ├── adventure/prompts.ts        Sonnet prompt templates
│   │   ├── adventure/sonnet.ts         Anthropic SDK wrapper
│   │   ├── adventure/storyteller-tools.ts  realtime tool defs
│   │   ├── adventure/catalog.ts        3 settings × 3 heroes × 3 problems
│   │   ├── adventure/bookshelf.ts      localStorage persistence
│   │   ├── adventure/sample-bookshelf.ts  pre-baked Thistle sample
│   │   └── constants.ts                model IDs, timeouts, ratios
│   └── public/
│       ├── storyteller/lyra-pixar.png  Lyra portrait
│       └── samples/thistle-cover.png   sample bookshelf cover
├── data/
│   └── personalities/
│       └── storyteller_lyra.txt        Lyra's persona
├── docs/
│   └── CHOOSELAB-V2-ARCHITECTURE.md    full architecture brief
└── README.md (this file)
```

---

## V3 roadmap (post-hackathon)

- **Convex** for multi-device adventure sync, family bookshelf sharing
- **Clerk** for parent + kid dual-mode auth, parent-configurable content guardrails
- **`eleven_voice_dubbing`** for ESL kids — Spanish / Mandarin narration overlay
- **`act_two`** for Lyra reactions to kid's choices in panel transitions
- **Continuous realtime Lyra** through the story (multi-session handoff for the 5-min cap)
- **Free-text adventure seeds** alongside the 3-card picker
- **Parent dashboard** — set reading-level, themes to favor, themes to avoid
- **Library mode** — educator/librarian access with curriculum-aligned content packs

---

## Credits

Built solo by [@tarikjmoody](https://github.com/tmoody1973) over 72 hours for the Runway API Hackathon, May 8-11, 2026, with [Claude Code](https://docs.claude.com/en/docs/claude-code) (Opus 4.7) as the pair-programmer.

Story science grounded in: Mar (narrative comprehension + theory of mind), Fivush + McAdams (autobiographical narrative + retention), Frith + Happé (theory-of-mind development), Crompton et al. (autistic-affirming narrative pacing), Whitehurst (dialogic reading).

Visual style references (style-only, no model trained on them): the warm watercolor + ink storybook tradition of Beatrix Potter, Jon Klassen, Oliver Jeffers — though specific artist names are stripped from prompts because Runway's safety filter rejects style references to real artists.

Made with respect for kids who deserve software that listens.
