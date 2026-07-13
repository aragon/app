import {
    createIssueRequestSchema,
    type IAssistantError,
    type ICreateIssueResponse,
    type IPreviewIssueResponse,
    previewIssueRequestSchema,
} from '@aragon/assistant-contracts';
import { type Context, Hono } from 'hono';
import { classifyIntent } from '../chat/steps/classifyIntent';
import { extractFields, getMissingFields } from '../chat/steps/extractFields';
import { validateFile } from '../files/validateFile';
import type { IAppDependencies } from '../lib/appDependencies';
import { observability } from '../lib/observability';
import type { ISessionFile } from '../lib/sessionStore';
import {
    buildIssueDescription,
    buildIssueTitle,
    type IIssueAttachment,
    issueLabelByIntent,
} from '../linear/issueBody';

// Files reach Linear only now, at creation time: until this moment they live in blob storage and
// can be freely added and removed. Each queued blob is downloaded, re-validated (defense in
// depth — the authoritative check ran at confirm time) and uploaded to Linear; a file failing
// validation is dropped, a transfer failure aborts creation (the claim is released, retry works).
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

// Intake model-step failures (upstream hangs hitting the step timeout, residual malformed
// output) are operational events, not exceptions: they must answer with the shared retryable
// error shape. An unhandled 500 would bypass the CORS middleware (it already threw upward), so
// the widget would see an unreadable network failure instead of "please retry".
const buildIntakeFailureResponse = (
    context: Context,
    sessionId: string,
    error: unknown,
) => {
    observability.logError(error, { sessionId, step: 'previewIssue' });

    const body: IAssistantError = {
        error: {
            code: 'internal',
            message: 'Preparing the ticket preview failed, please retry.',
        },
    };

    return context.json(body, 502);
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

export const buildIssuesRoute = (deps: IAppDependencies) =>
    new Hono()
        // The single extraction point of the pipeline: distills the full transcript into the
        // ticket fields, stores them as the session's snapshot and returns what the user reviews.
        // POST / then creates strictly from that snapshot, so the reviewed preview and the
        // created ticket can never disagree.
        .post('/preview', async (context) => {
            const body = await context.req.json().catch(() => null);
            const parsed = previewIssueRequestSchema.safeParse(body);

            if (!parsed.success) {
                const error: IAssistantError = {
                    error: {
                        code: 'validation',
                        message: 'Invalid preview request.',
                    },
                };

                return context.json(error, 400);
            }

            const { sessionId, messages } = parsed.data;
            const sessionStore = deps.getSessionStore();

            // One ticket = one chat: a completed session has nothing left to preview.
            const existingIssue = await sessionStore.getIssue(sessionId);
            if (existingIssue?.status === 'created') {
                const error: IAssistantError = {
                    error: {
                        code: 'issue_already_created',
                        message: 'The session already created its ticket.',
                    },
                };

                return context.json(error, 409);
            }

            const startTime = Date.now();
            const model = deps.getChatModel('intake');

            let classification: Awaited<ReturnType<typeof classifyIntent>>;
            try {
                classification = await classifyIntent({
                    model,
                    sessionId,
                    messages,
                });
            } catch (error) {
                return buildIntakeFailureResponse(context, sessionId, error);
            }
            const { intent, usage: classifyUsage } = classification;

            // An off-topic conversation has nothing to extract — refuse cheaply.
            if (intent === 'off_topic') {
                await sessionStore.addTokens(
                    sessionId,
                    classifyUsage.totalTokens ?? 0,
                );
                observability.logStep({
                    sessionId,
                    step: 'previewIssue',
                    latencyMs: Date.now() - startTime,
                    refusalReason: 'off_topic',
                });
                const response: IPreviewIssueResponse = { status: 'unclear' };

                return context.json(response, 200);
            }

            let extraction: Awaited<ReturnType<typeof extractFields>>;
            try {
                extraction = await extractFields({
                    model,
                    sessionId,
                    messages,
                    intent,
                });
            } catch (error) {
                return buildIntakeFailureResponse(context, sessionId, error);
            }
            const { fields, usage: extractUsage } = extraction;
            // Previews are user-triggered model spend and count against the session token
            // budget like every other intake call.
            await sessionStore.addTokens(
                sessionId,
                (classifyUsage.totalTokens ?? 0) +
                    (extractUsage.totalTokens ?? 0),
            );

            const missingFields = getMissingFields(fields);
            const { summary } = fields;

            if (missingFields.length > 0 || summary == null) {
                observability.logStep({
                    sessionId,
                    step: 'previewIssue',
                    latencyMs: Date.now() - startTime,
                    refusalReason: 'missing_required_fields',
                    missingFields,
                });
                const response: IPreviewIssueResponse = { status: 'unclear' };

                return context.json(response, 200);
            }

            await sessionStore.storeCollectedFields(sessionId, fields);
            observability.logStep({
                sessionId,
                step: 'previewIssue',
                latencyMs: Date.now() - startTime,
            });
            const response: IPreviewIssueResponse = {
                status: 'ready',
                summary,
                intent: fields.intent,
            };

            return context.json(response, 200);
        })
        .post('/', async (context) => {
            const body = await context.req.json().catch(() => null);
            const parsed = createIssueRequestSchema.safeParse(body);

            if (!parsed.success) {
                const error: IAssistantError = {
                    error: {
                        code: 'validation',
                        message: 'Invalid issue request.',
                    },
                };

                return context.json(error, 400);
            }

            const { sessionId, messages, appContext } = parsed.data;
            const sessionStore = deps.getSessionStore();

            // Idempotent retry fast path: the session already created its issue.
            const existingIssue = await sessionStore.getIssue(sessionId);
            if (existingIssue?.status === 'created') {
                const response: ICreateIssueResponse = {
                    issueId: existingIssue.issueId,
                    identifier: existingIssue.identifier,
                    url: existingIssue.url,
                    alreadyExisted: true,
                };

                return context.json(response, 200);
            }

            // No model call sits on the creation path: the ticket fields come strictly from the
            // snapshot the preview stored — what the user reviewed is what gets created.
            const fields = await sessionStore.getCollectedFields(sessionId);

            if (fields == null) {
                const error: IAssistantError = {
                    error: {
                        code: 'preview_required',
                        message: 'Prepare a ticket preview before sending it.',
                    },
                };

                return context.json(error, 422);
            }

            // Atomic claim BEFORE the Linear call: concurrent submits get exactly one issue.
            const claimed = await sessionStore.claimIssue(sessionId);
            if (!claimed) {
                const issue = await sessionStore.getIssue(sessionId);

                if (issue?.status === 'created') {
                    const response: ICreateIssueResponse = {
                        issueId: issue.issueId,
                        identifier: issue.identifier,
                        url: issue.url,
                        alreadyExisted: true,
                    };

                    return context.json(response, 200);
                }

                const error: IAssistantError = {
                    error: {
                        code: 'issue_in_progress',
                        message: 'The issue is already being created.',
                    },
                };

                return context.json(error, 409);
            }

            const startTime = Date.now();
            try {
                const files = await sessionStore.listFiles(sessionId);
                const attachments = await transferFilesToLinear(
                    deps,
                    sessionId,
                    files,
                );
                const issue = await deps.getLinear().createIssue({
                    title: buildIssueTitle(fields),
                    description: buildIssueDescription({
                        sessionId,
                        fields,
                        appContext,
                        messages,
                        files: attachments,
                    }),
                    labelName: issueLabelByIntent[fields.intent] ?? 'bug',
                });

                await sessionStore.storeIssue(sessionId, issue);
                await cleanupSessionFiles(deps, sessionId, files);
                observability.logStep({
                    sessionId,
                    step: 'createIssue',
                    latencyMs: Date.now() - startTime,
                    issueId: issue.issueId,
                });

                const response: ICreateIssueResponse = {
                    ...issue,
                    alreadyExisted: false,
                };

                return context.json(response, 201);
            } catch (error) {
                // Release the claim so a retry with the same session can succeed.
                await sessionStore.releaseIssueClaim(sessionId);
                observability.logError(error, {
                    sessionId,
                    step: 'createIssue',
                });

                const response: IAssistantError = {
                    error: {
                        code: 'internal',
                        message: 'Issue creation failed, please retry.',
                    },
                };

                return context.json(response, 502);
            }
        });
