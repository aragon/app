// LMM_DEMO_HACK: visually-loud banner that reminds the presenter (and the
// audience) that the page is running against a forked chain.  Renders to
// `null` when demo mode is off.

'use client';

import classNames from 'classnames';
import { useEffect, useState } from 'react';
import {
    LMM_DEMO_MODE,
    LMM_FLOW_INDEXER_ENDPOINT,
    LMM_RPC_URL,
    type LmmManifest,
} from './lmmDemoConfig';
import { manifestFingerprintCheck } from './safety';
import { useLmmManifest } from './useLmmManifest';

const FINGERPRINT_QUERY =
    'query LmmDaoFingerprint($addr: String!) { Dao(where: { address: { _eq: $addr } }, limit: 1) { address } }';

type FingerprintState =
    | { status: 'unknown' }
    | { status: 'ok' }
    | { status: 'mismatch'; indexerDao: string };

const useFingerprint = (
    manifest: LmmManifest | undefined,
): FingerprintState => {
    const [state, setState] = useState<FingerprintState>({ status: 'unknown' });
    useEffect(() => {
        if (!LMM_DEMO_MODE || !manifest) {
            return;
        }
        let cancelled = false;
        const run = async () => {
            try {
                const res = await fetch(LMM_FLOW_INDEXER_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    cache: 'no-store',
                    body: JSON.stringify({
                        query: FINGERPRINT_QUERY,
                        variables: { addr: manifest.lmm.dao.toLowerCase() },
                    }),
                });
                if (!res.ok) {
                    return;
                }
                const body = (await res.json()) as {
                    data?: { Dao?: Array<{ address: string }> };
                };
                const indexerDao = body.data?.Dao?.[0]?.address;
                if (cancelled) {
                    return;
                }
                if (manifestFingerprintCheck(manifest, indexerDao)) {
                    setState({ status: 'ok' });
                } else if (indexerDao) {
                    setState({ status: 'mismatch', indexerDao });
                }
            } catch {
                // Network errors are non-fatal here — banner is informational.
            }
        };
        void run();
        return () => {
            cancelled = true;
        };
    }, [manifest]);
    return state;
};

export const LmmDemoBanner: React.FC<{ className?: string }> = (props) => {
    const { className } = props;
    const { manifest, error } = useLmmManifest();
    const fingerprint = useFingerprint(manifest);
    if (!LMM_DEMO_MODE) {
        return null;
    }
    return (
        <div
            className={classNames(
                'flex items-start gap-2 rounded-xl border border-warning-200 bg-warning-50 px-3 py-2 font-normal text-warning-900 text-xs leading-snug',
                className,
            )}
        >
            <span
                aria-hidden={true}
                className="mt-0.5 inline-flex size-1.5 shrink-0 rounded-full bg-warning-600"
            />
            <div className="flex flex-col">
                <span className="font-semibold leading-tight">
                    Demo mode — running against {LMM_RPC_URL}. No real funds are
                    moving.
                </span>
                {manifest && (
                    <span className="text-warning-800">
                        DAO {manifest.lmm.dao.slice(0, 6)}…
                        {manifest.lmm.dao.slice(-4)} · dispatcher{' '}
                        {manifest.lmm.dispatcherPlugin.slice(0, 6)}…
                        {manifest.lmm.dispatcherPlugin.slice(-4)}
                    </span>
                )}
                {error && (
                    <span className="text-critical-700">
                        Manifest failed to load: {error.message}
                    </span>
                )}
                {fingerprint.status === 'mismatch' && (
                    <span className="text-critical-700">
                        Fingerprint mismatch: indexer's first DAO is{' '}
                        {fingerprint.indexerDao.slice(0, 6)}…
                        {fingerprint.indexerDao.slice(-4)} but the manifest
                        points at {manifest?.lmm.dao.slice(0, 6)}…
                        {manifest?.lmm.dao.slice(-4)}. Re-run `just demo-up` or
                        re-sync the indexer.
                    </span>
                )}
            </div>
        </div>
    );
};
