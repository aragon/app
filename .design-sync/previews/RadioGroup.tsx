import { Radio, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';

export const Default = () => (
    <RadioGroup
        className="w-full"
        defaultValue="yes"
        helpText="Your vote is weighted by your token balance at the snapshot block."
        label="Cast your vote"
        name="vote"
    >
        <Radio label="Yes" value="yes" />
        <Radio label="No" value="no" />
        <Radio label="Abstain" value="abstain" />
    </RadioGroup>
);

export const CardVariant = () => (
    <RadioGroup
        className="w-full"
        defaultValue="token-voting"
        helpText="Choose how members of your DAO make decisions."
        label="Governance model"
        name="governance-model"
    >
        <RadioCard
            description="One token equals one vote."
            label="Token voting"
            tag={{ label: 'Recommended', variant: 'primary' }}
            value="token-voting"
        />
        <RadioCard
            description="A fixed set of signers approves proposals."
            label="Multisig"
            tag={{ label: 'Popular', variant: 'info' }}
            value="multisig"
        />
        <RadioCard
            description="Offchain voting with onchain execution."
            label="Gasless voting"
            tag={{ label: 'New', variant: 'success' }}
            value="gasless"
        />
    </RadioGroup>
);

export const DisabledGroup = () => (
    <RadioGroup
        className="w-full"
        defaultValue="no"
        disabled={true}
        helpText="Voting closed on 12 July 2026."
        label="Cast your vote"
        name="vote-closed"
    >
        <Radio label="Yes" value="yes" />
        <Radio label="No" value="no" />
        <Radio label="Abstain" value="abstain" />
    </RadioGroup>
);

export const WithAlert = () => (
    <RadioGroup
        alert={{ message: 'You must select an option before submitting your vote.', variant: 'critical' }}
        className="w-full"
        label="Cast your vote"
        name="vote-alert"
    >
        <Radio label="Yes" value="yes" />
        <Radio label="No" value="no" />
    </RadioGroup>
);
