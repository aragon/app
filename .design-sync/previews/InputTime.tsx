import { InputTime } from '@aragon/gov-ui-kit';

export const Default = () => (
    <InputTime label="Voting start time" defaultValue="09:00" helpText="Times are shown in UTC." className="w-full" />
);

export const Warning = () => (
    <InputTime
        label="Voting end time"
        defaultValue="23:45"
        variant="warning"
        alert={{ message: 'Voting ends less than one hour after it starts.', variant: 'warning' }}
        className="w-full"
    />
);

export const Disabled = () => (
    <InputTime
        label="Execution time"
        defaultValue="12:00"
        disabled={true}
        helpText="Set automatically from the timelock settings."
        className="w-full"
    />
);
