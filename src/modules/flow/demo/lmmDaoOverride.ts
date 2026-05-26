// LMM_DEMO_HACK: synthesises IDao / IDaoPolicy[] / IDaoPermission[] payloads
// for the Lido Money Machine demo DAO by combining the manifest with live
// data from the Envio indexer.  Production DAOs are not touched — every
// helper short-circuits to `undefined` so callers fall through to the
// standard `daoService` queries.
//
// Removal:
//   1. Drop the wrappers around `useDao*` queryFns.
//   2. Delete this file + lmmDemoConfig.ts.
//   3. Unset NEXT_PUBLIC_LMM_DEMO_MODE in Vercel.
//
// See docs/lido-mmd-production-readiness.md for the full checklist.

import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import {
    type IDao,
    type IDaoPermission,
    type IDaoPlugin,
    type IDaoPolicy,
    Network,
    PluginInterfaceType,
    PolicyInterfaceType,
    PolicyStrategyType,
} from '@/shared/api/daoService/domain';
import {
    getLmmStrategies,
    LMM_DEFAULT_METADATA,
    LMM_DEMO_MODE,
    LMM_FLOW_INDEXER_ENDPOINT,
    LMM_MANIFEST_URL,
    type LmmManifest,
} from './lmmDemoConfig';

// ---------------------------------------------------------------------------
// Manifest loader (mirrors lmmDemoConfig.fetchManifest but standalone — these
// override helpers run inside react-query's queryFn, outside React render).
// ---------------------------------------------------------------------------

let cachedManifest: LmmManifest | undefined;
let inflightManifest: Promise<LmmManifest> | undefined;

