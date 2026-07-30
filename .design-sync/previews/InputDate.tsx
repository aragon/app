import { InputDate } from '@aragon/gov-ui-kit';

export const Default = () => (
    <InputDate
        className="w-full"
        defaultValue="2026-07-20"
        helpText="The proposal becomes active on this date."
        label="Voting start date"
    />
);

export const Critical = () => (
    <InputDate
        alert={{
            message: 'End date must be after the start date.',
            variant: 'critical',
        }}
        className="w-full"
        defaultValue="2026-07-18"
        label="Voting end date"
        variant="critical"
    />
);

export const Disabled = () => (
    <InputDate
        className="w-full"
        defaultValue="2026-07-27"
        disabled={true}
        helpText="Set automatically from the voting period."
        label="Execution date"
    />
);
