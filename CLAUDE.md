# Runway API Implementation Rules

Always consult the canonical Runway documentation and the `runway-api:*` skill suite BEFORE writing Runway code. Do not guess endpoint shapes, model names, parameter names, ratios, or behaviors. Verify first, implement second.

## The verification stack — in order

1. **Skill suite first** — load the matching `runway-api:rw-*` skill before integrating any new Runway feature:
   - `rw-api-reference` — endpoint contracts, model lists, costs, rate limits
   - `rw-integrate-characters` — Characters API (gwm1_avatars realtime)
   - `rw-integrate-character-embed` — React SDK embed patterns
   - `rw-integrate-image` — image generation
   - `rw-integrate-video` — video generation
   - `rw-integrate-audio` — TTS, sound effects, voice
   - `rw-integrate-documents` — knowledge base attachment
   - `rw-integrate-uploads` — file uploads
   - `use-runway-api` — direct API exploration via `request` command
   - `rw-fetch-api-reference` — pull the latest docs when skills are stale

2. **SDK types second** — when uncertain about method names or shapes, grep the SDK types directly:
   ```bash
   cat app/node_modules/@runwayml/sdk/resources/<resource>.d.ts
   ```
   The TypeScript declarations are authoritative for SDK shape.

3. **Live API third** — when behavior is unclear, test via `use-runway-api request` BEFORE writing app code. Burn one test call to confirm the contract.

4. **Canonical docs fourth** — when behavior is undocumented in skills, fetch from `https://docs.dev.runwayml.com/` directly.

## Lessons learned (verify these still hold; update if changed)

These are operational learnings from this project's build. They reflect undocumented edge cases and quirks worth knowing on day one of any future Runway work.

### Avatar reference images (Characters API)
- Avatar processing requires a clearly-detectable face. Watercolor and abstract illustrations FAIL face detection. Photorealistic OR Pixar-style 3D rendered (still has clear face features) succeeds.
- Real artist references in image-generation prompts (e.g., "in the style of Beatrix Potter") trigger the safety preprocessor and reject. Use descriptive style language instead ("watercolor and ink storybook illustration with visible pencil sketch lines").

### Personality and startScript safety filter (PATCH /v1/avatars)
- Long personality text (~85+ words) is often rejected with `"This text cannot be used for an avatar"` and no specific cause. The safer pattern is short personality (~50 words) + rich tool descriptions to carry the operational logic.
- Explicit tool name references in personality text (e.g., "call set_setting when X") trigger rejection (interpreted as prompt injection).
- `startScript` field has the same safety filter as `personality` and is often impossible to set. Plan UX around this — assume the avatar will not auto-greet.

### Model-specific parameter shapes
- `gemini_image3_pro` (Nano Banana Pro) requires ratios from a different list than `gen4_image`. `1344:768` for 16:9. Always check supported ratios per model.
- `gen4_image_turbo` requires `referenceImages: [...]` with at least one entry. It is an edit/restyle model, NOT pure text-to-image.
- `gpt_image_2` has yet another supported ratio list. Check before specifying.
- Realtime avatar voice presets ("clara", "vincent", "victoria") are DIFFERENT from TTS voice presets ("Maya", "Eleanor", "Mabel"). They are not interchangeable.

### SDK method names that don't match resource file names
- `client.soundEffect` (NOT `client.textToSoundEffect`) — the file is `sound-effect.d.ts` but the method name is `soundEffect`.
- `text_to_speech` API wants the field `promptText` (not `text`).

### Realtime tool calling
- Tools defined at session create time follow the shape `{ type: 'client_event', name, description, parameters: [...] }` with enum-constrained parameters.
- The LLM may fire tools during the AVATAR'S OWN SPEECH (e.g., when the avatar lists options aloud), not just after the user responds. Runway docs do not address this. Mitigations:
  - Tool description: "Do NOT call this tool when YOU yourself are listing the options. Only call AFTER the visitor speaks."
  - Client-side gate: use `useTranscription` to detect user audio. Drop tool fires that arrive before the user has spoken.
  - Defensive lock: ignore subsequent fires of the same tool once a value has been captured.
- `clientTool()` from `@runwayml/avatars-react` requires the file to be a client component (`'use client'`). Server routes cannot import from a file that imports `clientTool`. Split server-shape tool definitions into a separate file from the client-side `clientTool` wrappers.

### Vercel deployment
- Default function timeout on Vercel Hobby is 10 seconds. Most Runway calls take 30-90 seconds. Add `export const maxDuration = N` (60-300) to long-running route files. Hobby caps at 60s; Pro allows up to 300s.

## Default posture

When asked to integrate a Runway capability:

1. State the plan briefly (which endpoint, which SDK method, which model)
2. Load the matching `rw-*` skill if not already loaded this session
3. Verify SDK types if uncertain
4. Burn one test API call to confirm before writing app code
5. THEN implement
6. Smoke-test the implementation against the live API
7. Document anything new in this section

Do not skip steps. Speed without verification produces bandaid fixes that don't survive the next iteration.

# Clean Code Standards

All code produced in this project must follow these clean code principles. These are non-negotiable defaults — not suggestions.

## Naming

- Every variable, function, and class name must clearly communicate its purpose. No single-letter names, no abbreviations unless universally understood (e.g., `id`, `url`).
- Use `numberOfUsers` not `n`. Use `calculateShippingCost` not `calc`.

## Functions

- Each function does ONE thing (Single Responsibility Principle). If you can describe what a function does using "and," split it.
- Keep functions under 20 lines. If longer, extract helper functions.
- Prefer small, composable functions over large monolithic ones.

## Comments

- Code should be self-explanatory. Comments explain WHY, never WHAT or HOW.
- Bad: `// Loop through users` — Good: `// Retry failed users from the last sync batch`
- Delete comments that restate the code. Outdated comments are worse than no comments.

## Formatting & Consistency

- Use consistent indentation (2 or 4 spaces — pick one, never mix).
- Group related logic with blank lines. Separate concerns visually.
- Use Prettier/ESLint or equivalent formatter. Every file should look like the same person wrote it.

## No Hardcoded Values

- Extract magic numbers and strings into named constants or config.
- Bad: `if (users >= 100)` — Good: `if (users >= MAX_USERS)`

## Project Structure

- Organize by concern: `components/`, `services/`, `utils/`, `tests/`.
- Keep test files outside `src/` in a mirrored structure.
- Never dump everything in one directory.

## Error Handling

- Fail fast. Throw meaningful errors with clear messages.
- Use try/catch blocks. Never silently swallow errors.
- Log like you're documenting a crime scene: precise, relevant, minimal.

## Testing

- Write unit tests for every function with logic.
- Tests should be as clean as production code.
- Test edge cases, not just the happy path.

## Dependency Injection

- Pass dependencies as arguments rather than hardcoding them.
- This makes code testable and swappable.

## The Boy Scout Rule

- Leave every file cleaner than you found it.
- When touching existing code: rename unclear variables, extract messy functions, remove dead code.

## Open/Closed Principle

- Design for extension, not modification. Use polymorphism and composition.
- Adding a new feature should not require rewriting existing working code.

## Code Smells to Fix on Sight

- Duplicated logic → extract into a shared function
- God objects doing everything → split responsibilities
- Long parameter lists → use an options/config object
- Nested conditionals 3+ levels deep → extract or invert early returns
