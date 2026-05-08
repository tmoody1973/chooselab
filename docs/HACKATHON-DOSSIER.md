# ScenarioLab — Hackathon Dossier

**Compiled:** 2026-05-08 (Friday) · **Submission deadline:** 2026-05-11 09:00 ET (Monday)

This dossier consolidates findings from four parallel research passes (three rubric agents + one Runway API verification agent) and the `runway-api:use-runway-api` skill. It is the active reference for the 72-hour build. The eight existing planning documents under `/docs` remain valid as long-term product material; this file supersedes them anywhere they conflict for the hackathon scope.

---

## 1. Top 5 plan-changing findings

These actively contradict assumptions in the existing planning docs. Update before coding.

### 1.1 Documents API is Markdown / plain-text only — no JSON

The `Technical Architecture` doc plans to feed scenario JSON to Characters via the Documents API. Verified false. Knowledge documents accept text/Markdown only, max 50K tokens, attached **per-avatar (not per-session)**. Linking new documents replaces all existing docs on that avatar. Source: [/characters/documents/](https://docs.dev.runwayml.com/characters/documents/).

**Fix.** Keep scenarios as JSON in `data/scenarios/`. At `realtimeSessions.create()` time, render the relevant fields into Markdown / plain-text and pass via the `personality` and `startScript` parameters. Documents are reserved for stable persona-level knowledge (e.g., the character's own backstory, never per-run state).

### 1.2 Realtime session credentials are single-use

WebRTC handshake fails → must create a fresh session. There is no reconnect path. Plan retry UX accordingly: on transport error, surface "Reconnect" → silently call `realtimeSessions.create` again.

### 1.3 Sessions cap at 5 minutes

Hard cap. Plenty for our 60–90s scenarios, but bake the cap into the state machine so a runaway session ends gracefully. Add a 4-minute soft warning that prompts the user to wrap up.

### 1.4 Replay Lens model: `gen4_turbo`, not `gen4.5`

| Model | Cost | 5s clip | When to use |
| --- | --- | --- | --- |
| `gen4_turbo` | 5 credits/sec | $0.25 | **Replay Lens (this project)** |
| `gen4.5` | 12 credits/sec | $0.60 | Reserve for the hero clip in the submission video |
| `veo3` | 40 credits/sec | $2.00 | Don't bother |
| `veo3.1_fast` | 10 credits/sec | $0.50 | Middle ground; no audio |

For a single hackathon demo replay clip, `gen4_turbo` saves 2.4× cost over `gen4.5` with negligible quality penalty for our use case. Save the budget for re-runs during testing.

### 1.5 Use the official Next.js scaffold

The starter template that gets you to working WebRTC in ~1 hour:

```bash
npx degit runwayml/avatars-sdk-react/examples/nextjs-simple scenariolab
cd scenariolab && npm install
```

Required additions:

- `@runwayml/avatars-react` (already in template) — client primitives
- `@runwayml/avatars-node-rpc` — server tools (only if Characters tool calling is wired)
- API version header `X-Runway-Version: 2024-11-06` on consume calls — already in template, do not omit

Don't roll your own scaffold. This template handles the 5-step session lifecycle, WebRTC token exchange, and the `consume` single-use credential flow.

---

## 2. Auth & access checklist

### 2.1 Sign-up

1. Sign up at `dev.runwayml.com` (separate from consumer Runway).
2. Create org → API Keys tab → generate `key_…` (shown ONCE — save it).
3. Set in shell:
   ```bash
   export RUNWAY_SKILLS_API_SECRET='key_...'
   ```
   And in project `.env.local` as `RUNWAYML_API_SECRET=key_...`
4. **Prepay $50 today** to start the Tier 2 timer (1-day wait → 3 concurrent sessions). Tier 1 default is 1–2 concurrent, which will choke if multiple judges hit your demo URL simultaneously.

### 2.2 Tier ceilings

| Tier | Concurrency | Gens/day | $/mo cap | Qualify |
| --- | --- | --- | --- | --- |
| 1 | 1–2 | 50–200 | $100 | default |
| 2 | 3 | 500–1k | $500 | $50 spent + 1d wait |
| 3 | 5 | 1k–2k | $2k | $100 + 7d |

Source: [/usage/tiers/](https://docs.dev.runwayml.com/usage/tiers/).

### 2.3 Verdict

**GREEN LIGHT.** No waitlist. Characters API (`gwm1_avatars`) is GA-available at Tier 1. Cost: ~$0.20/min Character + $0.25 per 5s `gen4_turbo` video ≈ **$1 per full demo run**.

---

## 3. Scope (frozen for hackathon)

### IN — three scenarios

| ID | Domain | Skill | Rubric |
| --- | --- | --- | --- |
| `workplace_empathy_001` | Workplace | Empathic acknowledgment | `empathy_v1` |
| `school_self_advocacy_001` | School | Self-advocacy ask | `self_advocacy_v1` |
| `interview_prep_001` | Interview | Behavioral response structure | `interview_v1` |

Per scenario:
- One Runway Character session (role-play partner)
- One LLM evaluator pass (~1s, returns one strength + one next-step)
- One Replay Lens video (5s, `gen4_turbo`)
- Pre-rendered fallback character clip + fallback Replay Lens clip in `public/fallbacks/{scenario_id}/`
- One retry button (fresh session, no comparison logic)

Three screens total: landing/selector → session → result.

### OUT — defer to v2

- Multi-scenario library beyond three
- User profile / preferences / accessibility settings UI
- MediaPipe / gesture / camera / Tier 2-3 input
- Progress tracking, retry comparison, longitudinal data
- Caregiver/coach/clinician roles, role-based permissions, audit logs
- Captions, dubbing, localization
- Postgres + full data model
- WebSocket/SSE realtime updates (use polling)
- Tests beyond manual smoke tests

---

## 4. Three rubrics — research summary

All three rubrics are content-based, neurodivergent-affirming, and JSON-ready. Files: `data/rubrics/{empathy,self_advocacy,interview}.json`. Worked examples and `do_not_score` arrays included.

### 4.1 Workplace empathy — `empathy_v1`

| | |
| --- | --- |
| Frameworks | Stanford Noora RCT (Koegel et al. 2025, *J Autism Dev Disord*, [doi:10.1007/s10803-025-06734-x](https://link.springer.com/article/10.1007/s10803-025-06734-x)) + MITI 4.2.1 reflective-listening (Moyers et al. 2014) |
| Dimensions | 5 dims, 0-10 total |
| Key affirming clause | Scores verbal content only — flat affect / matter-of-fact / brief responses can score 10/10 |

### 4.2 School self-advocacy — `self_advocacy_v1`

| | |
| --- | --- |
| Frameworks | I PLAN strategy (Van Reusen et al. 2002, KU-CRL) + ASAN's *Navigating College* (2013) |
| Dimensions | 5 dims, 0-10 total |
| Key affirming clause | "No apology required" — apologetic framing is neutral, never rewarded; brevity is positive |

### 4.3 Interview prep — `interview_v1`

| | |
| --- | --- |
| Frameworks | STAR / structured interviewing (Campion 1988; Levashina 2014) + Maras 2021 *Autism* for adaptations |
| Dimensions | 4 dims, 0-8 total |
| Key affirming clause | Clarifying questions rewarded (D1); literal/structured answers (e.g., labeling "Situation:" / "Task:") score 8/8 |

---

## 5. Architecture (compressed for hackathon)

```
  ┌─────────────┐     ┌──────────────────────────────┐     ┌──────────────────┐
  │   Web UI    │◀───▶│   Next.js API routes          │◀───▶│   Runway API     │
  │  (Next.js)  │     │  - Scenario JSON loader       │     │  - Characters    │
  │             │     │  - Runway adapter             │     │    (gwm1_avatars)│
  │  WebRTC ────┼─────┼──▶ realtimeSessions/consume   │     │  - gen4_turbo    │
  │  (clientside│     │  - LLM evaluator              │     │    video         │
  │  Avatar SDK)│     │  - Replay Lens job poller     │     │                  │
  └─────────────┘     └──────────────────────────────┘     └──────────────────┘
                              │
                              └─────────────────▶ ┌──────────────────┐
                                                  │  LLM evaluator   │
                                                  │  (Anthropic or   │
                                                  │   OpenAI)        │
                                                  └──────────────────┘
```

**Three services collapsed from the original 9.** No DB, no WebSocket, no MediaPipe, no audit logs.

### Session state machine

```
  IDLE ─▶ CHARACTER_READY ─▶ ROLEPLAY ─▶ SUBMITTING ─▶ EVALUATING ─▶ GENERATING_REPLAY ─▶ DONE
   │            │                │             │              │                 │              │
   │            ▼                ▼             ▼              ▼                 ▼              ▼
   │   [session create     [WebRTC      [debounce      [eval call         [replay job    [retry → IDLE]
   │    fails: show        fails:       submit]        fails: use         timeout >60s:
   │    "demo unavailable"] new         [empty input:  default            use prerendered
   │                        session]    reject]        feedback]          video]
```

---

## 6. Failure modes registry

| Codepath | Failure mode | Rescue | User sees |
| --- | --- | --- | --- |
| API key invalid at app boot | 401 from any Runway call | Hard-fail at `/api/health` → show "Demo unavailable" page | Caught before judging |
| `realtimeSessions.create` returns FAILED | Account state, model unavailable | Retry once, then prerendered character clip | Continues with fallback |
| `realtimeSessions` polls past 60s in NOT_READY | Capacity / regional issue | Cancel, prerendered fallback | Continues with fallback |
| WebRTC handshake fails | Network, browser, single-use creds expired | New session via "Reconnect" button | Reconnect succeeds OR fallback |
| Character mid-session disconnect | Network blip | Show "Reconnect" CTA → new session | Bounded |
| LLM evaluator timeout / malformed JSON | Rate limit, model glitch | Retry once with simpler prompt; on 2nd fail return hand-written default feedback | User sees feedback, never a 500 |
| `imageToVideo.create` content policy refusal | Moderation flagged prompt | Pre-rendered Replay Lens fallback for this scenario | User always sees a video |
| Replay polling >60s | Capacity, slow day | Hard cap, fall back to prerendered | Demo never hangs |
| User input: empty / profanity / prompt injection | Validation | Trim + length check; crisis-keyword regex; refuse with "Try again" | Bounded |
| Crisis disclosure ("I want to hurt myself") | Single regex-style keyword check on user input | Halt session, show 988 / crisis text line resources | Safe handoff |

**Non-negotiables:**

1. Pre-render 3 fallback character clips (one per scenario) and 3 fallback Replay Lens clips, commit to `public/fallbacks/{scenario_id}/`. Generate Saturday afternoon.
2. Pre-record a 90-second submission demo video Sunday afternoon. Live demos fail; recorded demos don't. Submit it with the entry.
3. Set `X-Runway-Version: 2024-11-06` on all consume calls.

---

## 7. 72-hour build plan

| Day | Hours | Build target | Done when |
| --- | --- | --- | --- |
| **Friday afternoon** | 2 | Verify Runway access. `dev.runwayml.com` signup. API key. Prepay $50. `auth status` returns `authenticated: true`. | `runway-api auth status` → `true` |
| **Friday afternoon** | 2 | Scaffold from `nextjs-simple` template. Get the example running with a generic avatar. | Generic avatar speaks in browser. |
| **Friday eve** | 3 | Wire 3 Avatars (one per scenario). Each Avatar has its persona + opening line. Plug in scenario JSON → personality + startScript renderer. | Switching scenario card switches Avatar persona. |
| **Saturday AM** | 4 | LLM evaluator API route. Submit button → feedback in <2s. Plug in 3 rubric JSONs. | One strength + one next-step appears after each submitted response. |
| **Saturday PM** | 4 | Replay Lens. Storyboard → `gen4_turbo` image-to-video. Polling + 60s cap + fallback. | User completes a session and sees a Replay Lens video. |
| **Saturday eve** | 3 | Pre-render 3 fallback character clips + 3 fallback Replay Lens clips. Commit to repo. Wire all error paths to use them. | Disconnect wifi → demo still completes. |
| **Sunday AM** | 4 | UI polish. Three screens, one accent color, generous whitespace. Loading states designed. Crisis-keyword regex. | Demo feels like a product, not a hack. |
| **Sunday PM** | 4 | Deploy to Vercel. Run 10 end-to-end smoke tests. Fix anything that breaks more than once. Record 90s demo video. | URL works from cold open in <5s. Recorded video saved. |
| **Sunday eve** | 2 | Submit. Write submission narrative ("Rubrics anchored in [Noora / I PLAN / STAR]…"). Submit early. | Submission confirmed before midnight ET. |
| **Monday AM** | — | Update submission if anything changed. Submit by 9am ET. | Confirmed. |

**Total: ~28 hours of build, leaving ~44 hours for sleep, food, and inevitable chaos.**

---

## 8. File index

| File | Purpose |
| --- | --- |
| `data/scenarios/workplace_empathy.json` | Scenario template — character, opening line, hidden state, success criteria, safety notes, replay prompt template |
| `data/scenarios/school_self_advocacy.json` | Scenario template |
| `data/scenarios/interview_prep.json` | Scenario template |
| `data/rubrics/empathy.json` | Rubric — 5 dims, frameworks, worked examples, do_not_score |
| `data/rubrics/self_advocacy.json` | Rubric — 5 dims, frameworks, worked examples, do_not_score |
| `data/rubrics/interview.json` | Rubric — 4 dims, frameworks, worked examples, do_not_score |
| `docs/HACKATHON-DOSSIER.md` | This file — active hackathon reference |
| `docs/ScenarioLab Claude Handoff Brief` | Strategic summary (long-term reference) |
| `docs/ScenarioLab PRD, Personas, and Research Context` | PRD (long-term reference) |
| `docs/ScenarioLab Technical Architecture and Runway Integration Plan` | Tech architecture (long-term reference; SUPERSEDED by §1.1 and §5 here for hackathon) |
| `docs/Can Runway Realistically Pull Off ScenarioLab_…` | Feasibility addendum (long-term reference) |
| `docs/MediaPipe Research Notes for ScenarioLab` | Out of scope for hackathon (defer to v2) |
| `docs/ScenarioLab MediaPipe and Alternatives Architecture Addendum` | Out of scope for hackathon |
| `docs/Runway API Hackathon Brainstorming Notes` | Background research (long-term reference) |
| `docs/ai-autism-agent-product-spec.md` | Separate doc — clarify before it pulls scope back in |

---

## 9. Submission narrative — README seeds

For the hackathon submission write-up:

> **ScenarioLab is a private rehearsal studio for conversations that matter.** Three scenarios — workplace empathy, school self-advocacy, and interview prep — let users practice with an embodied Runway Character partner, receive evidence-grounded feedback, and watch a Replay Lens video that visualizes one supportive alternative response.
>
> **Why this is hackathon-grade:**
> - **Creativity** — the Replay Lens turns a social moment into a generated cinematic artifact, not just a chatbot transcript.
> - **Technical depth** — chains a real-time Runway Character session, structured LLM evaluation against a peer-reviewed rubric, and `gen4_turbo` image-to-video generation in a coherent agent loop.
> - **Impact** — every rubric is anchored in published, neurodivergent-affirming research:
>   - Workplace empathy: Stanford HAI Noora RCT (Koegel et al., 2025) + MITI 4.2.1
>   - School self-advocacy: I PLAN (Van Reusen et al., 2002) + ASAN's *Navigating College*
>   - Interview prep: Structured interviewing (Campion 1988; Levashina 2014) + Maras et al. 2021 adaptations
>
> **Non-clinical positioning:** ScenarioLab is a communication practice tool, not a treatment, diagnostic system, or AI therapist. Rubrics evaluate verbal content only; flat affect, brevity, and direct asks score at the top of every dimension.

---

## 10. Open dependencies

1. **Runway API key** — set `RUNWAY_SKILLS_API_SECRET` in shell + `RUNWAYML_API_SECRET` in `.env.local`. Then re-run `auth status`.
2. **`docs/ai-autism-agent-product-spec.md`** — separate document not yet evaluated. Confirm whether it's part of ScenarioLab scope or a different project before it creates pull on the 72-hour build.
3. **Solo vs team** — affects whether the 28-hour build budget is realistic for one person plus CC, or distributed across collaborators.
