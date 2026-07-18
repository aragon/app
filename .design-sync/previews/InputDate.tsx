import { InputDate } from '@aragon/gov-ui-kit';

export const Default = () => (
    <InputDate
        label="Voting start date"
        defaultValue="2026-07-20"
        helpText="The proposal becomes active on this date."
        className="w-full"
    />
);

export const Critical = () => (
    <InputDate
        label="Voting end date"
        defaultValue="2026-07-18"
        variant="critical"
        alert={{ message: 'End date must be after the start date.', variant: 'critical' }}
        className="w-full"
    />
);

export const Disabled = () => (
    <InputDate
        label="Execution date"
        defaultValue="2026-07-27"
        disabled={true}
        helpText="Set automatically from the voting period."
        className="w-full"
    />
);
