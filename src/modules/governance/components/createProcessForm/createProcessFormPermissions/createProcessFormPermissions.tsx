import { useFormField } from '@/shared/hooks/useFormField';
import { InputContainer, RadioCard, RadioGroup } from '@aragon/ods';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { BodyCheckboxCard } from './components/bodyCheckboxCard';
import type { Body, ICreateProcessFormPermissionProps, PermissionsData } from './createProcessFormPermissions.api';

export const CreateProcessFormPermissions: React.FC<ICreateProcessFormPermissionProps> = () => {
    const { getValues } = useFormContext();

    const eligibleField = useFormField<PermissionsData, 'eligibleVoters'>('eligibleVoters', {
        label: 'Who is eligible?',
        defaultValue: 'bodies',
    });

    const votingBodyField = useFormField<PermissionsData, 'votingBodies'>('votingBodies', {
        defaultValue: [],
    });

    const bodies: Body[] = useMemo(
        () => getValues('stages')?.flatMap((stage: { bodies: Body[] }) => stage.bodies || []) || [],
        [getValues],
    );

    return (
        <>
            <RadioGroup className="flex gap-4 md:!flex-row" onValueChange={eligibleField.onChange} {...eligibleField}>
                <RadioCard
                    className="w-full"
                    label="Voting bodies"
                    description="Select voting bodies and define requirements"
                    value="bodies"
                />
                <RadioCard
                    className="w-full"
                    label="Any address"
                    description="Any address can create proposals"
                    value="any"
                />
            </RadioGroup>
            {eligibleField.value === 'bodies' && (
                <InputContainer id="votingBodies" label="Voting Bodies" useCustomWrapper={true} {...votingBodyField}>
                    {bodies &&
                        bodies.map((body: Body, index: number) => (
                            <BodyCheckboxCard values={votingBodyField.value} key={index} body={body} />
                        ))}
                </InputContainer>
            )}
        </>
    );
};
