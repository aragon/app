import { InputNumber } from '@aragon/gov-ui-kit';

export const Default = () => (
    <InputNumber
        label="Voting duration"
        suffix="hours"
        value="72"
        min={1}
        helpText="How long members can vote on a proposal."
        className="w-full"
    />
);

export const PrefixSuffix = () => (
    <div className="flex w-full flex-col gap-4">
        <InputNumber label="Support threshold" suffix="%" min={0} max={100} value="50" className="w-full" />
        <InputNumber label="Proposal deposit" prefix="ANT" value="250" className="w-full" />
    </div>
);

export const Warning = () => (
    <InputNumber
        label="Minimum participation"
        suffix="%"
        value="3"
        variant="warning"
        alert={{ message: 'A participation below 5% can make proposals easy to pass.', variant: 'warning' }}
        className="w-full"
    />
);

export const Critical = () => (
    <InputNumber
        label="Approval threshold"
        value="120"
        suffix="%"
        variant="critical"
        alert={{ message: 'The threshold cannot exceed 100%.', variant: 'critical' }}
        className="w-full"
    />
);

export const Disabled = () => (
    <InputNumber
        label="Token decimals"
        value="18"
        disabled={true}
        helpText="Defined by the ERC-20 token contract."
        className="w-full"
    />
);
