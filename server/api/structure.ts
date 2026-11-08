import Anthropic from '@anthropic-ai/sdk';
import { handleStructure } from '../src/handler.js';

// Reads ANTHROPIC_API_KEY from the Vercel project's environment variables.
const client = new Anthropic({ timeout: 55_000, maxRetries: 1 });

export async function POST(request: Request): Promise<Response> {
  return handleStructure(request, { client, appToken: process.env.MONTY_APP_TOKEN || undefined });
}
