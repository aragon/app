import { InputNumber } from '@aragon/gov-ui-kit';

export const Default = () => (
    <InputNumber
        className="w-full"
        helpText="How long members can vote on a proposal."
        label="Voting duration"
        min={1}
        suffix="hours"
        value="72"
    />
);

export const PrefixSuffix = () => (
    <div className="flex w-full flex-col gap-4">
        <InputNumber
            className="w-full"
            label="Support threshold"
            max={100}
            min={0}
            suffix="%"
            value="50"
        />
        <InputNumber
            className="w-full"
            label="Proposal deposit"
            prefix="ANT"
            value="250"
        />
    </div>
);

export const Warning = () => (
    <InputNumber
        alert={{
            message:
                'A participation below 5% can make proposals easy to pass.',
            variant: 'warning',
        }}
        className="w-full"
        label="Minimum participation"
        suffix="%"
        value="3"
        variant="warning"
    />
);

export const Critical = () => (
    <InputNumber
        alert={{
            message: 'The threshold cannot exceed 100%.',
            variant: 'critical',
        }}
        className="w-full"
        label="Approval threshold"
        suffix="%"
        value="120"
        variant="critical"
    />
);

export const Disabled = () => (
    <InputNumber
        className="w-full"
        disabled={true}
        helpText="Defined by the ERC-20 token contract."
        label="Token decimals"
        value="18"
    />
);
