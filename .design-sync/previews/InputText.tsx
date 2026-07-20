import { InputText } from '@aragon/gov-ui-kit';

export const Default = () => (
    <InputText
        className="w-full"
        helpText="Shown in the proposal list and voting page."
        label="Proposal title"
        maxLength={100}
        placeholder="Give your proposal a title"
    />
);

export const WithAddon = () => (
    <div className="flex w-full flex-col gap-4">
        <InputText
            addon="aragon.eth"
            addonPosition="right"
            className="w-full"
            label="ENS subdomain"
            placeholder="mydao"
        />
        <InputText
            addon="https://"
            addonPosition="left"
            className="w-full"
            label="Forum link"
            placeholder="forum.aragon.org/t/aip-42"
        />
    </div>
);

export const OptionalWithValue = () => (
    <InputText
        className="w-full"
        defaultValue="https://forum.aragon.org/t/aip-42-treasury-diversification"
        helpText="Link to the forum thread where this proposal was discussed."
        isOptional={true}
        label="Discussion URL"
    />
);

export const Warning = () => (
    <InputText
        alert={{
            message: 'Token name cannot be changed after the DAO is launched.',
            variant: 'warning',
        }}
        className="w-full"
        defaultValue="Aragon Network Token"
        label="Governance token name"
        variant="warning"
    />
);

export const Critical = () => (
    <InputText
        alert={{
            message: 'This is not a valid Ethereum address.',
            variant: 'critical',
        }}
        className="w-full"
        defaultValue="0x1234"
        label="Multisig address"
        variant="critical"
    />
);

export const Disabled = () => (
    <InputText
        className="w-full"
        defaultValue="Aragon DAO"
        disabled={true}
        helpText="The DAO name is managed by the governance settings."
        label="DAO name"
    />
);
