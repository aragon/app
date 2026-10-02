import type { UIMessageChunk } from 'ai';

export interface IDocsOutputFilterParams {
    /**
     * Names of the tools whose outputs stay on the server.
     */
    toolNames: ReadonlySet<string>;
}

/**
 * Withholds the outputs of the documentation tools from the response stream.
 *
 * The passages and pages a lookup returns are for the model: the widget labels its spinner from
 * the call alone and renders nothing for the tool, and the route drops the lookups from the
 * history of later turns. Sent as they are, they would hand every caller of the API the pages
 * of the knowledge base verbatim, drafts included. The output chunk still goes out, with a null
 * output, so the tool part reaches its terminal state: the approval resume the widget runs for
 * the ticket tool requires every tool call of the step to have completed. Null rather than
 * absent: the client validates every chunk against its schema, and a missing output fails it.
 */
export const buildDocsOutputFilter = (
    params: IDocsOutputFilterParams,
): TransformStream<UIMessageChunk, UIMessageChunk> => {
    const { toolNames } = params;

    const docsToolCallIds = new Set<string>();

    return new TransformStream({
        transform: (chunk, controller) => {
            if (
                (chunk.type === 'tool-input-start' ||
                    chunk.type === 'tool-input-available') &&
                toolNames.has(chunk.toolName)
            ) {
                docsToolCallIds.add(chunk.toolCallId);
            }

            if (
                chunk.type === 'tool-output-available' &&
                docsToolCallIds.has(chunk.toolCallId)
            ) {
                docsToolCallIds.delete(chunk.toolCallId);
                controller.enqueue({
                    type: 'tool-output-available',
                    toolCallId: chunk.toolCallId,
                    output: null,
                });

                return;
            }

            controller.enqueue(chunk);
        },
    });
};
