import { Tooltip } from '@aragon/gov-ui-kit';

export const Default = () => (
    <div className="flex justify-center pt-16 pb-2">
        <Tooltip content="Voting ends July 19, 2026" defaultOpen={true}>
            <p className="rounded border border-neutral-200 px-3 py-2 text-neutral-500">7 days left</p>
        </Tooltip>
    </div>
);

export const Variants = () => (
    <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 pt-16 pb-2">
        <Tooltip content="Informational" defaultOpen={true} variant="info">
            <p className="rounded border border-neutral-200 px-3 py-2 text-neutral-500">Info</p>
        </Tooltip>
        <Tooltip content="Proposal passed" defaultOpen={true} variant="success">
            <p className="rounded border border-neutral-200 px-3 py-2 text-neutral-500">Success</p>
        </Tooltip>
        <Tooltip content="Low participation" defaultOpen={true} variant="warning">
            <p className="rounded border border-neutral-200 px-3 py-2 text-neutral-500">Warning</p>
        </Tooltip>
        <Tooltip content="Execution failed" defaultOpen={true} variant="critical">
            <p className="rounded border border-neutral-200 px-3 py-2 text-neutral-500">Critical</p>
        </Tooltip>
    </div>
);
