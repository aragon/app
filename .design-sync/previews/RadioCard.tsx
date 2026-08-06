import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';

export const Default = () => (
    <RadioGroup className="w-full" name="governance-default">
        <RadioCard
            label="Token voting"
            tag={{ label: 'Governance', variant: 'info' }}
            value="token-voting"
        />
    </RadioGroup>
);

export const WithDescription = () => (
    <RadioGroup className="w-full" name="governance-description">
        <RadioCard
            description="One token equals one vote. Voting power scales with holdings."
            label="Token voting"
            tag={{ label: 'Recommended', variant: 'primary' }}
            value="token-voting"
        />
    </RadioGroup>
);

export const SelectedWithChildren = () => (
    <RadioGroup
        className="w-full"
        defaultValue="multisig"
        name="governance-selected"
    >
        <RadioCard
            description="A fixed set of signers approves proposals before execution."
            label="Multisig"
            tag={{ label: 'Selected', variant: 'success' }}
            value="multisig"
        >
            <p className="text-neutral-500">
                Requires 3 of 5 signer approvals to execute.
            </p>
        </RadioCard>
    </RadioGroup>
);

export const Disabled = () => (
    <RadioGroup className="w-full" name="governance-disabled">
        <RadioCard
            description="Available after the DAO upgrade to v1.4 is executed."
            disabled={true}
            label="Gasless voting"
            tag={{ label: 'Locked', variant: 'neutral' }}
            value="gasless"
        />
    </RadioGroup>
);
