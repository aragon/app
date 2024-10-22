import { CheckboxCard } from '@aragon/ods';
import { useFormContext } from 'react-hook-form';
import type { ICreateProcessFormBody, ICreateProcessFormPermissions } from '../../createProcessFormDefinitions';
import { TokenMinRequirementInput } from './tokenMinRequirementInput';

export interface IVotingBodyCheckboxCardProps {
    body: ICreateProcessFormBody;
    values: ICreateProcessFormPermissions['proposalCreationBodies'];
}

export const VotingBodyCheckboxCard: React.FC<IVotingBodyCheckboxCardProps> = (props) => {
    const { body, values } = props;

    const { setValue, trigger } = useFormContext();

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

    return (
        <CheckboxCard
            label={body.name}
            description={body.description}
            onCheckedChange={(isChecked) => handleCheckboxChange(isChecked as boolean)}
            defaultChecked={true}
        >
            {body.governanceType === 'tokenVoting' && (
                <TokenMinRequirementInput handleMinRequirementChange={handleMinRequirementChange} />
            )}
        </CheckboxCard>
    );
};
