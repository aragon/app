import { TextAreaRichText } from '@aragon/gov-ui-kit';

export const Default = () => (
    <TextAreaRichText
        className="w-full"
        helpText="Formatting is stored as rich text and rendered on the proposal page."
        label="Proposal body"
        placeholder="Write the full proposal…"
    />
);

export const WithContent = () => (
    <TextAreaRichText
        className="w-full"
        label="Proposal body"
        value="<h2>Fund the Q3 grants program</h2><p>This proposal allocates <strong>25,000 USDC</strong> from the treasury to the grants multisig. Funds are released in three milestones, reviewed by the <em>grants committee</em>.</p><ul><li>Milestone 1: 10,000 USDC on approval</li><li>Milestone 2: 10,000 USDC after mid-term report</li><li>Milestone 3: 5,000 USDC on final delivery</li></ul><p>Full details in the <a href='https://aragon.org' target='_blank'>forum discussion</a>.</p>"
    />
);

export const States = () => (
    <div className="flex w-full flex-col gap-4">
        <TextAreaRichText
            alert={{ message: 'The proposal body cannot be empty.', variant: 'critical' }}
            label="Proposal body"
            placeholder="Write the full proposal…"
            variant="critical"
        />
        <TextAreaRichText
            disabled={true}
            helpText="Published proposals cannot be edited."
            label="Proposal body"
            value="<p>This proposal has been published on-chain and is now read-only.</p>"
        />
    </div>
);
