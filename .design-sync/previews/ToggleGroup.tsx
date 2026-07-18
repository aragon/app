import { Toggle, ToggleGroup } from '@aragon/gov-ui-kit';

export const Default = () => (
    <ToggleGroup defaultValue="multisig" isMultiSelect={false}>
        <Toggle label="Multisig" value="multisig" />
        <Toggle label="Token based" value="token-based" />
        <Toggle label="Admin" value="admin" />
    </ToggleGroup>
);

export const MultiSelect = () => (
    <ToggleGroup defaultValue={['all', 'member']} isMultiSelect={true}>
        <Toggle label="All DAOs" value="all" />
        <Toggle label="Member" value="member" />
        <Toggle disabled={true} label="Following" value="following" />
    </ToggleGroup>
);

export const SpaceBetween = () => (
    <ToggleGroup className="w-full" defaultValue="default" isMultiSelect={false} variant="space-between">
        <Toggle label="Default" value="default" />
        <Toggle label="Optimistic" value="optimistic" />
        <Toggle label="Timelock" value="timelock" />
    </ToggleGroup>
);

export const Vertical = () => (
    <ToggleGroup defaultValue="active" isMultiSelect={false} orientation="vertical">
        <Toggle label="Active" value="active" />
        <Toggle label="Pending" value="pending" />
        <Toggle label="Executed" value="executed" />
    </ToggleGroup>
);
