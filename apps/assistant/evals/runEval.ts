// Assistant eval: runs the conversations of scenarios.ts through the agent as the chat route
// wires it — the real system prompt, tools, documentation index, provider options (zero data
// retention), reasoning level, step bound and time cap — on each candidate model, checks every
// reply against the scenario's rules and has a judge model grade it against the scenario's
// reference. It is how a model, a reasoning level, a prompt change or a documentation change is
// chosen: run it before and after.
//
// It calls real models through the AI Gateway (a few cents per model and run) and never creates a
// ticket: the ticket tool stops at its approval, as in the route. The documentation scenarios need
// the index (`pnpm build:docs-index`).
//
//   pnpm eval --models openai/gpt-6-luna,deepseek/deepseek-v4.1-flash [--runs 2] [--mode docs|intake]
//             [--reasoning none|low|…] [--judge anthropic/claude-sonnet-5|none] [--only <id,…>]
//             [--json <file>]

import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import {
    assistantLimits,
    createTicketToolName,
    docsToolNameSet,
} from '@aragon/assistant-contracts';
import {
    generateText,
    type ModelMessage,
    Output,
    stepCountIs,
    type ToolSet,
} from 'ai';
import { z } from 'zod';
import {
    chatTimeoutMs,
    getChatProviderOptions,
    getChatReasoning,
    type IChatReasoning,
    maxAgentSteps,
} from '../src/chat/models';
import { buildAgentSystemPrompt } from '../src/chat/prompts/agentPrompt';
import {
    buildCreateLinearTicketTool,
    type ICreateTicketContext,
} from '../src/chat/tools/createLinearTicket';
import { buildDocsTools } from '../src/chat/tools/docsTools';
import { buildFlagOffTopicTool } from '../src/chat/tools/flagOffTopic';
import type { IDocsSearch } from '../src/docs/docsSearch';
import { observability } from '../src/lib/observability';
import {
    evalScenarios,
    type IEvalContext,
    type IEvalMode,
    type IEvalScenario,
    type IEvalToolCall,
    type IEvalTurnResult,
} from './scenarios';

const { values } = parseArgs({
    options: {
        models: { type: 'string' },
        runs: { type: 'string', default: '2' },
        mode: { type: 'string', default: 'docs' },
        judge: { type: 'string', default: 'anthropic/claude-sonnet-5' },
        only: { type: 'string' },
        concurrency: { type: 'string', default: '4' },
        reasoning: { type: 'string' },
        json: { type: 'string' },
    },
});

const reasoningLevels: IChatReasoning[] = [
    'provider-default',
    'none',
    'minimal',
    'low',
    'medium',
    'high',
    'xhigh',
];

const models = (values.models ?? '').split(',').filter((model) => model !== '');
const runs = Number(values.runs);
const mode = values.mode as IEvalMode;
const judgeModel = values.judge === 'none' ? undefined : values.judge;
const concurrency = Number(values.concurrency);
// A candidate level for every model, or each model's own (getChatReasoning) when none is given.
const reasoningOverride = values.reasoning as IChatReasoning | undefined;
const reasoningFor = (model: string): IChatReasoning =>
    reasoningOverride ?? getChatReasoning(model);

const isPositiveInteger = (value: number) =>
    Number.isInteger(value) && value > 0;

if (
    models.length === 0 ||
    !['docs', 'intake'].includes(mode) ||
    !isPositiveInteger(runs) ||
    !isPositiveInteger(concurrency) ||
    (reasoningOverride != null && !reasoningLevels.includes(reasoningOverride))
) {
    process.stderr.write(
        `Usage: pnpm eval --models <id,…> [--runs 2] [--concurrency 4] [--mode docs|intake] [--reasoning ${reasoningLevels.join('|')}] [--judge <id>|none] [--only <id,…>] [--json <file>]\n`,
    );
    process.exit(1);
}
if ((process.env.AI_GATEWAY_API_KEY ?? '') === '') {
    process.stderr.write(
        'AI_GATEWAY_API_KEY is not set (apps/assistant/.env).\n',
    );
    process.exit(1);
}

// The step log is the route's production transport; here it would drown the report.
observability.logStep = () => undefined;

const docsSearchEnabled = mode === 'docs';

const loadDocsSearch = async (): Promise<IDocsSearch | undefined> => {
    if (!docsSearchEnabled) {
        return undefined;
    }
    try {
        const { createDefaultDocsSearch } = await import(
            '../src/docs/defaultDocsSearch'
        );

        return createDefaultDocsSearch();
    } catch {
        process.stderr.write(
            'No documentation index: run `pnpm build:docs-index` first.\n',
        );
        process.exit(1);
    }
};

