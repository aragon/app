import {
    type IAssistantError,
    type IProposalAnalysisResponse,
    proposalAnalysisContractVersion,
    proposalAnalysisRequestSchema,
} from '@aragon/assistant-contracts';
import { Hono } from 'hono';
import { generateReport } from '../analysis/generateReport';
import { analysisPromptVersion } from '../analysis/models';
import type { IAppDependencies } from '../lib/appDependencies';
import { env } from '../lib/env';
import { observability } from '../lib/observability';

// Server-to-server endpoint called by the Aragon backend: the backend builds the fact pack and
// runs the rule detectors, this route turns them into the written report. Authenticated by a
// shared bearer secret (like /internal), deliberately outside the per-IP rate limit, which
// protects the browser-facing routes and would only throttle our own backend here.
export const buildAnalysisRoute = (deps: IAppDependencies) => {
    const app = new Hono();

    app.use('*', async (context, next) => {
        const secret = env.analysisApiSecret();
        const authorization = context.req.header('authorization');

        if (secret == null || authorization !== `Bearer ${secret}`) {
            const body: IAssistantError = {
                error: { code: 'unauthorized', message: 'Unauthorized.' },
            };

            return context.json(body, 401);
        }

        await next();
    });

    app.post('/proposal', async (context) => {
        const rawBody: unknown = await context.req.json().catch(() => null);
        const receivedVersion = (
            rawBody as { contractVersion?: unknown } | null
        )?.contractVersion;

        // Checked before the full validation so a backend deployed against another contract
        // version gets a message that names the problem instead of a schema-error dump.
        if (receivedVersion !== proposalAnalysisContractVersion) {
            const body: IAssistantError = {
                error: {
                    code: 'contract_version_mismatch',
                    message: `This deployment speaks proposal-analysis contract version ${String(proposalAnalysisContractVersion)}.`,
                    details: {
                        expected: proposalAnalysisContractVersion,
                        received: receivedVersion ?? null,
                    },
                },
            };

            return context.json(body, 400);
        }

        const parsed = proposalAnalysisRequestSchema.safeParse(rawBody);

        if (!parsed.success) {
            const body: IAssistantError = {
                error: {
                    code: 'validation',
                    message: 'Invalid proposal-analysis request.',
                    // Paths only: the issues never echo the (author-written) values back.
                    details: {
                        issues: parsed.error.issues.map((issue) => ({
                            path: issue.path.join('.'),
                            code: issue.code,
                        })),
                    },
                },
            };

            return context.json(body, 400);
        }

        const request = parsed.data;
        const proposalId = request.factPack.proposal.id;
        const startTime = Date.now();

        try {
            const generated = await generateReport({
                model: deps.getAnalysisModel(),
                request,
            });

            observability.logStep({
                sessionId: proposalId,
                step: 'analyzeProposal',
                model: generated.model,
                latencyMs: Date.now() - startTime,
                tokensIn: generated.tokensIn,
                tokensOut: generated.tokensOut,
                finishReason: generated.finishReason,
                severity: generated.report.severity,
                verdict: generated.report.intentMismatch.verdict,
            });

            const body: IProposalAnalysisResponse = {
                contractVersion: proposalAnalysisContractVersion,
                report: generated.report,
                rulesSeverity: generated.rulesSeverity,
                model: generated.model,
                promptVersion: analysisPromptVersion,
            };

            return context.json(body, 200);
        } catch (error) {
            observability.logError(error, {
                sessionId: proposalId,
                step: 'analyzeProposal',
            });

            const body: IAssistantError = {
                error: {
                    code: 'internal',
                    message: 'The report could not be generated.',
                },
            };

            return context.json(body, 502);
        }
    });

    return app;
};
