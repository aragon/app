import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputContainer, RadioCard, RadioGroup } from '@aragon/ods';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { VotingBodyCheckboxCard } from './components/votingBodyCheckboxCard';
import type { Body, PermissionsData } from './createProcessFormPermissions.api';

export interface ICreateProcessFormPermissionProps {}

export const CreateProcessFormPermissions: React.FC<ICreateProcessFormPermissionProps> = () => {
    const { getValues, trigger, setValue } = useFormContext();

    const { t } = useTranslations();

    const eligibleField = useFormField<PermissionsData, 'eligibleVoters'>('eligibleVoters', {
        label: t('app.governance.createProcessForm.permissions.eligibleVoters.label'),
        defaultValue: 'bodies',
    });

    const allBodies: Body[] = useMemo(
        () => getValues('stages')?.flatMap((stage: { bodies: Body[] }) => stage.bodies || []) || [],
        [getValues],
    );

    const votingBodyField = useFormField<PermissionsData, 'selectedBodies'>('selectedBodies', {
        defaultValue: allBodies ?? [],
        rules: {
            // if bodies are selected, at least one body must be selected for the user to continue
            validate: eligibleField.value === 'bodies' ? (value) => value.length > 0 : undefined,
        },
    });

    const onEligibleFieldChange = (value: string) => {
        eligibleField.onChange(value);
        if (value === 'bodies') {
            setValue('selectedBodies', allBodies);
            trigger('selectedBodies');
        }
    };

    return (
        <>
            <RadioGroup className="flex gap-4 md:!flex-row" onValueChange={onEligibleFieldChange} {...eligibleField}>
                <RadioCard
                    className="w-full"
                    label={t('app.governance.createProcessForm.permissions.eligibleVoters.bodiesLabel')}
                    description={t('app.governance.createProcessForm.permissions.eligibleVoters.bodiesDescription')}
                    value="bodies"
                />
                <RadioCard
                    className="w-full"
                    label={t('app.governance.createProcessForm.permissions.eligibleVoters.anyLabel')}
                    description={t('app.governance.createProcessForm.permissions.eligibleVoters.anyDescription')}
                    value="any"
                />
            </RadioGroup>
            {eligibleField.value === 'bodies' && (
                <InputContainer
                    id="votingBodies"
                    label={t('app.governance.createProcessForm.permissions.votingBodies.label')}
                    useCustomWrapper={true}
                    {...votingBodyField}
                >
                    {allBodies &&
                        allBodies.map((body: Body) => (
                            <VotingBodyCheckboxCard
                                values={votingBodyField.value}
                                key={body.bodyNameField}
                                body={body}
                            />
                        ))}
                </InputContainer>
            )}
        </>
    );
};
