import Anthropic from '@anthropic-ai/sdk';
import { loadRubricForScenario, type Rubric, type Scenario } from '@/lib/load-rubric';

interface TranscriptEntry {
  id: string;
  text: string;
  final: boolean;
  participantIdentity: string;
}

interface EvaluateRequest {
  scenarioId: string;
  transcript: TranscriptEntry[];
  avatarParticipantIdentity?: string;
}

interface EvaluatorOutput {
  scores: Record<string, number>;
  totalScore: number;
  strength: string;
  nextStep: string;
}

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 800;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY not configured. Add it to app/.env.local and restart the dev server.' },
      { status: 500 }
    );
  }

  let body: EvaluateRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.scenarioId || !Array.isArray(body.transcript)) {
    return Response.json(
      { error: 'Missing required fields: scenarioId, transcript[]' },
      { status: 400 }
    );
  }

  const userTurns = collectUserTurns(body.transcript, body.avatarParticipantIdentity);
  if (userTurns.length === 0) {
    return Response.json(
      {
        strength: '',
        nextStep: "We didn't catch any of your responses this round. Try the scenario again and speak naturally — we'll capture what you say.",
        scores: {},
        totalScore: 0,
        empty: true,
      },
      { status: 200 }
    );
  }

  let scenario: Scenario;
  let rubric: Rubric;
  try {
    ({ scenario, rubric } = await loadRubricForScenario(body.scenarioId));
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to load rubric' },
      { status: 400 }
    );
  }

  const transcriptText = formatTranscript(body.transcript, scenario, body.avatarParticipantIdentity);
  const systemPrompt = buildSystemPrompt(scenario, rubric);
  const userPrompt = buildUserPrompt(scenario, transcriptText);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let raw = '';
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const firstBlock = message.content[0];
    if (firstBlock?.type !== 'text') {
      return Response.json({ error: 'Unexpected response shape from Claude' }, { status: 502 });
    }
    raw = firstBlock.text;
  } catch (err) {
    console.error('Claude call failed:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'LLM call failed' },
      { status: 502 }
    );
  }

  const parsed = parseEvaluatorOutput(raw);
  if (!parsed) {
    return Response.json(
      { error: 'Could not parse evaluator output as JSON', raw },
      { status: 502 }
    );
  }

  return Response.json(parsed);
}

function collectUserTurns(
  transcript: TranscriptEntry[],
  avatarParticipantIdentity?: string
): TranscriptEntry[] {
  const finals = transcript.filter((entry) => entry.final);
  if (avatarParticipantIdentity) {
    return finals.filter((entry) => entry.participantIdentity !== avatarParticipantIdentity);
  }
  return finals;
}

function formatTranscript(
  transcript: TranscriptEntry[],
  scenario: Scenario,
  avatarParticipantIdentity?: string
): string {
  const finals = transcript.filter((entry) => entry.final);
  return finals
    .map((entry) => {
      const isAvatar = avatarParticipantIdentity
        ? entry.participantIdentity === avatarParticipantIdentity
        : entry.participantIdentity?.toLowerCase().includes('agent') ||
          entry.participantIdentity?.toLowerCase().includes('avatar');
      const speaker = isAvatar ? scenario.character.name : 'User (practicing)';
      return `${speaker}: ${entry.text}`;
    })
    .join('\n');
}

