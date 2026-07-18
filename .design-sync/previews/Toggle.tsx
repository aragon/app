import { Toggle, ToggleGroup } from '@aragon/gov-ui-kit';

export const Default = () => (
    <ToggleGroup isMultiSelect={false}>
        <Toggle label="All proposals" value="all" />
    </ToggleGroup>
);

export const Selected = () => (
    <ToggleGroup defaultValue="active" isMultiSelect={false}>
        <Toggle label="Active" value="active" />
    </ToggleGroup>
);

export const Disabled = () => (
    <ToggleGroup isMultiSelect={false}>
        <Toggle disabled={true} label="Executed" value="executed" />
    </ToggleGroup>
);
