import type { UIMessageChunk } from 'ai';

export interface IDocsNarrationFilterParams {
    /**
     * Names of the tools whose call makes the text part written right before it narration.
     */
    toolNames: ReadonlySet<string>;
}

// Narration is a sentence ("Let me look that up for you"). A text part that grows past this is an
// answer in progress and is released to stream on as it arrives.
export const narrationMaxChars = 240;

/**
 * Drops the sentence a model writes before calling a documentation tool.
 *
 * The prompt asks for the documentation tools to be called silently, and the model mostly obeys —
 * but not always: in the sweeps one turn in three still opened with "Let me look into the
 * documentation" or "Let me read the full guide", text that is never the answer (the answer needs
 * the results) and that the widget would show as a stray line above it. Text written right before
 * a documentation tool call is, by construction, exactly that, so it is dropped here rather than
 * hoped away: a short text part is held back until a documentation tool call follows (drop) or
 * anything else does (release). Providers differ in when they close the text part — some before
 * the tool call, some only at the end of the step — so the call is recognized whether the held
 * part has ended or is still open, and the closing chunk of a dropped part is dropped with it. A
 * text part before a createLinearTicket call is released — the prompt requires that sentence —
 * and so is any text longer than a sentence, immediately, so an actual reply streams as it always
 * did.
 */
export const buildDocsNarrationFilter = (
    params: IDocsNarrationFilterParams,
): TransformStream<UIMessageChunk, UIMessageChunk> => {
    const { toolNames } = params;

    let held: UIMessageChunk[] = [];
    let heldId: string | undefined;
    let heldChars = 0;
    let heldEnded = false;
    // Text part ids dropped as narration: their late deltas and closing chunk go too.
    const droppedIds = new Set<string>();

    const reset = () => {
        held = [];
        heldId = undefined;
        heldChars = 0;
        heldEnded = false;
    };

    const release = (
        controller: TransformStreamDefaultController<UIMessageChunk>,
    ) => {
        for (const chunk of held) {
            controller.enqueue(chunk);
        }
        reset();
    };

    const isDocsToolCall = (chunk: UIMessageChunk): boolean =>
        chunk.type === 'tool-input-start' && toolNames.has(chunk.toolName);

    const belongsToDroppedPart = (chunk: UIMessageChunk): boolean =>
        (chunk.type === 'text-delta' || chunk.type === 'text-end') &&
        droppedIds.has(chunk.id);

    return new TransformStream({
        transform: (chunk, controller) => {
            if (belongsToDroppedPart(chunk)) {
                return;
            }

            if (heldId == null) {
                if (chunk.type === 'text-start') {
                    held = [chunk];
                    heldId = chunk.id;

                    return;
                }

                controller.enqueue(chunk);

                return;
            }

            if (isDocsToolCall(chunk)) {
                // The held sentence was leading into a documentation tool call: narration.
                droppedIds.add(heldId);
                reset();
                controller.enqueue(chunk);

                return;
            }

            if (heldEnded) {
                // The chunk after the held text part decides its fate — not a docs call: release.
                release(controller);
                controller.enqueue(chunk);

                return;
            }

            if (chunk.type === 'text-delta' && chunk.id === heldId) {
                held.push(chunk);
                heldChars += chunk.delta.length;

                if (heldChars > narrationMaxChars) {
                    release(controller);
                }

                return;
            }

            if (chunk.type === 'text-end' && chunk.id === heldId) {
                held.push(chunk);
                heldEnded = true;

                return;
            }

            // Anything else while a short text part is open is not the pattern: let it all through.
            release(controller);
            controller.enqueue(chunk);
        },
        flush: (controller) => {
            release(controller);
        },
    });
};
