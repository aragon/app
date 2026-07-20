import { Switch } from '@aragon/gov-ui-kit';

export const Default = () => (
    <Switch defaultChecked={true} inlineLabel="Show testnets" name="testnets" />
);

export const WithFieldLabel = () => (
    <Switch
        defaultChecked={true}
        helpText="Voters can change their vote until the voting period ends."
        inlineLabel="Vote change enabled"
        label="Vote change"
        name="vote-change"
    />
);

export const States = () => (
    <div className="flex flex-col gap-3">
        <Switch inlineLabel="Early execution" name="early-execution" />
        <Switch
            defaultChecked={true}
            inlineLabel="Notifications"
            name="notifications"
        />
        <Switch
            disabled={true}
            inlineLabel="Gasless voting (unavailable)"
            name="gasless"
        />
        <Switch
            defaultChecked={true}
            disabled={true}
            inlineLabel="Token voting (locked)"
            name="token-voting"
        />
    </div>
);
