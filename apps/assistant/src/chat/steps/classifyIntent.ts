import {
    type IChatMessage,
    type ISupportIntent,
    supportIntentSchema,
} from '@aragon/assistant-contracts';
import {
    generateText,
    type LanguageModel,
    type LanguageModelUsage,
    Output,
} from 'ai';
import { z } from 'zod';
import { observability } from '../../lib/observability';
import { getChatProviderOptions, intakeStepTimeoutMs } from '../models';
import { buildClassifyIntentSystemPrompt } from '../prompts/classifyIntent';
import { renderTranscript } from '../transcript';

const classificationSchema = z.object({ intent: supportIntentSchema });

/**
 * Classifies the support intent of the conversation via a structured model call. Returns the
 * detected intent together with the token usage of the call; the caller owns all session-state
 * bookkeeping (steps never touch the session store).
 */
export const classifyIntent = async (params: {
    model: LanguageModel;
    sessionId: string;
    messages: IChatMessage[];
}): Promise<{ intent: ISupportIntent; usage: LanguageModelUsage }> => {
    const { model, sessionId, messages } = params;
    const startTime = Date.now();

    const {
        output: object,
        usage,
        finalStep,
    } = await generateText({
        model,
        providerOptions: getChatProviderOptions(),
        abortSignal: AbortSignal.timeout(intakeStepTimeoutMs),
        output: Output.object({ schema: classificationSchema }),
        system: buildClassifyIntentSystemPrompt(),
        prompt: renderTranscript(messages),
    });

    observability.logStep({
        sessionId,
        step: 'classifyIntent',
        // The model that actually answered: under a Gateway fallback this differs from the
        // requested model, which keeps primary-model degradation visible in the logs.
        model: finalStep.response.modelId,
        latencyMs: Date.now() - startTime,
        tokensIn: usage.inputTokens,
        tokensOut: usage.outputTokens,
        finishReason: finalStep.finishReason,
    });

    return { intent: object.intent, usage };
};