const docsSearch = await loadDocsSearch();

// Chain names from the supported-chains table, so the completeness check follows the corpus.
const readChains = (): string[] | undefined => {
    const page = docsSearch?.readDoc('application/supported-chains.md');

    return page?.content
        .split('\n')
        .filter(
            (line) => /^\| [^|-]/.test(line) && !line.startsWith('| Chain '),
        )
        .map((line) => line.split('|')[1].trim());
};

const context: IEvalContext = { chains: readChains() };

// The ticket tool never runs here: it waits for the user's approval, as in the route, and the
// eval never grants it. Any access to the context would mean it did.
const neverExecutedContext = new Proxy(
    {},
    {
        get: () => {
            throw new Error('The eval never executes the ticket tool.');
        },
    },
) as ICreateTicketContext;

const buildTools = (): ToolSet => ({
    [createTicketToolName]: buildCreateLinearTicketTool(neverExecutedContext),
    flagOffTopic: buildFlagOffTopicTool('eval', { docsSearchEnabled }),
    ...(docsSearch == null
        ? {}
        : buildDocsTools({ docsSearch, sessionId: 'eval' })),
});

interface ITurnRun extends IEvalTurnResult {
    ms: number;
    inputTokens: number;
    outputTokens: number;
    error?: string;
}

const runTurn = async (
    model: string,
    messages: ModelMessage[],
): Promise<{ turn: ITurnRun; responseMessages: ModelMessage[] }> => {
    const started = Date.now();
    try {
        const result = await generateText({
            model,
            system: buildAgentSystemPrompt({ docsSearchEnabled }),
            messages,
            tools: buildTools(),
            toolApproval: { [createTicketToolName]: () => 'user-approval' },
            stopWhen: stepCountIs(maxAgentSteps),
            reasoning: reasoningFor(model),
            maxOutputTokens: assistantLimits.maxOutputTokens,
            // No fallback models: the eval measures the model asked for.
            providerOptions: getChatProviderOptions([]),
            abortSignal: AbortSignal.timeout(chatTimeoutMs),
        });
        const toolCalls: IEvalToolCall[] = result.steps.flatMap((step) =>
            step.toolCalls.map((call) => ({
                toolName: call.toolName,
                input: (call.input ?? {}) as Record<string, unknown>,
            })),
        );
        const docsOutputs = result.steps.flatMap((step) =>
            step.toolResults
                .filter((toolResult) =>
                    docsToolNameSet.has(toolResult.toolName),
                )
                .map((toolResult) => JSON.stringify(toolResult.output)),
        );

        return {
            turn: {
                text: result.text,
                toolCalls,
                docsOutputs,
                ms: Date.now() - started,
                inputTokens: result.totalUsage.inputTokens ?? 0,
                outputTokens: result.totalUsage.outputTokens ?? 0,
            },
            responseMessages: result.response.messages,
        };
    } catch (error) {
        return {
            turn: {
                text: '',
                toolCalls: [],
                docsOutputs: [],
                ms: Date.now() - started,
                inputTokens: 0,
                outputTokens: 0,
                error:
                    error instanceof Error
                        ? `${error.name}: ${error.message}`
                        : String(error),
            },
            responseMessages: [],
        };
    }
};

const judgeSchema = z.object({
    accuracy: z.number().int().min(1).max(5),
    helpfulness: z.number().int().min(1).max(5),
    communication: z.number().int().min(1).max(5),
    verdict: z.string(),
});

type IJudgement = z.infer<typeof judgeSchema>;

const judgeSystem = `You grade replies of the Aragon app's support assistant. The assistant answers questions about the Aragon platform only from its documentation tools, and turns feedback, bug reports and support requests into a ticket draft the user approves (the draft is a separate card in the chat; the reply only introduces it). Where the Aragon team sets something up, or the app lacks what the user wants, the reply ends with one sentence and a contact link.

Score each dimension from 1 to 5:
- accuracy: every claim is backed by the documentation the assistant retrieved or by the reference; nothing invented; nothing wrong about what the app can or cannot do.
- helpfulness: the reply gives the user what they actually need or the right next step (the answer, the contact link, the ticket draft, one clarifying question) — not a dead end, not an unasked ticket.
- communication: plain, concise, second person, the user's language, no talk about documentation, sources or tools, friendly without filler.

The reference says what a good reply does; grade against it, without penalising correct extra facts. 5: a support lead would send it as is. 3: usable, with a clear flaw. 1: wrong or harmful. The verdict names the main flaw in one sentence, or "fine".`;

