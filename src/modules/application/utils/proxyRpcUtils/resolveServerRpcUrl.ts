import type { Network } from '@/shared/api/daoService';
import {
    networkDefinitions,
    RpcProvider,
} from '@/shared/constants/networkDefinitions';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';

const RPC_PROVIDER_ENV_VARS: Record<RpcProvider, string> = {
    [RpcProvider.ALCHEMY]: 'NEXT_SECRET_RPC_KEY',
    [RpcProvider.ANKR]: 'NEXT_SECRET_ANKR_RPC_KEY',
    [RpcProvider.DRPC]: 'NEXT_SECRET_DRPC_RPC_KEY',
    [RpcProvider.PEAQ]: 'NEXT_SECRET_PEAQ_QUICKNODE_RPC_KEY',
};

/**
 * Resolves the upstream RPC URL for a given network. The returned URL embeds the provider API
 * key (`process.env.NEXT_SECRET_*`) as a path segment — it is a secret and must never be sent
 * to the client. Callers MUST gate invocation behind `process.env.NEXT_RUNTIME` (build-time-
 * folded by Next.js) so the bundler tree-shakes this module out of the client chunk; we don't
 * apply `'server-only'` because Turbopack's import tracer follows the dynamic-import path used
 * by the dispatcher and would falsely report a client-side import.
 *
 * Resolution order:
 * 1. Local-dev override `NEXT_SECRET_RPC_OVERRIDE_<chainId>` (e.g. Anvil fork).
 * 2. Private RPC config (Alchemy / Ankr / DRPC / Peaq) with the matching key from env.
 * 3. Public RPC URL from the viem chain definition, as a fallback when the provider key is missing.
 *
 * Returns `undefined` only when no usable URL is configured.
 */
export const resolveServerRpcUrl = (network: Network): string | undefined => {
    const definition = networkDefinitions[network];
    const chainId = String(definition.id);

    const override = process.env[`NEXT_SECRET_RPC_OVERRIDE_${chainId}`];
    if (override) {
        return override;
    }

    const { privateRpcConfig, rpcUrls } = definition;

    if (!privateRpcConfig) {
        return rpcUrls.default.http[0];
    }

    const envVar = RPC_PROVIDER_ENV_VARS[privateRpcConfig.rpcProvider];
    const rpcKey = process.env[envVar];

    if (!rpcKey) {
        monitoringUtils.logError(
            new Error(
                `RPC key not found for provider ${privateRpcConfig.rpcProvider}`,
            ),
            {
                context: {
                    chainId,
                    network,
                    rpcProvider: privateRpcConfig.rpcProvider,
                    fallbackToPublicRpc: true,
                },
            },
        );

        return rpcUrls.default.http[0];
    }

    return `${privateRpcConfig.rpcUrl}${rpcKey}`;
};

/**
 * Server-only: validates that every RPC provider key in `RPC_PROVIDER_ENV_VARS` is present in the
 * environment. Throws when any are missing, except in CI where the check is skipped so that
 * unit/integration tests can run without the real secrets. Used by `proxyRpcUtils` to fail fast at
 * server boot in misconfigured deployments.
 */
export const assertServerRpcConfig = (): void => {
    if (process.env.CI === 'true') {
        return;
    }

    const missingKeys = (
        Object.entries(RPC_PROVIDER_ENV_VARS) as [RpcProvider, string][]
    )
        .filter(([, envVar]) => !process.env[envVar])
        .map(([provider]) => provider);

    if (missingKeys.length === 0) {
        return;
    }

    const missingEnvVars = missingKeys
        .map((provider) => RPC_PROVIDER_ENV_VARS[provider])
        .join(', ');

    throw new Error(
        `Missing RPC keys for providers: ${missingKeys.join(', ')}. Required env vars: ${missingEnvVars}`,
    );
};
