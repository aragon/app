import { CheckboxCard, type ICompositeAddress } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import type {
    ICreateProcessFormBody,
    ICreateProcessFormPermissions,
    ITokenVotingMember,
} from '../../createProcessFormDefinitions';
import { TokenMinRequirementInput } from './tokenMinRequirementInput';

export interface IVotingBodyCheckboxCardProps {
    body: ICreateProcessFormBody;
    values: ICreateProcessFormPermissions['proposalCreationBodies'];
}

export const VotingBodyCheckboxCard: React.FC<IVotingBodyCheckboxCardProps> = (props) => {
    const { body, values } = props;

    const { setValue, trigger } = useFormContext();

    const isTokenVoting = body.governanceType === 'tokenVoting';

    const handleCheckboxChange = (isChecked: boolean) => {
        const updatedBodies = isChecked
            ? values.some((b) => b.id === body.id)
                ? values
                : [...values, { id: body.id, settings: {} }]
            : values.filter((b) => b.id !== body.id);

        setValue('proposalCreationBodies', updatedBodies);
        trigger('proposalCreationBodies');
    };

    const handleMinRequirementChange = (value: number) => {
        const updatedVotingBodies = values.map((votingBody) =>
            votingBody.id === body.id ? { ...votingBody, settings: { minimumRequirement: value } } : votingBody,
        );

        setValue('proposalCreationBodies', updatedVotingBodies);
    };

    function isTokenVotingMember(member: ICompositeAddress | ITokenVotingMember): member is ITokenVotingMember {
        return 'tokenAmount' in member;
    }

    const maxTokens = isTokenVoting
        ? body.members.reduce(
              (sum, member) => (isTokenVotingMember(member) ? sum + Number(member.tokenAmount) : sum),
              0,
          )
        : undefined;

    return (
        <CheckboxCard
            label={body.name}
            description={body.description}
            onCheckedChange={(isChecked) => handleCheckboxChange(isChecked as boolean)}
            defaultChecked={true}
        >
            {isTokenVoting && (
                <TokenMinRequirementInput
                    handleMinRequirementChange={handleMinRequirementChange}
                    maxTokens={maxTokens ?? 0}
                />
            )}
        </CheckboxCard>
    );
};