const truncate = (text: string, max: number) =>
    text.length > max ? `${text.slice(0, max)} …[truncated]` : text;

const judge = async (
    scenario: IEvalScenario,
    turns: ITurnRun[],
): Promise<IJudgement | undefined> => {
    if (judgeModel == null) {
        return undefined;
    }
    const retrieved = turns.at(-1)?.docsOutputs.join('\n') ?? '';
    const transcript = scenario.turns
        .map((userText, index) => {
            const turn = turns[index];
            const calls = turn?.toolCalls
                .filter((call) => !docsToolNameSet.has(call.toolName))
                .map(
                    (call) => `${call.toolName}(${JSON.stringify(call.input)})`,
                )
                .join(', ');

            return `User: ${userText}\nAssistant: ${turn?.text ?? ''}${calls ? `\n[tool calls: ${calls}]` : ''}`;
        })
        .join('\n\n');

    try {
        const { output } = await generateText({
            model: judgeModel,
            system: judgeSystem,
            output: Output.object({ schema: judgeSchema }),
            prompt: `Reference: ${scenario.expectation}\n\nConversation:\n${transcript}\n\nDocumentation the assistant retrieved in its last turn:\n${truncate(retrieved, 12_000) || '(none)'}`,
            providerOptions: { gateway: { zeroDataRetention: true } },
            abortSignal: AbortSignal.timeout(90_000),
        });

        return output;
    } catch {
        return undefined;
    }
};

interface IScenarioRun {
    model: string;
    scenario: string;
    run: number;
    failures: string[];
    judgement?: IJudgement;
    turns: ITurnRun[];
}

const runScenario = async (
    model: string,
    scenario: IEvalScenario,
    run: number,
): Promise<IScenarioRun> => {
    const messages: ModelMessage[] = [];
    const turns: ITurnRun[] = [];

    for (const userText of scenario.turns) {
        // A draft still waiting for approval when the user writes again is resolved as denied,
        // as the chat route does when the user keeps typing past the card (convertToModelMessages
        // turns that into the approval response plus an execution-denied tool result): the model
        // sees it was superseded and folds the new message into a fresh draft.
        const pendingApprovals = messages.flatMap((message) =>
            message.role === 'assistant' && Array.isArray(message.content)
                ? message.content.filter(
                      (part) => part.type === 'tool-approval-request',
                  )
                : [],
        );
        const answeredApprovals = new Set(
            messages.flatMap((message) =>
                message.role === 'tool'
                    ? message.content.flatMap((part) =>
                          part.type === 'tool-approval-response'
                              ? [part.approvalId]
                              : [],
                      )
                    : [],
            ),
        );
        const dangling = pendingApprovals.filter(
            (request) => !answeredApprovals.has(request.approvalId),
        );
        if (dangling.length > 0) {
            const reason = 'Superseded by a newer user message.';
            messages.push({
                role: 'tool',
                content: dangling.flatMap((request) => [
                    {
                        type: 'tool-approval-response' as const,
                        approvalId: request.approvalId,
                        approved: false,
                        reason,
                    },
                    {
                        type: 'tool-result' as const,
                        toolCallId: request.toolCallId,
                        toolName: createTicketToolName,
                        output: { type: 'execution-denied' as const, reason },
                    },
                ]),
            });
        }
        messages.push({ role: 'user', content: userText });
        const { turn, responseMessages } = await runTurn(model, messages);
        turns.push(turn);
        messages.push(...responseMessages);
        if (turn.error != null) {
            break;
        }
    }

    const error = turns.find((turn) => turn.error != null)?.error;
    const failures =
        error == null
            ? scenario.check(turns, context)
            : [`error: ${truncate(error, 120)}`];

    return {
        model,
        scenario: scenario.id,
        run,
        failures,
        judgement: error == null ? await judge(scenario, turns) : undefined,
        turns,
    };
};

// Runs the tasks with at most `limit` in flight.
const pool = async <T>(
    tasks: Array<() => Promise<T>>,
    limit: number,
): Promise<T[]> => {
    const results: T[] = new Array(tasks.length);
    let next = 0;
    const worker = async () => {
        while (next < tasks.length) {
            const index = next++;
            results[index] = await tasks[index]();
        }
    };
    await Promise.all(
        Array.from({ length: Math.min(limit, tasks.length) }, worker),
    );

    return results;
};

interface IModelPricing {
    input: number;
    output: number;
}