function buildSystemPrompt(scenario: Scenario, rubric: Rubric): string {
  const dimensionsBlock = rubric.dimensions
    .map((d) => {
      const scoring = Object.entries(d.scoring)
        .map(
          ([score, def]) =>
            `    ${score} (${def.label}): ${def.criteria} Example: "${def.example}"`
        )
        .join('\n');
      return `  ${d.id} — ${d.name} (framework: ${d.framework_source})\n${scoring}`;
    })
    .join('\n\n');

  const strongExamples = rubric.worked_examples.strong
    .map(
      (ex) =>
        `  ${ex.label} → total ${ex.total}/${rubric.max_total}\n    response: "${ex.response}"\n    scores: ${JSON.stringify(ex.scores)}\n    why: ${ex.reasoning}`
    )
    .join('\n\n');

  const weakExamples = rubric.worked_examples.weak
    .map(
      (ex) =>
        `  ${ex.label} → total ${ex.total}/${rubric.max_total}\n    response: "${ex.response}"\n    scores: ${JSON.stringify(ex.scores)}\n    why: ${ex.reasoning}`
    )
    .join('\n\n');

  const doNotScore = rubric.do_not_score.map((rule) => `  - ${rule}`).join('\n');

  return `You are an evaluator for ScenarioLab, a practice tool that helps autistic adults rehearse real-world conversations. The user is the "${scenario.user_role}" in this conversation. Your job is to score the user's responses against a peer-reviewed rubric and return a single specific strength and a single specific next-step.

# Scenario context
- Domain: ${scenario.domain}
- Target skill: ${scenario.target_skill}
- Character the user is talking to: ${scenario.character.name} (role: ${scenario.character.role})
- Success criteria for this scenario:
${scenario.success_criteria.map((c) => `  - ${c}`).join('\n')}
- Common missteps to watch for (these signal LOWER scores, do NOT name them as a "strength"):
${scenario.common_missteps.map((c) => `  - ${c}`).join('\n')}

# Rubric: ${rubric.id} (${rubric.target_skill})
Each dimension is scored ${rubric.scale_per_dimension}. Maximum total: ${rubric.max_total}.

${dimensionsBlock}

# Strong worked examples (calibration)
${strongExamples}

# Weak worked examples (calibration)
${weakExamples}

# DO NOT SCORE (critical guardrails)
${doNotScore}

# Evaluator directive (read carefully before scoring)
${rubric.evaluator_directive}

# Output format (strict)
Return ONLY a single JSON object, no preamble, no markdown fences, no commentary. Shape:
{
  "scores": { "${rubric.dimensions.map((d) => d.id).join('": <0-2>, "')}": <0-2> },
  "totalScore": <0-${rubric.max_total}>,
  "strength": "<one sentence, specific, names what the user actually did>",
  "nextStep": "<one sentence, specific, suggests one concrete thing to try, no judgmental language>"
}

Rules for "strength" and "nextStep":
- Address the user directly ("You named...", "Try...").
- Be specific: cite a concrete moment from the transcript when possible.
- "nextStep" must NOT criticize tone, warmth, affect, eye contact, or politeness — score on content only.
- If the user already scored ${rubric.max_total}/${rubric.max_total}, "nextStep" should be a stretch ("To go even further, try..."), never invented criticism.

# CRITICAL: RSD-aware feedback delivery (read before composing strength/nextStep)
The user is likely autistic, ADHD, or AuDHD. Rejection-Sensitive Dysphoria (Bisby et al. 2024) and the criticism-sensitivity literature (Beaton et al. 2022) mean the FRAMING of feedback determines whether the user can act on it or shuts down. Apply these standards to BOTH strength and nextStep:

FAVOR:
- Behavior-specific, situated descriptions tied to a rubric dimension. Example: "In your second sentence you went straight to a fix. Adding one sentence acknowledging her tiredness first hits D1."
- Affirm what worked first, in the strength field. Then name a single, specific gap with a concrete next attempt in nextStep.
- Plain-English, concrete, literal language. Quote what the user actually said when possible.
- Optionality framing where appropriate: "If you want a more conventional register, you could add… — both versions can score ${rubric.max_total}/${rubric.max_total}."

BANNED LANGUAGE — never produce, in either strength or nextStep:
- Global trait labels about the user: "you came across as cold", "blunt", "awkward", "scattered", "unconfident", "rude", "robotic", "rushed", "flat", "stiff". These are pure RSD trigger language and exactly what Sasson et al. 2017 thin-slice bias attacks. Score behavior, never character.
- Warmth/affect coaching: "try to sound more empathetic", "add some warmth", "soften your tone", "be more emotional", "show more feeling", "smile more". This coaches camouflaging (Hull et al. 2017; Beck et al. 2020) and contradicts our content-only rubric.
- Confidence/polish/presence coaching: "be more confident", "more energy", "more polish", "more executive presence". These are NT thin-slice constructs (Sasson 2017) with zero correlation to interview validity.
- Inferred intent/character: "it sounded like you were rushing", "you didn't seem to care", "you came off as ___". Content-only scoring forbids this — you cannot read the user's mind from a transcript.
- Comparisons to "what most people do" or "neurotypical expectations" or "social norms" — Crompton et al. 2020a/b show that's a dyad property, not a user property.
- Implicit demand to apologize, soften, or pad — contradicts ASAN 2013, I PLAN, and the Heasman & Gillespie 2019 finding on autistic intersubjectivity.

# CRITICAL: nextStep must be EXACTLY ONE action — strict format
- ONE sentence. Maximum 30 words.
- ONE concrete action the user can take next time. Not two. Not "and also". Not "while also".
- BANNED phrases (rewrite if any appear): "and also", "and try", "and then", "while also", "additionally", "you could also", "another thing", "alongside", "in addition". Collapse to the single highest-impact action.
- BANNED structure: lists, semicolons connecting two actions, comma-separated action pairs ("ask X, and offer Y").
- If the user has multiple things to improve, pick the ONE that would lift the lowest-scoring dimension closest to its max.
- Tie the nextStep to a specific rubric dimension when possible: "On D3 (specificity), try…"

Good nextStep examples (single action, specific, neurodivergent-affirming):
- "On D1 (acknowledgment), try naming the specific feeling Alex described — for example, 'Tired and unfocused is a rough combo' — before offering support."
- "Open with the concrete ask first: 'I need a 48-hour extension on the Wednesday paper.' Reasons can come second."
- "On D3 (specificity), add one number, tool, or role to your example — for instance, 'cut regression time from 4h to 90min' — so the interviewer can see the concrete action."

Bad nextStep examples (DO NOT produce these):
- "Try acknowledging Alex's feeling specifically, and also offer to help with their workload." (two actions)
- "Be more specific in your ask, and use a softer tone to make it less awkward." (two actions + tone-policing — banned twice)
- "Cover the Action and Result parts of STAR clearly; you could also mention a specific outcome number." (two actions)
- "Sound more confident and direct in your delivery." (banned trait language + tone coaching)
- "It came across as a bit cold, so try adding warmth." (banned trait label + warmth coaching)

Good strength examples:
- "You named the specific emotional state ('tiredness') and its concrete impact ('makes concentrating really difficult'), then offered low-pressure practical support — that's complex reflection (D3) plus autonomy-respecting offer (D5)."
- "You stated the ask, the reason, and a concrete proposal in three sentences with no apology padding — that's I PLAN's target behavior (D1+D2+D3 all 2)."
- "You labeled all four STAR elements explicitly. That's a valid working-memory scaffold and earns full D2."

Bad strength examples (DO NOT produce these):
- "Great job!" (generic, not specific)
- "You did well at acknowledging." (generic, no quote, no dimension)
- "You showed empathy." (trait language without behavior anchor)

Final check before returning JSON: read both fields aloud.
1. Did I use any banned trait language? If yes, rewrite using behavior + dimension.
2. Did I coach tone, warmth, confidence, or polish? If yes, rewrite using content only.
3. Can nextStep split on "and" into two complete actions? If yes, rewrite as ONE.
4. Is strength specific enough that the user could quote it back to themselves? If not, add a transcript anchor.

# Scientific framing for the user (do not include in output, just inform tone)
The text-rubric surface ScenarioLab uses is empirically the more equitable channel — Sasson et al. 2017 (Sci. Rep. 7:40700) showed that thin-slice bias against autistic adults disappears when evaluators see only transcripts. You are scoring exactly what the user produced. That is the point.`;
}

function buildUserPrompt(scenario: Scenario, transcriptText: string): string {
  return `Here is the transcript of the practice conversation. Evaluate ONLY the user's responses (the "${scenario.user_role}"). The avatar's lines are context — do not score them.

# Transcript
${transcriptText || '(no user turns captured)'}

Now score each rubric dimension and return the JSON object as specified.`;
}

function parseEvaluatorOutput(raw: string): EvaluatorOutput | null {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (
      typeof parsed.totalScore === 'number' &&
      typeof parsed.strength === 'string' &&
      typeof parsed.nextStep === 'string' &&
      parsed.scores &&
      typeof parsed.scores === 'object'
    ) {
      return {
        scores: parsed.scores,
        totalScore: parsed.totalScore,
        strength: parsed.strength,
        nextStep: parsed.nextStep,
      };
    }
    return null;
  } catch {
    return null;
  }
}
