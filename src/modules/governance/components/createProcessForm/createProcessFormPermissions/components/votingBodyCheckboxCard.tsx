import { CheckboxCard } from '@aragon/ods';
import { useFormContext } from 'react-hook-form';
import type { Body, IVotingBodyCheckboxCardProps } from '../createProcessFormPermissions.api';
import { TokenMinRequirementInput } from './tokenMinRequirementInput';

export const VotingBodyCheckboxCard: React.FC<IVotingBodyCheckboxCardProps> = (props) => {
    const { body, values } = props;

    const { setValue } = useFormContext();

    const handleCheckboxChange = (body: Body, isChecked: boolean) => {
        const updatedBodies = isChecked
            ? values.some((b) => b.bodyNameField === body.bodyNameField)
                ? values
                : [...values, body]
            : values.filter((b) => b.bodyNameField !== body.bodyNameField);

        setValue('votingBodies', updatedBodies);
    };

    const handleMinRequirementChange = (bodyName: string, value: number) => {
        const updatedVotingBodies = values.map((votingBody) =>
            votingBody.bodyNameField === bodyName ? { ...votingBody, minimumRequirement: value } : votingBody,
        );

        setValue('votingBodies', updatedVotingBodies);
    };

    return (
        <CheckboxCard
            label={body.bodyNameField}
            description={body.bodySummaryField}
            onCheckedChange={(isChecked) => handleCheckboxChange(body, isChecked as boolean)}
        >
            {body.bodyGovernanceTypeField === 'tokenVoting' && (
                <TokenMinRequirementInput body={body} handleMinRequirementChange={handleMinRequirementChange} />
            )}
        </CheckboxCard>
    );
};
