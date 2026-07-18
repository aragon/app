import { InputText } from '@aragon/gov-ui-kit';

export const Default = () => (
    <InputText
        label="Proposal title"
        placeholder="Give your proposal a title"
        helpText="Shown in the proposal list and voting page."
        maxLength={100}
        className="w-full"
    />
);

export const WithAddon = () => (
    <div className="flex w-full flex-col gap-4">
        <InputText label="ENS subdomain" addon="aragon.eth" addonPosition="right" placeholder="mydao" className="w-full" />
        <InputText label="Forum link" addon="https://" addonPosition="left" placeholder="forum.aragon.org/t/aip-42" className="w-full" />
    </div>
);

export const OptionalWithValue = () => (
    <InputText
        label="Discussion URL"
        isOptional={true}
        defaultValue="https://forum.aragon.org/t/aip-42-treasury-diversification"
        helpText="Link to the forum thread where this proposal was discussed."
        className="w-full"
    />
);

export const Warning = () => (
    <InputText
        label="Governance token name"
        defaultValue="Aragon Network Token"
        variant="warning"
        alert={{ message: 'Token name cannot be changed after the DAO is launched.', variant: 'warning' }}
        className="w-full"
    />
);

export const Critical = () => (
    <InputText
        label="Multisig address"
        defaultValue="0x1234"
        variant="critical"
        alert={{ message: 'This is not a valid Ethereum address.', variant: 'critical' }}
        className="w-full"
    />
);

export const Disabled = () => (
    <InputText
        label="DAO name"
        defaultValue="Aragon DAO"
        disabled={true}
        helpText="The DAO name is managed by the governance settings."
        className="w-full"
    />
);
