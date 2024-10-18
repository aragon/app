import { CheckboxCard } from '@aragon/ods';
import { useFormContext } from 'react-hook-form';
import type { Body, IVotingBodyCheckboxCardProps } from '../createProcessFormPermissions.api';
import { TokenMinRequirementInput } from './tokenMinRequirementInput';

export const VotingBodyCheckboxCard: React.FC<IVotingBodyCheckboxCardProps> = (props) => {
    const { body, values } = props;

    const { setValue, trigger } = useFormContext();

    const handleCheckboxChange = (body: Body, isChecked: boolean) => {
        const updatedBodies = isChecked
            ? values.some((b) => b.bodyNameField === body.bodyNameField)
                ? values
                : [...values, body]
            : values.filter((b) => b.bodyNameField !== body.bodyNameField);

        setValue('selectedBodies', updatedBodies);
        trigger('selectedBodies');
    };

    const handleMinRequirementChange = (value: number) => {
        const updatedVotingBodies = values.map((votingBody) =>
            votingBody.bodyNameField === body.bodyNameField ? { ...votingBody, minimumRequirement: value } : votingBody,
        );

        setValue('selectedBodies', updatedVotingBodies);
    };

    return (
        <CheckboxCard
            label={body.bodyNameField}
            description={body.bodySummaryField}
            onCheckedChange={(isChecked) => handleCheckboxChange(body, isChecked as boolean)}
            defaultChecked={true}
        >
            {body.bodyGovernanceTypeField === 'tokenVoting' && (
                <TokenMinRequirementInput handleMinRequirementChange={handleMinRequirementChange} />
            )}
        </CheckboxCard>
    );
};
