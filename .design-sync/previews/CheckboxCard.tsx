import { CheckboxCard } from '@aragon/gov-ui-kit';

export const Default = () => (
    <CheckboxCard
        className="w-full"
        label="Token voting"
        tag={{ label: 'Governance', variant: 'info' }}
    />
);

export const WithDescription = () => (
    <CheckboxCard
        className="w-full"
        description="Members vote with the voting power of their governance tokens."
        label="Token voting"
        tag={{ label: 'Active', variant: 'success' }}
    />
);

export const CheckedWithChildren = () => (
    <CheckboxCard
        checked={true}
        className="w-full"
        description="Any wallet holding an Aragon DAO membership NFT can vote."
        label="Multisig approval"
        tag={{ label: 'Selected', variant: 'primary' }}
    >
        <p className="text-neutral-500">
            3 of 5 signers required to execute proposals.
        </p>
    </CheckboxCard>
);

export const Indeterminate = () => (
    <CheckboxCard
        checked="indeterminate"
        className="w-full"
        description="Some permissions in this group are granted."
        label="Treasury permissions"
        tag={{ label: 'Partial', variant: 'warning' }}
    />
);

export const Disabled = () => (
    <CheckboxCard
        className="w-full"
        description="Available after the DAO upgrade to v1.4 is executed."
        disabled={true}
        label="Gasless voting"
        tag={{ label: 'Locked', variant: 'neutral' }}
    />
);
