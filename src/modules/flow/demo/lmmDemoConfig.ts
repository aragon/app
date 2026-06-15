// LMM_DEMO_HACK: demo-mode flags + manifest *type/URL* config for the Lido
// Money Machine demo.  This module must stay free of React imports — it's
// reached from the server-component graph via `lmmDaoOverride.ts → useDao.ts`,
// and Next 16 / Turbopack rejects RSC modules that pull in useEffect/useState.
// The React hooks that consume this config live in `./useLmmManifest`.
//
// See `docs/lido-mmd-production-readiness.md` for the removal checklist.

import type { Address } from 'viem';

/** `1` when the build should expose the LMM demo affordances. */
export const LMM_DEMO_MODE: boolean =
    process.env.NEXT_PUBLIC_LMM_DEMO_MODE === '1' ||
    process.env.NEXT_PUBLIC_LMM_DEMO_MODE === 'true';

// LMM_DEMO_HACK: refuse to start a production build with demo mode on.
// `NEXT_PUBLIC_ENV=production` only ships from the Production scope of the
// Vercel project; if someone copies the preview env vars by mistake we'd
// rather hard-fail the build than render a demo banner over a real DAO.
if (LMM_DEMO_MODE && process.env.NEXT_PUBLIC_ENV === 'production') {
    throw new Error(
        '[lmm-demo] refusing to evaluate with NEXT_PUBLIC_LMM_DEMO_MODE=1 ' +
            'on a NEXT_PUBLIC_ENV=production build. Unset the demo flag in ' +
            'the production Vercel scope (it should only live on Preview).',
    );
}

/**
 * URL the front-end fetches at boot to discover the demo DAO's addresses.
 * Produced by `just demo-up` in dao-launchpad@f/lido-demo and served by the
 * VM's host nginx (fronted by Cloudflare) at `https://<host>/manifest.json` —
 * see `infra/lmm-demo/vm/nginx.lmm-demo.conf`.  For local-first dev we
 * default to the dev server's `/lmm-manifest.json` (a symlink to
 * `dao-launchpad/lido/preview/script/demo/manifest.json`).
 */
export const LMM_MANIFEST_URL: string =
    process.env.NEXT_PUBLIC_LMM_MANIFEST_URL ?? '/lmm-manifest.json';

/**
 * Envio Hasura endpoint used in demo mode.  In local-first dev:
 *   http://localhost:8080/v1/graphql
 * On the VM:
 *   https://<DOMAIN>/graphql
 */
export const LMM_FLOW_INDEXER_ENDPOINT: string =
    process.env.NEXT_PUBLIC_FLOW_INDEXER_ENDPOINT ??
    'http://localhost:8080/v1/graphql';

/**
 * Anvil RPC used by the demo's cheat-action menu (anvil_setBalance,
 * evm_increaseTime).  This must point at the same node Envio is indexing.
 */
export const LMM_RPC_URL: string =
    process.env.NEXT_PUBLIC_LMM_RPC_URL ?? 'http://localhost:8545';

/**
 * Whitelist of hosts we'll let viem talk to in demo mode.  Used by
 * `assertForkRpc()` in safety.ts to block accidental writes against
 * real chains.
 */
export const LMM_RPC_ALLOWLIST = [
    'localhost',
    '127.0.0.1',
    // Aragon demo VM (Cloudflare → host nginx → docker anvil).  See
    // infra/lmm-demo/vm/vm-README.md.  Add new hostnames here as new
    // demo VMs spin up; assertForkRpc() blocks anything not in this list.
    'tests.aragon.in',
];

// ---------------------------------------------------------------------------
// Manifest shape
// ---------------------------------------------------------------------------

/**
 * Real shape of `manifest.json` as emitted by `just demo-up` in
 * dao-launchpad@f/lido-demo.  Keep this aligned with `script/demo/demo.just`
 * — every key that the override layer or the cheats menu reads must show up
 * here (or under `[k: string]: unknown` for forward-compat duck-typing in
 * `deriveAddressesFromManifest`).
 */
export interface LmmManifest {
    /** Chain id the demo was deployed on (1 = anvil mainnet fork). */
    chainId: number;
    /** Anvil fork's HEAD block at deploy time.  Informational. */
    blockNumber?: number;
    /** Anvil fork's HEAD timestamp at deploy time.  Informational. */
    timestamp?: number;
    /** Anvil RPC URL the demo was deployed against.  Informational only —
     * the app reads its RPC from NEXT_PUBLIC_LMM_RPC_URL, not from here. */
    rpcUrl?: string;

