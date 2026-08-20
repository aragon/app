import 'server-only';
import type {
    IMpcPolicyCatalog,
    IMpcPolicyCheckResult,
    IMpcPolicyExample,
    IMpcPolicyFlow,
    IMpcPolicySimContext,
    IMpcPolicySimResult,
} from '@/modules/mpc/api/mpcService/domain';
import { MpcApiError } from './mpcApiError';

/**
 * Client of the policy engine (the `mpc-poc` backend: Fastify API serving the block catalog, the formal check
 * (Rust analyzer + cvc5) and the evaluation of a flow against one transaction). The app never reads the catalog
 * from disk nor embeds the evaluator: every policy capability goes through this HTTP client, server-side only.
 *
 * Env: MPC_POLICY_ENGINE_URL (default http://localhost:3311).
 */

export const MPC_POLICY_ENGINE_DEFAULT_URL = 'http://localhost:3311';

const DEFAULT_TIMEOUT_MS = 15_000;
// The formal check shells out to an SMT solver: give it more room (the engine itself times out at 60 s).
const CHECK_TIMEOUT_MS = 70_000;
const CATALOG_CACHE_TTL_MS = 60_000;

export interface IMpcPolicyEngineErrorPayload {
    error?: string;
    code?: string;
    detail?: string;
    blocks?: string[];
}

export interface IMpcPolicyEngineHealth {
    ok: boolean;
    checker: 'available' | 'missing';
}

interface IEngineExampleInfo {
    index: number;
    name: IMpcPolicyExample['name'];
    available: boolean;
    missingBlocks: string[];
}

export const getMpcPolicyEngineUrl = (): string => {
    const value = process.env.MPC_POLICY_ENGINE_URL?.trim();

    return (
        value != null && value.length > 0
            ? value
            : MPC_POLICY_ENGINE_DEFAULT_URL
    ).replace(/\/+$/, '');
};

/**
 * Maps an engine error response to an MpcApiError. Validation-like engine errors (invalid flow, disabled blocks,
 * invalid context) are surfaced as 400 validation errors with the engine message; anything else is a 502
 * policy_engine_error.
 */
const toEngineError = (
    status: number,
    payload: IMpcPolicyEngineErrorPayload | undefined,
): MpcApiError => {
    const code = payload?.code;
    const message = payload?.error ?? payload?.detail ?? `HTTP ${status}`;

    if (
        code === 'invalid_flow' ||
        code === 'invalid_context' ||
        code === 'evaluation_failed'
    ) {
        return new MpcApiError('validation_error', `Policy engine: ${message}`);
    }

    if (code === 'disabled_blocks') {
        const blocks = payload?.blocks?.join(', ') ?? '';

        return new MpcApiError(
            'validation_error',
            `The policy uses blocks disabled on the policy engine: ${blocks}.`,
            422,
        );
    }

    return new MpcApiError(
        'policy_engine_error',
        `Policy engine error (${code ?? status}): ${message}`,
    );
};

class MpcPolicyEngine {
    private catalogCache?: { at: number; value: IMpcPolicyCatalog };
    private examplesCache?: { at: number; value: IMpcPolicyExample[] };

    health = async (): Promise<IMpcPolicyEngineHealth> => {
        try {
            return await this.request<IMpcPolicyEngineHealth>('/api/health');
        } catch {
            return { ok: false, checker: 'missing' };
        }
    };

    /**
     * Effective catalog (disabled blocks excluded), cached briefly: the engine reads it at startup only.
     */
    getCatalog = async (): Promise<IMpcPolicyCatalog> => {
        const now = Date.now();

        if (
            this.catalogCache != null &&
            now - this.catalogCache.at < CATALOG_CACHE_TTL_MS
        ) {
            return this.catalogCache.value;
        }

        const value = await this.request<IMpcPolicyCatalog>('/api/catalog');
        this.catalogCache = { at: now, value };

        return value;
    };

    /**
     * Example flows shipped with the engine (the flow is fetched only for loadable examples).
     */
    getExamples = async (): Promise<IMpcPolicyExample[]> => {
        const now = Date.now();

        if (
            this.examplesCache != null &&
            now - this.examplesCache.at < CATALOG_CACHE_TTL_MS
        ) {
            return this.examplesCache.value;
        }

        const infos = await this.request<IEngineExampleInfo[]>('/api/examples');
        const value = await Promise.all(
            infos.map(async (info) => ({
                ...info,
                flow: info.available
                    ? await this.request<IMpcPolicyFlow>(
                          `/api/examples/${info.index.toString()}`,
                      )
                    : null,
            })),
        );
        this.examplesCache = { at: now, value };

        return value;
    };

    /**
     * Formal check of a flow: no dead branches, no collisions, no gaps (with counterexamples).
     */
    check = (flow: IMpcPolicyFlow): Promise<IMpcPolicyCheckResult> =>
        this.request<IMpcPolicyCheckResult>('/api/check', {
            method: 'POST',
            body: { flow },
            timeoutMs: CHECK_TIMEOUT_MS,
        });

    /**
     * Evaluates a flow against one materialized transaction context (same evaluator as the editor preview).
     */
    evaluate = (
        flow: IMpcPolicyFlow,
        context: IMpcPolicySimContext,
    ): Promise<IMpcPolicySimResult> =>
        this.request<IMpcPolicySimResult>('/api/evaluate', {
            method: 'POST',
            body: { flow, context },
        });

    /**
     * Drops the caches (tests).
     */
    resetCache = (): void => {
        this.catalogCache = undefined;
        this.examplesCache = undefined;
    };

    private request = async <TData>(
        path: string,
        options: {
            method?: 'GET' | 'POST';
            body?: unknown;
            timeoutMs?: number;
        } = {},
    ): Promise<TData> => {
        const url = `${getMpcPolicyEngineUrl()}${path}`;
        const controller = new AbortController();
        const timeout = setTimeout(
            () => controller.abort(),
            options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        );

        let response: Response;

        try {
            response = await fetch(url, {
                method: options.method ?? 'GET',
                headers: {
                    accept: 'application/json',
                    ...(options.body != null
                        ? { 'content-type': 'application/json' }
                        : {}),
                },
                body:
                    options.body != null
                        ? JSON.stringify(options.body)
                        : undefined,
                cache: 'no-store',
                signal: controller.signal,
            });
        } catch (error) {
            const detail =
                error instanceof Error ? error.message : String(error);

            throw new MpcApiError(
                'policy_engine_error',
                `The policy engine at ${getMpcPolicyEngineUrl()} is not reachable (${detail}). Start it with: cd mpc-poc/backend && pnpm dev`,
                503,
            );
        } finally {
            clearTimeout(timeout);
        }

        let payload: unknown;

        try {
            payload = await response.json();
        } catch {
            payload = undefined;
        }

        if (!response.ok) {
            throw toEngineError(
                response.status,
                payload as IMpcPolicyEngineErrorPayload | undefined,
            );
        }

        return payload as TData;
    };
}

export const mpcPolicyEngine = new MpcPolicyEngine();
