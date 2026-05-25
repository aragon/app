// LMM_DEMO_HACK: visually-loud banner that reminds the presenter (and the
// audience) that the page is running against a forked chain.  Renders to
// `null` when demo mode is off.

'use client';

import classNames from 'classnames';
import { LMM_DEMO_MODE, LMM_RPC_URL, useLmmManifest } from './lmmDemoConfig';

export const LmmDemoBanner: React.FC<{ className?: string }> = (props) => {
    const { className } = props;
    const { manifest, error } = useLmmManifest();
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
                        {manifest.lmm.dispatcher.slice(0, 6)}…
                        {manifest.lmm.dispatcher.slice(-4)}
                    </span>
                )}
                {error && (
                    <span className="text-critical-700">
                        Manifest failed to load: {error.message}
                    </span>
                )}
            </div>
        </div>
    );
};
