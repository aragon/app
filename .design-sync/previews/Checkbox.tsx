import { Checkbox } from '@aragon/gov-ui-kit';

export const Default = () => (
    <Checkbox label="I have reviewed the proposal actions" />
);

export const CheckedStates = () => (
    <div className="flex flex-col gap-3">
        <Checkbox label="Transfer 5.0 ETH to grants multisig" />
        <Checkbox checked={true} label="Update voting settings" />
        <Checkbox checked="indeterminate" label="All treasury actions" />
    </div>
);

export const Disabled = () => (
    <div className="flex flex-col gap-3">
        <Checkbox disabled={true} label="Mint governance tokens" />
        <Checkbox
            checked={true}
            disabled={true}
            label="Verified smart contract"
        />
    </div>
);

export const LabelPosition = () => (
    <div className="flex flex-col gap-3">
        <Checkbox label="Notify members by email" labelPosition="right" />
        <Checkbox
            checked={true}
            label="Enable early execution"
            labelPosition="left"
        />
    </div>
);
