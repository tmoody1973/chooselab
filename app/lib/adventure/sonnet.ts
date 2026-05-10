import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODELS } from '@/lib/constants';

let cachedClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (cachedClient) return cachedClient;
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }
  cachedClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return cachedClient;
}

interface SonnetCallArgs {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  /** When true, use the storyArchitect model. When false, use the panelWriter model. Defaults to panelWriter. */
  architectMode?: boolean;
}

/** Calls Claude Sonnet 4.6 and returns the parsed JSON object from the response. */
export async function callSonnetForJson<T>(args: SonnetCallArgs): Promise<T> {
  const client = getClient();
  const model = args.architectMode
    ? CLAUDE_MODELS.storyArchitect
    : CLAUDE_MODELS.panelWriter;

  const message = await client.messages.create({
    model,
    max_tokens: args.maxTokens ?? 1500,
    system: args.systemPrompt,
    messages: [{ role: 'user', content: args.userPrompt }],
  });

  const firstBlock = message.content[0];
  if (firstBlock?.type !== 'text') {
    throw new Error('Unexpected response shape from Sonnet');
  }

  return parseJsonStrict<T>(firstBlock.text);
}

function parseJsonStrict<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(
      `Sonnet returned non-JSON content: ${(err as Error).message}. First 200 chars: ${cleaned.slice(0, 200)}`
    );
  }
}
