import { AlertInline } from '@aragon/gov-ui-kit';

export const Default = () => (
    <div className="flex">
        <AlertInline message="Voting ends in 2 days" variant="info" />
    </div>
);

export const Variants = () => (
    <div className="flex flex-col items-start gap-3">
        <AlertInline message="Proposal published on-chain" variant="info" />
        <AlertInline message="Support threshold reached" variant="success" />
        <AlertInline
            message="Minimum participation not reached yet"
            variant="warning"
        />
        <AlertInline message="Proposal execution failed" variant="critical" />
    </div>
);
