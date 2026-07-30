import { AlertCard } from '@aragon/gov-ui-kit';

export const Default = () => (
    <AlertCard message="Proposal executed" variant="info">
        The proposal actions were executed on-chain on July 12, 2026.
    </AlertCard>
);

export const Variants = () => (
    <div className="flex w-full flex-col gap-3">
        <AlertCard message="Heads up" variant="info">
            Voting starts in 2 days.
        </AlertCard>
        <AlertCard message="Proposal passed" variant="success">
            The support threshold was reached.
        </AlertCard>
        <AlertCard message="Low participation" variant="warning">
            Minimum participation has not been reached yet.
        </AlertCard>
        <AlertCard message="Execution failed" variant="critical">
            The transaction reverted during execution.
        </AlertCard>
    </div>
);
