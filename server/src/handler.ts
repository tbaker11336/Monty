import Anthropic from '@anthropic-ai/sdk';
import { StructureRequestSchema, type StructureResponse } from '@monty/core';
import { structureTranscript, type StructuringClient } from './structure.js';

const MAX_BODY_BYTES = 64 * 1024;

function json(body: StructureResponse | { ok: false; error: string }, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

export interface HandlerDeps {
  client: StructuringClient;
  /** Optional shared token expected in the x-monty-token header. */
  appToken?: string | undefined;
}

/**
 * POST /api/structure. Transcripts are never logged: errors are reported by
 * kind only, so the server keeps nothing beyond what is needed to answer.
 */
export async function handleStructure(request: Request, deps: HandlerDeps): Promise<Response> {
  if (request.method !== 'POST') return json({ ok: false, error: 'Use POST' }, 405);
  if (deps.appToken && request.headers.get('x-monty-token') !== deps.appToken) {
    return json({ ok: false, error: 'Not allowed' }, 401);
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'Too long' }, 413);
  }
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ ok: false, error: 'Body must be JSON' }, 400);
  }
  const parsed = StructureRequestSchema.safeParse(body);
  if (!parsed.success) return json({ ok: false, error: 'Invalid request' }, 400);

  try {
    const result = await structureTranscript(deps.client, parsed.data);
    return json(result, 200);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      console.error('structure: rate limited');
      return json({ ok: false, error: 'Busy, try again shortly' }, 503);
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`structure: API error ${error.status ?? 'network'}`);
      return json({ ok: false, error: 'Sorting is unavailable right now' }, 502);
    }
    console.error('structure: unexpected error', error instanceof Error ? error.name : typeof error);
    return json({ ok: false, error: 'Sorting is unavailable right now' }, 500);
  }
}
