// LLM smoke test: runs a handful of real conversations against a deployed assistant instance
// (real models, real Linear team of that environment). Non-blocking by design — it validates that
// the prompts, the pipeline and the Linear integration still work end to end, not unit behavior.
//
// Usage: node scripts/llmSmoke.mjs [baseUrl]
// The base URL defaults to ASSISTANT_SMOKE_URL or https://dev.assistant.aragon.org.

import { randomUUID } from 'node:crypto';

const baseUrl = (
    process.argv[2] ??
    process.env.ASSISTANT_SMOKE_URL ??
    'https://dev.assistant.aragon.org'
).replace(/\/$/, '');

const appContext = { route: '/llm-smoke', appVersion: 'llm-smoke' };

const failures = [];

const logStep = (message) => {
    process.stdout.write(`${message}\n`);
};

const buildUserMessage = (text) => ({
    id: randomUUID(),
    role: 'user',
    parts: [{ type: 'text', text }],
});

// Parses an AI SDK UI message SSE stream into its JSON chunks.
const readStream = async (response) => {
    const raw = await response.text();
    return raw
        .split('\n\n')
        .map((event) => event.replace(/^data: /, '').trim())
        .filter((event) => event.length > 0 && event !== '[DONE]')
        .map((event) => JSON.parse(event));
};

const chunksToText = (chunks) =>
    chunks
        .filter((chunk) => chunk.type === 'text-delta')
        .map((chunk) => chunk.delta)
        .join('');

const sendChatTurn = async (sessionId, messages) => {
    const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, messages, appContext }),
    });

    if (!response.ok) {
        throw new Error(
            `POST /chat responded with ${response.status}: ${await response.text()}`,
        );
    }

    const chunks = await readStream(response);
    const text = chunksToText(chunks);

    return {
        messages: [
            ...messages,
            {
                id: randomUUID(),
                role: 'assistant',
                parts: [{ type: 'text', text }],
            },
        ],
        text,
    };
};

const postJson = async (path, sessionId, messages) => {
    const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, messages, appContext }),
    });

    return { status: response.status, body: await response.json() };
};

const runScenario = async (name, scenario) => {
    logStep(`--- ${name}`);
    try {
        await scenario();
        logStep(`OK ${name}`);
    } catch (error) {
        failures.push({ name, error });
        logStep(`FAIL ${name}: ${error.message}`);
    }
};

await runScenario('health', async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();
    if (!response.ok || body.status !== 'ok') {
        throw new Error(`unexpected health response: ${JSON.stringify(body)}`);
    }
    logStep(`environment: ${body.environment}`);
});

await runScenario(
    'off-topic conversations are refused without a ticket',
    async () => {
        const sessionId = randomUUID();
        const turn = await sendChatTurn(sessionId, [
            buildUserMessage('What is the current price of ETH and ANT?'),
        ]);

        if (turn.text.length === 0) {
            throw new Error('expected a refusal message, got an empty stream');
        }

        // The transcript carries no support request: the preview must come back unclear and
        // creation (without a stored snapshot) must be refused.
        const preview = await postJson(
            '/issues/preview',
            sessionId,
            turn.messages,
        );
        if (preview.status !== 200 || preview.body.status !== 'unclear') {
            throw new Error(
                `expected an unclear preview, got ${preview.status}: ${JSON.stringify(preview.body)}`,
            );
        }

        const issue = await postJson('/issues', sessionId, turn.messages);
        if (issue.status !== 422) {
            throw new Error(
                `expected 422 for an off-topic transcript, got ${issue.status}`,
            );
        }
    },
);

await runScenario(
    'bug report previews a reviewable ticket and creates it',
    async () => {
        const sessionId = randomUUID();
        const turn = await sendChatTurn(sessionId, [
            buildUserMessage(
                'I found a bug in the app: the proposal page crashes with a blank screen whenever I open any proposal on ethereum mainnet. It started today and reproduces every time I click a proposal in the list. My email is llm-smoke@aragon.org.',
            ),
        ]);
        if (turn.text.length === 0) {
            throw new Error('expected a reply, got an empty stream');
        }

        const preview = await postJson(
            '/issues/preview',
            sessionId,
            turn.messages,
        );
        if (
            preview.status !== 200 ||
            preview.body.status !== 'ready' ||
            !preview.body.summary
        ) {
            throw new Error(
                `expected a ready preview with a summary, got ${preview.status}: ${JSON.stringify(preview.body)}`,
            );
        }
        logStep(
            `preview: intent=${preview.body.intent} summary=${preview.body.summary}`,
        );

        const issue = await postJson('/issues', sessionId, turn.messages);
        if (issue.status !== 201) {
            throw new Error(
                `expected 201 from POST /issues, got ${issue.status}: ${JSON.stringify(issue.body)}`,
            );
        }
        if (!issue.body.identifier || !issue.body.url) {
            throw new Error(
                `issue response misses identifier/url: ${JSON.stringify(issue.body)}`,
            );
        }
        logStep(`created ${issue.body.identifier} (${issue.body.url})`);

        // Retrying the same session must be idempotent and return the same issue.
        const retry = await postJson('/issues', sessionId, turn.messages);
        if (retry.status !== 200 || retry.body.issueId !== issue.body.issueId) {
            throw new Error(
                `expected an idempotent retry, got ${retry.status}: ${JSON.stringify(retry.body)}`,
            );
        }
    },
);

await runScenario('feedback intent is understood', async () => {
    const sessionId = randomUUID();
    const turn = await sendChatTurn(sessionId, [
        buildUserMessage(
            'Just some feedback: I love the new governance designer, but the save button is hard to find on small screens.',
        ),
    ]);

    if (turn.text.length === 0) {
        throw new Error('expected a reply, got an empty stream');
    }

    const preview = await postJson('/issues/preview', sessionId, turn.messages);
    if (preview.status !== 200 || preview.body.status !== 'ready') {
        throw new Error(
            `expected a ready preview, got ${preview.status}: ${JSON.stringify(preview.body)}`,
        );
    }
    if (preview.body.intent !== 'feedback') {
        throw new Error(
            `expected intent 'feedback', got '${String(preview.body.intent)}'`,
        );
    }
});

if (failures.length > 0) {
    process.stdout.write(
        `\n${failures.length} scenario(s) failed: ${failures
            .map((failure) => failure.name)
            .join(', ')}\n`,
    );
    process.exit(1);
}

logStep('\nAll LLM smoke scenarios passed.');
