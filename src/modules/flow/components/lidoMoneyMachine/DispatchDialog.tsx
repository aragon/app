// Vendored from dao-launchpad@f/lido-demo:lido/preview/ui/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Adapted: imports rewritten to use the in-tree @/shared/lidoPreview vendoring
// of @aragon/lido-preview, with .ts/.tsx extensions stripped for moduleResolution=bundler.

// Confirm-dispatch modal: shows the predicted Steps view alongside a
// Confirm / Cancel.  Driven by the latest simulation the Status panel has
// already fetched.

import { useEffect } from 'react';
import type { FlowGraph } from '@/shared/lidoPreview';
import { CloseIcon } from './icons';
import { StepsView } from './StepsView';

export function DispatchDialog({
    flow,
    simulationError,
    busy,
    txError,
    onConfirm,
    onCancel,
}: {
    flow: FlowGraph | null;
    simulationError?: string;
    busy: boolean;
    txError: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    // Close on Escape (when not mid-tx).
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape' && !busy) {
                onCancel();
            }
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [busy, onCancel]);

    return (
        <div
            className="modal-backdrop"
            onClick={(e) => {
                if (e.target === e.currentTarget && !busy) {
                    onCancel();
                }
            }}
        >
            <div
                aria-labelledby="dispatch-modal-title"
                aria-modal="true"
                className="modal"
                role="dialog"
            >
                <header className="modal-header">
                    <h3 id="dispatch-modal-title">Confirm dispatch</h3>
                    <button
                        aria-label="Cancel"
                        className="flow-close"
                        disabled={busy}
                        onClick={onCancel}
                        type="button"
                    >
                        <CloseIcon />
                    </button>
                </header>
                <div className="modal-body">
                    {simulationError && (
                        <div className="error">
                            Simulation failed: {simulationError}
                            <div
                                className="muted small"
                                style={{ marginTop: 4 }}
                            >
                                Dispatch may still succeed on chain, but the
                                preview can't show what'll happen.
                            </div>
                        </div>
                    )}
                    {!simulationError && !flow && (
                        <div className="hint">Computing the next dispatch…</div>
                    )}
                    {flow && (
                        <div className="modal-steps">
                            <StepsView flow={flow} />
                        </div>
                    )}
                </div>
                <footer className="modal-footer">
                    {txError && (
                        <div className="error sim-error">
                            Dispatch failed: {txError}
                        </div>
                    )}
                    <div className="modal-actions">
                        <button
                            className="secondary"
                            disabled={busy}
                            onClick={onCancel}
                            type="button"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={busy || !flow}
                            onClick={onConfirm}
                            type="button"
                        >
                            {busy ? 'Dispatching…' : 'Confirm dispatch'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
