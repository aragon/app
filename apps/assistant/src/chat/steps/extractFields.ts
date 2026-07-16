import type {
    IChatMessage,
    ICollectedFields,
    IRequiredIssueField,
    ISupportIntent,
} from '@aragon/assistant-contracts';
import {
    generateText,
    type LanguageModel,
    type LanguageModelUsage,
    NoObjectGeneratedError,
    Output,
} from 'ai';
import { z } from 'zod';
import { observability } from '../../lib/observability';
import { getChatProviderOptions, intakeStepTimeoutMs } from '../models';
import { buildExtractFieldsSystemPrompt } from '../prompts/extractFields';
import { renderTranscript } from '../transcript';

// Strict structured outputs (see getChatProviderOptions) require every property to be present,
// with absence expressed as null. Optional fields are deliberately avoided: they let the model
// omit fields silently, which in practice produced empty extractions — required-but-nullable
// forces a conscious null per field. Nulls are normalized away below the parse.
const extractionSchema = z.object({
    email: z.string().nullable(),
    summary: z.string().nullable(),
    description: z.string().nullable(),
    stepsToReproduce: z.array(z.string()).nullable(),
});

// Blank strings carry no information; models occasionally emit "" instead of null.
const normalizeText = (value: string | null): string | undefined =>
    value?.trim() ? value : undefined;

// Numbering is presentation and is applied by the ticket renderer; models prepend it
// sporadically regardless of instructions, so it is stripped at the boundary.
const normalizeSteps = (value: string[] | null): string[] | undefined => {
    const steps = (value ?? [])
        .map((step) => step.replace(/^\s*\d+[.)]\s*/, '').trim())
        .filter((step) => step.length > 0);

    return steps.length === 0 ? undefined : steps;
};

/**
 * Extracts the structured ticket fields from the full conversation via a structured model call.
 * Returns the fields together with the token usage of the call; the caller owns all
 * session-state bookkeeping (steps never touch the session store).
 */
export const extractFields = async (params: {
    model: LanguageModel;
    sessionId: string;
    messages: IChatMessage[];
    intent: ISupportIntent;
}): Promise<{ fields: ICollectedFields; usage: LanguageModelUsage }> => {
    const { model, sessionId, messages, intent } = params;
    const startTime = Date.now();

    const attemptExtraction = () =>
        generateText({
            model,
            providerOptions: getChatProviderOptions(),
            abortSignal: AbortSignal.timeout(intakeStepTimeoutMs),
            output: Output.object({ schema: extractionSchema }),
            system: buildExtractFieldsSystemPrompt(intent),
            prompt: renderTranscript(messages),
        });

    // One retry on malformed output only: strict decoding makes it rare but not impossible
    // (gateway fallback models ignore the OpenAI strict option, and the primary occasionally
    // emits garbage tokens). Other failures — timeouts, upstream errors — stay fatal.
    let retriedTokens = 0;
    let result: Awaited<ReturnType<typeof attemptExtraction>>;
    try {
        result = await attemptExtraction();
    } catch (error) {
        if (!NoObjectGeneratedError.isInstance(error)) {
            throw error;
        }
        observability.logError(error, { sessionId, step: 'extractFields' });
        retriedTokens = error.usage?.totalTokens ?? 0;
        result = await attemptExtraction();
    }

    const { output, usage, finalStep } = result;

    observability.logStep({
        sessionId,
        step: 'extractFields',
        // The model that actually answered (differs from the requested one under a fallback).
        model: finalStep.response.modelId,
        latencyMs: Date.now() - startTime,
        tokensIn: usage.inputTokens,
        tokensOut: usage.outputTokens,
        finishReason: finalStep.finishReason,
    });

    // The failed attempt consumed budget too; report the combined spend to the caller.
    const totalUsage =
        retriedTokens === 0
            ? usage
            : {
                  ...usage,
                  totalTokens: (usage.totalTokens ?? 0) + retriedTokens,
              };

    return {
        fields: {
            intent,
            email: normalizeText(output.email),
            summary: normalizeText(output.summary),
            description: normalizeText(output.description),
            stepsToReproduce: normalizeSteps(output.stepsToReproduce),
        },
        usage: totalUsage,
    };
};

// Deterministic readiness gate of the preview — not model-judged. Email is deliberately not part
// of it: it is asked for softly and used when provided, but never blocks the ticket.
export const getMissingFields = (
    fields: ICollectedFields,
): IRequiredIssueField[] => {
    const missingFields: IRequiredIssueField[] = [];

    if (!fields.summary?.trim()) {
        missingFields.push('summary');
    }
    if (!fields.description?.trim()) {
        missingFields.push('description');
    }

    return missingFields;
};
