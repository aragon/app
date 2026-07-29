import { TextArea } from '@aragon/gov-ui-kit';

export const Default = () => (
    <TextArea
        className="w-full"
        helpText="Briefly explain what this proposal changes and why."
        label="Proposal summary"
        placeholder="Describe your proposal…"
    />
);

export const WithValueAndCounter = () => (
    <TextArea
        className="w-full"
        label="Description"
        maxLength={280}
        value="Allocate 25,000 USDC from the treasury to fund the Q3 developer grants program, distributed across three milestones."
    />
);

export const Variants = () => (
    <div className="flex w-full flex-col gap-4">
        <TextArea
            alert={{
                message: 'Consider adding more context for voters.',
                variant: 'warning',
            }}
            defaultValue="Transfer funds to the grants multisig."
            label="Rationale"
            variant="warning"
        />
        <TextArea
            alert={{
                message: 'A description is required to publish the proposal.',
                variant: 'critical',
            }}
            label="Rationale"
            placeholder="Describe your proposal…"
            variant="critical"
        />
    </div>
);

export const States = () => (
    <div className="flex w-full flex-col gap-4">
        <TextArea
            defaultValue="Proposal metadata is locked after publication."
            disabled={true}
            helpText="This field cannot be edited once the proposal is live."
            label="On-chain description"
        />
        <TextArea
            isOptional={true}
            label="Additional resources"
            placeholder="Links to forum discussions, audits…"
        />
    </div>
);
