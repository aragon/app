import {
    assistantLimits,
    createTicketToolInputSchema,
    type IAppContext,
    type IChatMessage,
    type ICreateTicketToolInput,
    type ICreateTicketToolOutput,
} from '@aragon/assistant-contracts';
import { tool } from 'ai';
import { validateFile } from '../../files/validateFile';
import type { IAppDependencies } from '../../lib/appDependencies';
import { observability } from '../../lib/observability';
import type { ISessionFile } from '../../lib/sessionStore';
import {
    buildIssueDescription,
    buildIssueTitle,
    type IIssueAttachment,
    issueLabelByIntent,
} from '../../linear/issueBody';

// Files reach Linear only now, at creation time: until this moment they live in blob storage and
// can be freely added and removed. Each queued blob is downloaded, re-validated (defense in depth —
// the authoritative check ran at confirm time) and uploaded to Linear; a file failing validation is
// dropped, a transfer failure aborts creation (the claim is released, retry works).
const transferFilesToLinear = async (
    deps: IAppDependencies,
    sessionId: string,
    files: ISessionFile[],
): Promise<IIssueAttachment[]> => {
    const startTime = Date.now();
    const attachments: IIssueAttachment[] = [];

    for (const file of files) {
        const data = await deps.getBlobStore().fetchBytes(file.blobUrl);
        const validated = await validateFile(data, file.filename);

        if ('error' in validated) {
            observability.logError(
                new Error(
                    `Queued file failed re-validation: ${validated.error}`,
                ),
                { sessionId, step: 'transferFiles' },
            );
            continue;
        }

        const { assetUrl } = await deps.getLinear().uploadFile(validated);
        attachments.push({ filename: validated.filename, assetUrl });
    }

    observability.logStep({
        sessionId,
        step: 'transferFiles',
        latencyMs: Date.now() - startTime,
    });

    return attachments;
};

// Best effort: the ticket is already created, leftovers are swept by the cleanup cron.
const cleanupSessionFiles = async (
    deps: IAppDependencies,
    sessionId: string,
    files: ISessionFile[],
) => {
    try {
        await deps.getBlobStore().delete(files.map((file) => file.blobUrl));
        await deps.getSessionStore().clearFiles(sessionId);
    } catch (error) {
        observability.logError(error, { sessionId, step: 'cleanupBlobs' });
    }
};

export interface ICreateTicketContext {
    deps: IAppDependencies;
    sessionId: string;
    appContext: IAppContext;
    messages: IChatMessage[];
}

// Creates the Linear ticket for one approved tool call. Enforces the per-session cap, deduplicates
// a replayed call by tool call id, transfers the queued files and cleans them up. Throws on the cap
// and on failure (after releasing the claim so a retry works); the caller turns a throw into a
// tool-error part the model reports and the card renders as a retryable failure.
export const createSessionTicket = async (
    context: ICreateTicketContext,
    fields: ICreateTicketToolInput,
    toolCallId: string,
): Promise<ICreateTicketToolOutput> => {
    const { deps, sessionId, appContext, messages } = context;
    const sessionStore = deps.getSessionStore();

    // Deduplicate a replayed execution of the same tool call first: only the first claim wins; a
    // later one returns the ticket already created for it — without touching the slot counter, so
    // a replay keeps working even once the session is at its cap.
    const claimed = await sessionStore.claimTicket(sessionId, toolCallId);
    if (!claimed) {
        const existing = await sessionStore.getTicket(sessionId, toolCallId);
        if (existing != null) {
            return existing;
        }

        throw new Error('This ticket is already being created.');
    }

    // The cap is enforced on the atomic reservation result, not on a separate read: concurrent
    // creations of distinct tool calls each get a distinct count, so they cannot all pass while
    // the counter still reads below the limit. An over-cap reservation rolls itself back.
    const reserved = await sessionStore.reserveTicketSlot(sessionId);
    if (reserved > assistantLimits.maxIssuesPerSession) {
        await sessionStore.releaseTicketSlot(sessionId);
        await sessionStore.releaseTicketClaim(sessionId, toolCallId);

        throw new Error(
            'This conversation has reached its ticket limit. Please start a new conversation to file another.',
        );
    }

    const startTime = Date.now();
    try {
        const files = await sessionStore.listFiles(sessionId);
        const attachments = await transferFilesToLinear(deps, sessionId, files);
        const issue = await deps.getLinear().createIssue({
            title: buildIssueTitle(fields),
            description: buildIssueDescription({
                sessionId,
                fields,
                appContext,
                messages,
                files: attachments,
            }),
            labelName: issueLabelByIntent[fields.intent],
        });

        const ticket: ICreateTicketToolOutput = {
            identifier: issue.identifier,
            url: issue.url,
        };
        await sessionStore.storeTicket(sessionId, toolCallId, ticket);
        await cleanupSessionFiles(deps, sessionId, files);
        observability.logStep({
            sessionId,
            step: 'createTicket',
            latencyMs: Date.now() - startTime,
            issueId: issue.issueId,
            intent: fields.intent,
        });

        return ticket;
    } catch (error) {
        // Release the claim and the reserved slot so a retry of the same tool call can succeed.
        await sessionStore.releaseTicketClaim(sessionId, toolCallId);
        await sessionStore.releaseTicketSlot(sessionId);
        observability.logError(error, { sessionId, step: 'createTicket' });

        throw new Error('Creating the ticket failed. Please try again.');
    }
};

// The agent's ticket-filing tool, bound to one request's session and transcript. The model calls it
// with the assembled ticket fields; creation only runs after the user approves the draft (the route
// registers it under toolApproval).
export const buildCreateLinearTicketTool = (context: ICreateTicketContext) =>
    tool({
        description:
            'File the collected feedback, bug report or support request as a support ticket for the Aragon team. Requires the user to approve the draft.',
        inputSchema: createTicketToolInputSchema,
        execute: (fields, { toolCallId }) =>
            createSessionTicket(context, fields, toolCallId),
    });
