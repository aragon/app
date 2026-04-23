'use client';

import { ChainEntityType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { Network } from '@/shared/api/daoService';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import type { IFlowPendingDispatch } from '../../providers/flowDataProvider';

export interface IFlowWaitingForIndexerBadgeProps {
    /**
     * Network of the DAO — used to resolve the explorer URL for the pending tx.
     */
    network: string;
    pending: IFlowPendingDispatch;
    /**
     * Visual density:
     * - `compact` (default): a chip suited for a card footer / policy row.
     * - `block`: larger banner used on the detail page header.
     */
    variant?: 'compact' | 'block';
    className?: string;
}

/**
 * Persistent indicator shown from the moment a dispatch tx is confirmed in the
 * wallet until the indexer catches up. Exists to reconcile two truths the user
 * cares about:
 *   1. "My transaction is on-chain" — we have a tx hash and a block.
 *   2. "The dashboard still shows the old snapshot" — Envio hasn't run yet.
 *
 * Rather than faking an optimistic row in the feed we surface a dedicated
 * "waiting for indexer" state so the user never sees drift between the live
 * snapshot and the simulated one.
 */
export const FlowWaitingForIndexerBadge: React.FC<
    IFlowWaitingForIndexerBadgeProps
> = (props) => {
    const { network, pending, variant = 'compact', className } = props;

    const { buildEntityUrl } = useDaoChain({ network: network as Network });
    const txUrl = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: pending.txHash,
    });

    const containerClass =
        variant === 'block'
            ? 'flex items-center gap-2.5 rounded-xl border border-primary-100 bg-primary-50 px-3 py-2'
            : 'inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1';

    const labelClass =
        variant === 'block'
            ? 'font-semibold text-primary-800 text-sm leading-tight'
            : 'font-semibold text-primary-800 text-xs leading-tight';

    const subtitleClass =
        variant === 'block'
            ? 'font-normal text-primary-700 text-xs leading-tight'
            : 'font-normal text-primary-700 text-[11px] leading-tight';

    return (
        <div
            aria-live="polite"
            className={classNames(containerClass, className)}
        >
            <Spinner variant={variant} />
            <div className="flex min-w-0 flex-col">
                <span className={labelClass}>
                    Dispatched · waiting for indexer
                </span>
                {txUrl != null && (
                    <a
                        className={classNames(
                            subtitleClass,
                            'truncate underline-offset-2 hover:underline',
                        )}
                        href={txUrl}
                        onClick={(e) => e.stopPropagation()}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        View transaction ↗
                    </a>
                )}
            </div>
        </div>
    );
};

const Spinner: React.FC<{ variant: 'compact' | 'block' }> = ({ variant }) => {
    const size = variant === 'block' ? 'size-4' : 'size-3';
    return (
        <span
            aria-hidden={true}
            className={classNames(
                'inline-block shrink-0 animate-spin rounded-full border-2 border-primary-200 border-t-primary-500',
                size,
            )}
        />
    );
};
