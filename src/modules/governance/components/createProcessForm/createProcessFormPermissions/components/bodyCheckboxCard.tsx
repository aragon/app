import { CheckboxCard, InputNumber } from '@aragon/ods';
import { useFormContext } from 'react-hook-form';
import type { Body } from '../createProcessFormPermissions.api';

interface IBodyCheckboxCardProps {
    body: Body;
    values: Body[];
}

export const BodyCheckboxCard: React.FC<IBodyCheckboxCardProps> = (props) => {
    const { body, values } = props;
    const { setValue } = useFormContext();

    const handleCheckboxChange = (body: Body, isChecked: boolean) => {
        const currentBodies = values || [];
        let updatedBodies;

        if (isChecked) {
            if (!currentBodies.some((b) => b.bodyNameField === body.bodyNameField)) {
                updatedBodies = [...currentBodies, { ...body }];
            } else {
                updatedBodies = currentBodies;
            }
        } else {
            updatedBodies = currentBodies.filter((b) => b.bodyNameField !== body.bodyNameField);
        }

        setValue('votingBodies', updatedBodies);
    };

    const handleMinRequirementChange = (bodyName: string, value: number) => {
        const updatedVotingBodies = values.map((vb) =>
            vb.bodyNameField === bodyName ? { ...vb, minimumRequirement: value } : vb,
        );
        setValue('votingBodies', updatedVotingBodies);
    };

    if (body.bodyGovernanceTypeField === 'tokenVoting') {
        return (
            <CheckboxCard
                label={body.bodyNameField}
                description={body.bodySummaryField}
                onCheckedChange={(isChecked) => handleCheckboxChange(body, isChecked as boolean)}
            >
                <button className="text-left" onClick={(e) => e.preventDefault()}>
                    <InputNumber
                        prefix="≥"
                        label="Minimum requirement"
                        helpText="Only token holders with at least the minimum required balance or delegates minimum required voting power can create proposals."
                        placeholder="0"
                        onChange={(value) => handleMinRequirementChange(body.bodyNameField, Number(value))}
                    />
                </button>
            </CheckboxCard>
        );
    }
    return (
        <CheckboxCard
            label={body.bodyNameField}
            description={body.bodySummaryField}
            onCheckedChange={(isChecked) => handleCheckboxChange(body, isChecked as boolean)}
        />
    );
};
