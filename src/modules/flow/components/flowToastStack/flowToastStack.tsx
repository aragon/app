'use client';

import classNames from 'classnames';
import { useFlowDataContext } from '../../providers/flowDataProvider';

const toneClass: Record<'success' | 'info' | 'error' | 'warning', string> = {
    success: 'border-success-300 bg-success-50 text-success-800',
    info: 'border-neutral-200 bg-neutral-0 text-neutral-800',
    error: 'border-critical-300 bg-critical-50 text-critical-800',
    warning: 'border-warning-300 bg-warning-50 text-warning-800',
};

export const FlowToastStack: React.FC = () => {
    const { toasts, dismissToast } = useFlowDataContext();

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2"
            role="status"
        >
            {toasts.map((toast) => (
                <button
                    aria-label="Dismiss notification"
                    className={classNames(
                        'pointer-events-auto flex min-w-[280px] flex-col gap-0.5 rounded-xl border px-4 py-3 text-left shadow-neutral-lg',
                        toneClass[toast.tone],
                    )}
                    key={toast.id}
                    onClick={() => dismissToast(toast.id)}
                    type="button"
                >
                    <span className="font-semibold text-sm leading-tight">
                        {toast.title}
                    </span>
                    {toast.description != null && (
                        <span className="font-normal text-sm leading-snug opacity-80">
                            {toast.description}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};
