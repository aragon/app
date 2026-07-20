import { InputTime } from '@aragon/gov-ui-kit';

export const Default = () => (
    <InputTime
        className="w-full"
        defaultValue="09:00"
        helpText="Times are shown in UTC."
        label="Voting start time"
    />
);

export const Warning = () => (
    <InputTime
        alert={{
            message: 'Voting ends less than one hour after it starts.',
            variant: 'warning',
        }}
        className="w-full"
        defaultValue="23:45"
        label="Voting end time"
        variant="warning"
    />
);

export const Disabled = () => (
    <InputTime
        className="w-full"
        defaultValue="12:00"
        disabled={true}
        helpText="Set automatically from the timelock settings."
        label="Execution time"
    />
);
