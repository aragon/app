// LMM_DEMO_HACK: safety helpers for the Lido Money Machine demo.
//
// The demo bypasses every real-money guard the app normally has:
//   - it overrides DAO/policies queries with manifest+envio data
//   - it bypasses wagmi for dispatch (using --auto-impersonate on Anvil)
//   - it exposes a cheats menu that warps time, mints tokens, etc.
//
// These helpers are the line of defense ensuring the demo *only* ever talks
// to a fork RPC and a known indexer.  If any of them fail at boot we refuse
// to render demo UI.

import type { LmmManifest } from './lmmDemoConfig';
import { LMM_RPC_ALLOWLIST, LMM_RPC_URL } from './lmmDemoConfig';

/**
 * Returns the hostname for a given URL (best-effort — falls back to the raw
 * URL when the parser blows up so the allowlist check stays strict).
 */
const hostOf = (raw: string): string => {
    try {
        return new URL(raw).hostname;
    } catch {
        return raw;
    }
};

/**
 * Hard-fails when the demo RPC is not in the allowlist of approved hosts.
 * Mounted at the entry-point of every demo-only code path so production
 * tabs that accidentally have `NEXT_PUBLIC_LMM_DEMO_MODE=1` set against a
 * mainnet RPC URL refuse to fire any tx.
 */
export const assertForkRpc = (rpcUrl: string = LMM_RPC_URL): void => {
    const host = hostOf(rpcUrl).toLowerCase();
    const ok = LMM_RPC_ALLOWLIST.some((allowed) =>
        host === allowed.toLowerCase()
            ? true
            : // Subdomain match — only when the allowlist entry starts with a
              // dot (".aragon.in" would match "tests.aragon.in").  We
              // intentionally do NOT do open-ended suffix matching to keep
              // the rule list explicit.
              allowed.startsWith('.') && host.endsWith(allowed.toLowerCase()),
    );
    if (!ok) {
        const allowlist = LMM_RPC_ALLOWLIST.join(', ');
        throw new Error(
            `[lmm-demo] refusing to use RPC ${rpcUrl}: host "${host}" is not in the demo allowlist (${allowlist}). If this is a new demo VM, add its hostname to LMM_RPC_ALLOWLIST.`,
        );
    }
};

/**
 * Best-effort fingerprint check between a freshly-loaded manifest and the
 * indexer's notion of the LMM DAO.  Returns `true` when they're consistent
 * (or when the manifest doesn't carry a fingerprint), `false` otherwise.
 * Callers should refuse to fire writes when this returns `false`.
 */
export const manifestFingerprintCheck = (
    manifest: LmmManifest,
    indexerDaoAddress: string | undefined,
): boolean => {
    if (!indexerDaoAddress) {
        return true;
    }
    if (manifest.lmm.dao.toLowerCase() !== indexerDaoAddress.toLowerCase()) {
        return false;
    }
    return true;
};
