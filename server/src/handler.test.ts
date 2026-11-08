import { describe, expect, it, vi } from 'vitest';
import { handleStructure } from './handler.js';
import { buildUserMessage, type StructuringClient } from './structure.js';

function fakeClient(reply: { text?: string; stop_reason?: string; throws?: unknown }) {
  const create = vi.fn(async () => {
    if (reply.throws) throw reply.throws;
    return {
      stop_reason: reply.stop_reason ?? 'end_turn',
      content: [{ type: 'text', text: reply.text ?? '{"items":[]}' }],
    };
  });
  return { client: { beta: { messages: { create } } } as unknown as StructuringClient, create };
}

const validBody = { transcript: 'call the dentist tomorrow', today: '2026-11-08', dailyMinutes: 20 };

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://monty.test/api/structure', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('handleStructure', () => {
  it('returns normalised items from the model', async () => {
    const { client, create } = fakeClient({
      text: JSON.stringify({
        items: [
          {
            title: 'Call the dentist',
            kind: 'reminder',
            estimatedMinutes: 10,
            priority: 'normal',
            dueDate: '2026-11-09',
            dueTime: null,
            habitWindow: null,
            steps: [],
          },
        ],
      }),
    });
    const res = await handleStructure(post(validBody), { client });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.items[0]).toMatchObject({ title: 'Call the dentist', dueDate: '2026-11-09' });

    const params = (create.mock.calls[0] as unknown[])[0] as Record<string, any>;
    expect(params.model).toBe('claude-opus-5-5');
    expect(params.output_config.format.type).toBe('json_schema');
    expect(params.messages[0].content).toContain('call the dentist tomorrow');
  });

  it('reports unusable model output as ok:false so the app keeps the raw text', async () => {
    const { client } = fakeClient({ text: 'not json' });
    const body = await (await handleStructure(post(validBody), { client })).json();
    expect(body).toEqual({ ok: false, error: 'Reply was not valid JSON' });
  });

  it('handles refusals', async () => {
    const { client } = fakeClient({ stop_reason: 'refusal', text: '' });
    const body = await (await handleStructure(post(validBody), { client })).json();
    expect(body.ok).toBe(false);
  });

  it('rejects bad requests without calling the model', async () => {
    const { client, create } = fakeClient({});
    expect((await handleStructure(post('nope'), { client })).status).toBe(400);
    expect((await handleStructure(post({ transcript: '' }), { client })).status).toBe(400);
    expect(
      (await handleStructure(new Request('https://monty.test/api/structure'), { client })).status,
    ).toBe(405);
    expect(create).not.toHaveBeenCalled();
  });

  it('checks the app token when one is configured', async () => {
    const { client } = fakeClient({});
    expect((await handleStructure(post(validBody), { client, appToken: 's3cret' })).status).toBe(401);
    expect(
      (await handleStructure(post(validBody, { 'x-monty-token': 's3cret' }), { client, appToken: 's3cret' }))
        .status,
    ).toBe(200);
  });

  it('does not leak error details or transcripts', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { client } = fakeClient({ throws: new Error('boom call the dentist') });
    const res = await handleStructure(post(validBody), { client });
    expect(res.status).toBe(500);
    expect(JSON.stringify(log.mock.calls)).not.toContain('dentist');
    log.mockRestore();
  });
});

describe('buildUserMessage', () => {
  it('includes the weekday, budget and open tasks', () => {
    const msg = buildUserMessage({ ...validBody, existingTaskTitles: ['Buy groceries'] });
    expect(msg).toContain('Today is Sunday 2026-11-08');
    expect(msg).toContain('20 minutes');
    expect(msg).toContain('- Buy groceries');
  });
});