    /** The Lido Money Machine DAO + its plugin surface. */
    lmm: {
        dao: Address;
        /** Top-level dispatcher plugin (multi-dispatch policy). */
        dispatcherPlugin: Address;
        /** Auxiliary primitives.  All optional — only the strategies need to
         * be present for the override layer to render a policy. */
        epochProvider?: Address;
        factory?: Address;
        gate?: Address;
        /** Embedded strategies.  Object with named keys (NOT an array); see
         * `getLmmStrategies()` below for the canonical ordered list. */
        strategies: {
            wrap: Address;
            uniV2: Address;
            cowSwap: Address;
        };
        budgets?: {
            ldo?: Address;
            stETH?: Address;
            wstEthStream?: Address;
        };
    };

    /** Lido + mainnet token addresses (real mainnet — readable on the fork). */
    lido?: {
        agent?: Address;
        ldo?: Address;
        stETH?: Address;
        uniV2Router?: Address;
        usdc?: Address;
        weth?: Address;
        wstETH?: Address;
    };

    /** Mock CowSwap settlement contract (deployed alongside the demo DAO). */
    cowSwap?: { mock?: boolean; settlement?: Address };
    /** Mock price oracle (used by GatedCowSwap's price-floor gate). */
    oracle?: { address?: Address; mock?: boolean; seededPairs?: string };
    /** Demo-only addresses + parameters used by the cheats menu. */
    demo?: {
        deployer?: Address;
        epochLengthSeconds?: number;
        floorEpochs?: number;
        initialOffsetEpochs?: number;
        initialStEthAmount?: string;
        stEthWhale?: Address;
    };
    /** Capital Router factory + plugin-repo deployment addresses. */
    cr?: {
        budgetFactory?: Address;
        dispatcherPluginRepo?: Address;
        dispatcherPluginSetup?: Address;
    };

    /**
     * Optional DAO metadata.  `just demo-up` does NOT emit this key today —
     * see `LMM_DEFAULT_METADATA` below for the fallback that the override
     * layer uses when it's absent.  Future demos can write `metadata` to
     * override the defaults without touching app code.
     */
    metadata?: {
        name?: string;
        description?: string;
        avatarUrl?: string;
        links?: Array<{ label: string; url: string }>;
    };
    /**
     * Fingerprint of the deployment.  Compared against the indexer's
     * Dao.address on load — mismatches signal a stale manifest or wrong
     * indexer endpoint.  See safety.ts → manifestFingerprintCheck().
     */
    fingerprint?: string;
}

/**
 * Canonical strategy order for the LMM demo dispatcher: `wrap → uniV2 → cowSwap`.
 * Mirrors the dispatch pipeline in the foundry deploy script — every consumer
 * that needs an ordered list of strategies should call this helper rather
 * than enumerating the `lmm.strategies` object directly (object property
 * iteration order is not guaranteed across runtimes).
 */
export const getLmmStrategies = (
    manifest: LmmManifest,
): Array<{
    address: Address;
    kind: 'WRAP' | 'UNIV2_LIQUIDITY' | 'GATED_COWSWAP';
    label: string;
}> => [
    {
        address: manifest.lmm.strategies.wrap,
        kind: 'WRAP',
        label: 'Wrap stETH → wstETH',
    },
    {
        address: manifest.lmm.strategies.uniV2,
        kind: 'UNIV2_LIQUIDITY',
        label: 'Provide wstETH/LDO liquidity',
    },
    {
        address: manifest.lmm.strategies.cowSwap,
        kind: 'GATED_COWSWAP',
        label: 'Buyback LDO via CowSwap',
    },
];

// ---------------------------------------------------------------------------
// Defaults for missing manifest.metadata.
//
// `just demo-up` (dao-launchpad@f/lido-demo) does not emit `metadata` today.
// We fill in human-friendly defaults so the override layer can still
// synthesise an IDao without crashing.  Production demos can override by
// writing the `metadata` block into the manifest themselves.
// ---------------------------------------------------------------------------

export const LMM_DEFAULT_METADATA = {
    name: 'Lido Money Machine',
    description:
        'Capital Router demo on a forked Ethereum mainnet (anvil).  Routes incoming stETH through a wrap → LP-provide → CowSwap buyback pipeline, with each leg metered by its own budget and price-floor gate.',
    avatarUrl: undefined as string | undefined,
    links: [] as Array<{ label: string; url: string }>,
} as const;

// ---------------------------------------------------------------------------
// React hooks + mutable client cache: see `./useLmmManifest`
// ---------------------------------------------------------------------------