// LMM_DEMO_HACK: SSR + relative URL → read from public/ via fs (local dev,
// symlink works).  SSR + absolute URL → fetch (production VM exposes manifest
// at https://<DOMAIN>/manifest.json via nginx).  Browser → fetch always,
// regardless of relative/absolute.
//
// Without the fs branch Node.js fetch throws on relative URLs during SSR,
// the override silently fails and the page falls through to the Aragon
// backend → 404 → "DAO not found".
const fetchManifestRaw = async (): Promise<string> => {
    const isSSR = typeof window === 'undefined';
    const isRelative = !LMM_MANIFEST_URL.startsWith('http');

    if (isSSR && isRelative) {
        const { readFile } = await import('node:fs/promises');
        const { join } = await import('node:path');
        const filePath = join(
            process.cwd(),
            'public',
            LMM_MANIFEST_URL.replace(/^\//, ''),
        );
        return readFile(filePath, 'utf-8');
    }

    const r = await fetch(LMM_MANIFEST_URL, { cache: 'no-store' });
    if (!r.ok) {
        throw new Error(`manifest fetch ${r.status} from ${LMM_MANIFEST_URL}`);
    }
    return r.text();
};

const loadManifest = (): Promise<LmmManifest> => {
    if (cachedManifest) {
        return Promise.resolve(cachedManifest);
    }
    if (inflightManifest) {
        return inflightManifest;
    }
    inflightManifest = fetchManifestRaw()
        .then((raw) => JSON.parse(raw) as LmmManifest)
        .then((m) => {
            cachedManifest = m;
            inflightManifest = undefined;
            return m;
        })
        .catch((e) => {
            inflightManifest = undefined;
            throw e;
        });
    return inflightManifest;
};

// ---------------------------------------------------------------------------
// Envio fetcher
// ---------------------------------------------------------------------------

const gql = async <T>(
    query: string,
    variables?: Record<string, unknown>,
): Promise<T> => {
    const res = await fetch(LMM_FLOW_INDEXER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
        throw new Error(
            `envio ${res.status} from ${LMM_FLOW_INDEXER_ENDPOINT}`,
        );
    }
    const body = (await res.json()) as {
        data?: T;
        errors?: Array<{ message: string }>;
    };
    if (body.errors && body.errors.length > 0) {
        throw new Error(
            `envio: ${body.errors.map((e) => e.message).join(', ')}`,
        );
    }
    if (!body.data) {
        throw new Error('envio: empty response');
    }
    return body.data;
};

// ---------------------------------------------------------------------------
// Identifier matching
// ---------------------------------------------------------------------------

const matchesLmmDao = (manifest: LmmManifest, daoId: string): boolean => {
    const id = daoId.toLowerCase();
    const addr = manifest.lmm.dao.toLowerCase();
    // Aragon daoId convention: `${network}-${address}` — match by substring
    // because the address is unique enough on a fork.
    return id.includes(addr);
};

const matchesLmmAddress = (manifest: LmmManifest, address: string): boolean =>
    address.toLowerCase() === manifest.lmm.dao.toLowerCase();

// ---------------------------------------------------------------------------
// Synthesised IDao
// ---------------------------------------------------------------------------

interface EnvioDaoRow {
    id: string;
    address: string;
    name?: string | null;
    description?: string | null;
    avatarUrl?: string | null;
}

interface EnvioDaoQueryResult {
    Dao: EnvioDaoRow[];
}

const LMM_DAO_QUERY =
    'query LmmDao($addr: String!) { Dao(where: { address: { _eq: $addr } }, limit: 1) { id address name description avatarUrl } }';

const fetchEnvioDao = async (
    daoAddress: string,
): Promise<EnvioDaoRow | undefined> => {
    const data = await gql<EnvioDaoQueryResult>(LMM_DAO_QUERY, {
        addr: daoAddress.toLowerCase(),
    });
    return data.Dao[0];
};

const buildIDaoFromManifest = (
    manifest: LmmManifest,
    envio: EnvioDaoRow | undefined,
): IDao => {
    const address = manifest.lmm.dao;
    // The fork emulates mainnet — surface it as ETHEREUM_MAINNET so the rest
    // of the app's network routing (block explorer links, chain icons, etc.)
    // points at the right network.  Production demos would use the actual
    // target network here.
    const network = Network.ETHEREUM_MAINNET;

    return {
        id: `${network}-${address.toLowerCase()}`,
        address: address.toLowerCase(),
        network,
        name:
            envio?.name ?? manifest.metadata?.name ?? LMM_DEFAULT_METADATA.name,
        description:
            envio?.description ??
            manifest.metadata?.description ??
            LMM_DEFAULT_METADATA.description,
        ens: null,
        subdomain: null,
        avatar:
            envio?.avatarUrl ??
            manifest.metadata?.avatarUrl ??
            LMM_DEFAULT_METADATA.avatarUrl ??
            null,
        version: '1.4.0', // OSx version on the demo fork; updated by Foundry
        isSupported: true,
        plugins: [buildDispatcherAsIDaoPlugin(manifest)],
        metrics: {
            proposalsCreated: 0,
            members: 0,
            tvlUSD: '0',
        },
        links: (manifest.metadata?.links ?? LMM_DEFAULT_METADATA.links).map(
            (l) => ({
                name: l.label,
                url: l.url,
            }),
        ),
        // LMM demo never has linked accounts; emit an empty (but explicit)
        // array so downstream `dao.linkedAccounts ?? []` patterns don't churn.
        linkedAccounts: [],
        blockTimestamp: 0,
        transactionHash: '0x',
    };
};

const buildDispatcherAsIDaoPlugin = (manifest: LmmManifest): IDaoPlugin => ({
    name: 'Capital Dispatcher',
    description:
        'Multi-dispatch Capital Router plugin (Lido Money Machine demo)',
    address: manifest.lmm.dispatcherPlugin,
    daoAddress: manifest.lmm.dao,
    subdomain: 'capital-dispatcher',
    interfaceType: PluginInterfaceType.CAPITAL_DISTRIBUTOR,
    release: '1',
    build: '1',
    isProcess: false,
    isBody: false,
    isSubPlugin: false,
    settings: {} as IDaoPlugin['settings'],
    blockTimestamp: 0,
    transactionHash: '0x',
    slug: 'capital-dispatcher',
});

// ---------------------------------------------------------------------------
// Synthesised IDaoPolicy[] — built from manifest strategies + Envio state.
// ---------------------------------------------------------------------------

const buildPoliciesFromManifest = (manifest: LmmManifest): IDaoPolicy[] => {
    const dispatcherPolicy: IDaoPolicy = {
        name: 'Lido Money Machine',
        description:
            'Routes incoming stETH through a wrap → LP-provide → CowSwap buyback pipeline, ' +
            'with each leg metered by its own budget and price-floor gate.',
        policyKey: 'lmm-dispatcher',
        address: manifest.lmm.dispatcherPlugin,
        daoAddress: manifest.lmm.dao,
        interfaceType: PolicyInterfaceType.ROUTER,
        strategy: {
            type: PolicyStrategyType.MULTI_DISPATCH,
            subRouters: getLmmStrategies(manifest).map((s) => s.address),
        },
        release: '1',
        build: '1',
        blockTimestamp: 0,
        transactionHash: '0x',
    };

    return [dispatcherPolicy];
};

// ---------------------------------------------------------------------------
// Public override API — used by useDao* hooks
// ---------------------------------------------------------------------------

export const tryLmmDaoOverride = async (
    daoId: string,
): Promise<IDao | undefined> => {
    if (!LMM_DEMO_MODE) {
        return undefined;
    }
    const manifest = await loadManifest().catch(() => undefined);
    if (!manifest) {
        return undefined;
    }
    if (!matchesLmmDao(manifest, daoId)) {
        return undefined;
    }

    const envio = await fetchEnvioDao(manifest.lmm.dao).catch(() => undefined);
    return buildIDaoFromManifest(manifest, envio);
};

export const tryLmmDaoByEnsOverride = async (
    _network: Network,
    ens: string,
): Promise<IDao | undefined> => {
    if (!LMM_DEMO_MODE) {
        return undefined;
    }
    const manifest = await loadManifest().catch(() => undefined);
    if (!manifest) {
        return undefined;
    }
    // The LMM demo doesn't register a real ENS; we accept the manifest's
    // metadata.name (or LMM_DEFAULT_METADATA.name when the manifest omits it)
    // as an ENS-ish slug (lowercased) so URLs like
    // /<network>/<lmm-money-machine>/* resolve to the demo DAO.
    const slug = (manifest.metadata?.name ?? LMM_DEFAULT_METADATA.name)
        .toLowerCase()
        .replace(/\s+/g, '-');
    if (ens.toLowerCase() !== slug) {
        return undefined;
    }

    const envio = await fetchEnvioDao(manifest.lmm.dao).catch(() => undefined);
    return buildIDaoFromManifest(manifest, envio);
};

export const tryLmmDaoPoliciesOverride = async (
    daoAddress: string,
): Promise<IDaoPolicy[] | undefined> => {
    if (!LMM_DEMO_MODE) {
        return undefined;
    }
    const manifest = await loadManifest().catch(() => undefined);
    if (!manifest) {
        return undefined;
    }
    if (!matchesLmmAddress(manifest, daoAddress)) {
        return undefined;
    }

    return buildPoliciesFromManifest(manifest);
};

export const tryLmmDaoPermissionsOverride = async (
    daoAddress: string,
): Promise<IPaginatedResponse<IDaoPermission> | undefined> => {
    if (!LMM_DEMO_MODE) {
        return undefined;
    }
    const manifest = await loadManifest().catch(() => undefined);
    if (!manifest) {
        return undefined;
    }
    if (!matchesLmmAddress(manifest, daoAddress)) {
        return undefined;
    }

    // The demo doesn't expose permission rows to the front-end (no auth UI
    // is reachable for demo DAOs).  Return an empty page so the hook
    // resolves successfully but no permission UI renders.
    return {
        data: [],
        metadata: { page: 1, pageSize: 0, totalPages: 1, totalRecords: 0 },
    } satisfies IPaginatedResponse<IDaoPermission>;
};

// Used by useLmmManifest.useIsLmmDemoDao via a cached synchronous check.
export const isLmmDemoDaoSync = (daoAddress: string | undefined): boolean => {
    if (!LMM_DEMO_MODE || !daoAddress || !cachedManifest) {
        return false;
    }
    return cachedManifest.lmm.dao.toLowerCase() === daoAddress.toLowerCase();
};

// `void` exports so the bundler keeps the helpers reachable even when none
// of the wrapper hooks reference them in a given build.
export { LMM_DEMO_MODE };
