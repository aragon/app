'use client';

/**
 * Small shared canvas panels reused by both the Workbench and Focus layouts:
 * a human-language flow description ("what this flow does") and the full
 * per-token throughput breakdown (how much of each token went out / came back).
 */

import { Card } from '@aragon/gov-ui-kit';
import type { IFlowDescription } from './buildWorkbenchModel';
import { MmIcon } from './mmIcon';
import { fmtAmount } from './mmPrimitives';
import type { ITokenFlow } from './workbenchModel';

export interface IFlowDescriptionCardProps {
    description: IFlowDescription;
    className?: string;
}

export const FlowDescriptionCard: React.FC<IFlowDescriptionCardProps> = ({
    description,
    className,
}) => (
    <Card className={`border border-neutral-100 p-3.5 ${className ?? ''}`}>
        <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-neutral-400 text-xs uppercase tracking-[0.06em]">
            <MmIcon name="info" size={13} />
            What this flow does
        </div>
        <div className="mb-1 font-semibold text-neutral-900 text-sm">
            {description.title}
        </div>
        <p className="text-neutral-600 text-xs leading-relaxed">
            {description.summary}
        </p>
    </Card>
);

export interface ITokenFlowListProps {
    flows: ITokenFlow[];
}

/** Per-token throughput: ↑ left the vault, ↓ returned to the vault. */
export const TokenFlowList: React.FC<ITokenFlowListProps> = ({ flows }) => {
    if (flows.length === 0) {
        return (
            <div className="text-neutral-400 text-xs">No token flow yet.</div>
        );
    }
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Token</span>
                <span className="flex items-center gap-3">
                    <span className="w-20 text-right">↑ out</span>
                    <span className="w-20 text-right">↓ back</span>
                </span>
            </div>
            {flows.map((f) => {
                const inLabel =
                    f.opaqueIn && f.inAmount === 0
                        ? 'LP'
                        : (fmtAmount(f.inAmount) ?? '—');
                return (
                    <div
                        className="flex items-center justify-between gap-3 border-neutral-100 border-t pt-1.5 text-sm"
                        key={f.token}
                    >
                        <span className="font-semibold text-neutral-700">
                            {f.token}
                        </span>
                        <span className="flex items-center gap-3 text-xs">
                            <span className="num w-20 text-right text-neutral-500">
                                {f.outAmount > 0
                                    ? (fmtAmount(f.outAmount) ?? '—')
                                    : '—'}
                            </span>
                            <span className="num w-20 text-right font-semibold text-success-700">
                                {f.inAmount > 0 || f.opaqueIn ? inLabel : '—'}
                            </span>
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
