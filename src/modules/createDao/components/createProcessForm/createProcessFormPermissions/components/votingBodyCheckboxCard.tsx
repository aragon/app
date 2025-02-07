import { CheckboxCard } from '@aragon/gov-ui-kit';
import { type ICreateProcessFormBody } from '../../createProcessFormDefinitions';
import { TokenMinRequirementInput } from './tokenMinRequirementInput';

export interface IVotingBodyCheckboxCardProps {
    /**
     * Body to render the checkbox card for.
     */
    body: ICreateProcessFormBody;
    /**
     * Callback called on body checkbox change.
     */
    onChange: (bodyId: string, checked: boolean) => void;
    /**
     * Defines if the body is checked or not.
     */
    checked: boolean;
    /**
     * Prefix to be used for the body permission settings.
     */
    fieldPrefix: string;
}

export const VotingBodyCheckboxCard: React.FC<IVotingBodyCheckboxCardProps> = (props) => {
    const { body, onChange, checked, fieldPrefix } = props;

    const isTokenVoting = body.governanceType === 'token-voting';

    const tokenTotalSupply = body.members.reduce(
        (supply, member) => ('tokenAmount' in member ? supply + Number(member.tokenAmount) : supply),
        0,
    );

    return (
        <CheckboxCard
            label={body.name}
            description={body.description}
            onCheckedChange={(isChecked) => onChange(body.id, Boolean(isChecked))}
            checked={checked}
        >
            {isTokenVoting && <TokenMinRequirementInput fieldPrefix={fieldPrefix} totalSupply={tokenTotalSupply} />}
        </CheckboxCard>
    );
};
