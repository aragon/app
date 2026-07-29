import { Radio, RadioGroup } from '@aragon/gov-ui-kit';

export const Default = () => (
    <RadioGroup name="vote-default">
        <Radio label="Approve proposal" value="approve" />
    </RadioGroup>
);

export const Selected = () => (
    <RadioGroup defaultValue="yes" name="vote-selected">
        <Radio label="Yes, execute immediately" value="yes" />
        <Radio label="No, wait for timelock" value="no" />
    </RadioGroup>
);

export const Disabled = () => (
    <RadioGroup defaultValue="abstain" name="vote-disabled">
        <Radio disabled={true} label="Vote yes" value="yes" />
        <Radio
            disabled={true}
            label="Abstain (voting closed)"
            value="abstain"
        />
    </RadioGroup>
);

export const LabelPosition = () => (
    <RadioGroup defaultValue="left" name="vote-label-position">
        <Radio label="Label on the right" labelPosition="right" value="right" />
        <Radio label="Label on the left" labelPosition="left" value="left" />
    </RadioGroup>
);