const loadPricing = async (): Promise<Map<string, IModelPricing>> => {
    try {
        const response = await fetch('https://ai-gateway.vercel.sh/v1/models');
        const { data } = (await response.json()) as {
            data: Array<{
                id: string;
                pricing?: { input?: string; output?: string };
            }>;
        };

        return new Map(
            data.map((model) => [
                model.id,
                {
                    input: Number(model.pricing?.input ?? 0),
                    output: Number(model.pricing?.output ?? 0),
                },
            ]),
        );
    } catch {
        return new Map();
    }
};

const selected = evalScenarios.filter(
    (scenario) =>
        scenario.modes.includes(mode) &&
        (values.only == null || values.only.split(',').includes(scenario.id)),
);

process.stderr.write(
    `mode=${mode}${docsSearch ? ` index=${docsSearch.meta.mode}` : ''} scenarios=${selected.length} runs=${runs} reasoning=${models.map((model) => reasoningFor(model)).join(',')} judge=${judgeModel ?? 'none'}\n`,
);

const [pricing, results] = await Promise.all([
    loadPricing(),
    Promise.all(
        models.map(async (model) => {
            const tasks = selected.flatMap((scenario) =>
                Array.from(
                    { length: runs },
                    (_, run) => () => runScenario(model, scenario, run),
                ),
            );
            const modelResults = await pool(tasks, concurrency);
            process.stderr.write(`done ${model}\n`);

            return modelResults;
        }),
    ),
]);

const all = results.flat();

const median = (numbers: number[]) => {
    const sorted = [...numbers].sort((a, b) => a - b);

    return sorted[Math.floor(sorted.length / 2)] ?? 0;
};
const percentile = (numbers: number[], share: number) => {
    const sorted = [...numbers].sort((a, b) => a - b);

    return (
        sorted[
            Math.min(sorted.length - 1, Math.floor(sorted.length * share))
        ] ?? 0
    );
};
const mean = (numbers: number[]) =>
    numbers.length === 0
        ? 0
        : numbers.reduce((sum, value) => sum + value, 0) / numbers.length;

const lines: string[] = [];
lines.push(
    '| Model | Checks passed | Accuracy | Helpfulness | Communication | Graded ≥ 4 | Median s | p90 s | Cost / conversation |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
);
for (const model of models) {
    const rows = all.filter((row) => row.model === model);
    const passed = rows.filter((row) => row.failures.length === 0).length;
    const graded = rows.flatMap((row) =>
        row.judgement == null ? [] : [row.judgement],
    );
    const good = graded.filter(
        (grade) =>
            Math.min(grade.accuracy, grade.helpfulness, grade.communication) >=
            4,
    ).length;
    const seconds = rows.flatMap((row) =>
        row.turns.map((turn) => turn.ms / 1000),
    );
    const price = pricing.get(model);
    const cost = mean(
        rows.map((row) =>
            row.turns.reduce(
                (sum, turn) =>
                    sum +
                    turn.inputTokens * (price?.input ?? 0) +
                    turn.outputTokens * (price?.output ?? 0),
                0,
            ),
        ),
    );
    // Grade columns stay empty when nothing was graded (--judge none, or every call failed).
    const meanGrade = (dimension: keyof Omit<IJudgement, 'verdict'>) =>
        graded.length === 0
            ? '-'
            : mean(graded.map((grade) => grade[dimension])).toFixed(2);
    lines.push(
        `| ${model} | ${passed}/${rows.length} | ${meanGrade('accuracy')} | ${meanGrade('helpfulness')} | ${meanGrade('communication')} | ${graded.length === 0 ? '-' : `${good}/${graded.length}`} | ${median(seconds).toFixed(1)} | ${percentile(seconds, 0.9).toFixed(1)} | ${price == null ? '-' : `$${cost.toFixed(4)}`} |`,
    );
}

lines.push('', 'Failures and low grades:');
for (const row of all) {
    const low =
        row.judgement != null &&
        Math.min(
            row.judgement.accuracy,
            row.judgement.helpfulness,
            row.judgement.communication,
        ) < 4;
    if (row.failures.length === 0 && !low) {
        continue;
    }
    const grade =
        row.judgement == null
            ? ''
            : ` [${row.judgement.accuracy}/${row.judgement.helpfulness}/${row.judgement.communication}: ${row.judgement.verdict}]`;
    const reply = row.turns.map((turn) => turn.text).join(' ⏎⏎ ');
    lines.push(
        `- ${row.model} · ${row.scenario}#${row.run}: ${row.failures.join('; ') || 'checks ok'}${grade}`,
        `    ${truncate(reply.replace(/\s+/g, ' '), 260)}`,
    );
}

process.stdout.write(`${lines.join('\n')}\n`);

if (values.json != null) {
    writeFileSync(values.json, JSON.stringify(all, null, 1));
}
