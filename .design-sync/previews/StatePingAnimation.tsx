import { StatePingAnimation } from '@aragon/gov-ui-kit';

const variants = ['primary', 'info', 'success', 'warning', 'critical'] as const;

export const Variants = () => (
    <div className="flex items-center gap-6">
        {variants.map((variant) => (
            <div className="flex flex-col items-center gap-2" key={variant}>
                <StatePingAnimation variant={variant} />
                <span className="text-neutral-500 text-xs">{variant}</span>
            </div>
        ))}
    </div>
);

export const LiveProposalIndicator = () => (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3">
        <StatePingAnimation variant="info" />
        <div className="flex flex-col">
            <span className="text-base text-neutral-800 leading-tight">Voting is live</span>
            <span className="text-neutral-500 text-sm">Ends in 2 days · 64% support</span>
        </div>
    </div>
);

export const ExecutionPending = () => (
    <div className="flex items-center gap-3">
        <StatePingAnimation variant="warning" />
        <span className="text-neutral-800 text-sm">Awaiting onchain execution</span>
    </div>
);
