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
     * Index of the body inside the proposal-creation-bodies form field.
     */
    bodyIndex: number;
}

export const VotingBodyCheckboxCard: React.FC<IVotingBodyCheckboxCardProps> = (props) => {
    const { body, onChange, checked, bodyIndex } = props;

    const settingsFieldPrefix = `proposalCreationBodies.${bodyIndex.toString()}`;
    const isTokenVoting = body.governanceType === 'tokenVoting';

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
            {isTokenVoting && (
                <TokenMinRequirementInput fieldPrefix={settingsFieldPrefix} totalSupply={tokenTotalSupply} />
            )}
        </CheckboxCard>
    );
};
