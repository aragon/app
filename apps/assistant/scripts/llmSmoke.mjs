// LLM smoke test: runs a handful of real conversations against a deployed assistant instance
// (real models, real Linear team of that environment). Non-blocking by design — it validates that
// the prompts, the pipeline and the Linear integration still work end to end, not unit behavior.
//
// Tickets are created the way the widget creates them: the agent drafts a createLinearTicket tool
// call, the stream pauses on a tool approval request, and a resume request carrying the approved
// tool part executes the creation.
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

// The assistant domains sit behind Vercel's bot challenge, which a plain fetch cannot solve;
// automation passes it with the secret checked by the assistant-smoke-bypass firewall rule.
// Without the secret the header is omitted and every scenario fails with the challenge's 403.
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const bypassHeaders = bypassSecret
    ? { 'x-vercel-protection-bypass': bypassSecret }
    : {};

const createTicketToolName = 'createLinearTicket';

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

// One request against /chat, digested into what the scenarios assert on: the assembled reply
// text, the createLinearTicket draft (input + approval request) when the agent produced one,
// and the executed tool output on a resume.
const sendChatTurn = async (sessionId, messages) => {
    const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...bypassHeaders },
        body: JSON.stringify({ sessionId, messages, appContext }),
    });

    if (!response.ok) {
        throw new Error(
            `POST /chat responded with ${response.status}: ${await response.text()}`,
        );
    }

    const chunks = await readStream(response);
    const text = chunksToText(chunks);
    const messageId = chunks.find((chunk) => chunk.type === 'start')?.messageId;
    const draftInput = chunks.find(
        (chunk) =>
            chunk.type === 'tool-input-available' &&
            chunk.toolName === createTicketToolName,
    );
    const approvalRequest = chunks.find(
        (chunk) =>
            chunk.type === 'tool-approval-request' &&
            chunk.toolCallId === draftInput?.toolCallId,
    );
    const toolOutput = chunks.find(
        (chunk) => chunk.type === 'tool-output-available',
    );

    return { approvalRequest, draftInput, messageId, text, toolOutput };
};

// Drives the conversation until the agent drafts a ticket, tolerating one clarifying question
// (a real model sometimes asks for details before drafting). Returns the transcript so far and
// the draft; throws when no draft appeared within the allowed turns.
const converseUntilDraft = async (sessionId, openingText, followUpText) => {
    const messages = [buildUserMessage(openingText)];
    let turn = await sendChatTurn(sessionId, messages);

    if (!(turn.draftInput && turn.approvalRequest)) {
        if (turn.text.length === 0) {
            throw new Error('expected a reply, got an empty stream');
        }
        logStep('no draft on the first turn, answering the follow-up');
        messages.push(
            {
                id: turn.messageId ?? randomUUID(),
                role: 'assistant',
                parts: [{ type: 'text', text: turn.text }],
            },
            buildUserMessage(followUpText),
        );
        turn = await sendChatTurn(sessionId, messages);
    }

    if (!(turn.draftInput && turn.approvalRequest)) {
        throw new Error(
            `expected a ${createTicketToolName} draft with an approval request, got: ${turn.text.slice(0, 200)}`,
        );
    }

    return { messages, turn };
};

// Rebuilds the widget's approval resume: the history is re-sent ending on the assistant message
// whose tool part carries the user's approval; executing that part is what creates the ticket.
const approveDraft = async (sessionId, messages, turn) => {
    const assistantMessage = {
        id: turn.messageId ?? randomUUID(),
        role: 'assistant',
        parts: [
            { type: 'text', text: turn.text },
            {
                type: `tool-${createTicketToolName}`,
                toolCallId: turn.draftInput.toolCallId,
                state: 'approval-responded',
                input: turn.draftInput.input,
                approval: {
                    id: turn.approvalRequest.approvalId,
                    approved: true,
                },
            },
        ],
    };

    return sendChatTurn(sessionId, [...messages, assistantMessage]);
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
    const response = await fetch(`${baseUrl}/health`, {
        headers: bypassHeaders,
    });
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

        // The transcript carries no support request: the agent must decline in text and never
        // draft a ticket for approval.
        if (turn.draftInput || turn.approvalRequest) {
            throw new Error(
                `expected no ticket draft for an off-topic transcript, got: ${JSON.stringify(turn.draftInput?.input)}`,
            );
        }
    },
);

await runScenario(
    'bug report drafts a reviewable ticket and creates it on approval',
    async () => {
        const sessionId = randomUUID();
        const { messages, turn } = await converseUntilDraft(
            sessionId,
            'I found a bug in the app: the proposal page crashes with a blank screen whenever I open any proposal on ethereum mainnet. It started today and reproduces every time I click a proposal in the list. My email is llm-smoke@aragon.org.',
            'It happens on every proposal, Chrome on desktop, no console access. Please just file the ticket with what we have.',
        );

        const { input } = turn.draftInput;
        if (!input.title || !input.description) {
            throw new Error(
                `draft misses title/description: ${JSON.stringify(input)}`,
            );
        }
        logStep(`draft: intent=${input.intent} title=${input.title}`);

        const resume = await approveDraft(sessionId, messages, turn);
        const output = resume.toolOutput?.output;
        if (!output?.identifier || !output?.url) {
            throw new Error(
                `expected the executed tool output with identifier/url, got: ${JSON.stringify(resume.toolOutput ?? resume.text.slice(0, 200))}`,
            );
        }
        if (resume.text.length === 0) {
            throw new Error('expected a closing message after the creation');
        }
        logStep(`created ${output.identifier} (${output.url})`);
    },
);

await runScenario('feedback intent is understood', async () => {
    const sessionId = randomUUID();
    // Draft only — the approval is never sent, so no ticket is created.
    const { turn } = await converseUntilDraft(
        sessionId,
        'Just some feedback: I love the new governance designer, but the save button is hard to find on small screens. Please pass it on to the team.',
        'Nothing more to add — please just file the feedback as described.',
    );

    if (turn.draftInput.input.intent !== 'feedback') {
        throw new Error(
            `expected intent 'feedback', got '${String(turn.draftInput.input.intent)}'`,
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
