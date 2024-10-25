import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputContainer, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import type { ICreateProcessFormBody, ICreateProcessFormPermissions } from '../createProcessFormDefinitions';
import { VotingBodyCheckboxCard } from './components/votingBodyCheckboxCard';

export interface ICreateProcessFormPermissionProps {}

export const CreateProcessFormPermissions: React.FC<ICreateProcessFormPermissionProps> = () => {
    const { getValues, trigger, setValue } = useFormContext();

    const { t } = useTranslations();

    const eligibleField = useFormField<ICreateProcessFormPermissions, 'proposalCreation'>('proposalCreation', {
        label: t('app.governance.createProcessForm.permissions.eligibleVoters.label'),
        defaultValue: 'bodies',
    });

    const allBodies: ICreateProcessFormBody[] = useMemo(
        () => getValues('stages')?.flatMap((stage: { bodies: ICreateProcessFormBody[] }) => stage.bodies || []) || [],
        [getValues],
    );

    const votingBodyField = useFormField<ICreateProcessFormPermissions, 'proposalCreationBodies'>(
        'proposalCreationBodies',
        {
            defaultValue: allBodies.map((body) => ({ id: body.id, settings: {} })),
            rules: {
                // if bodies are selected, at least one body must be selected for the user to continue
                validate: eligibleField.value === 'bodies' ? (value) => value.length > 0 : undefined,
            },
            errorMessage: t('app.governance.createProcessForm.permissions.votingBodies.error'),
        },
    );

    const onEligibleFieldChange = (value: string) => {
        eligibleField.onChange(value);
        if (value === 'bodies') {
            setValue('proposalCreationBodies', allBodies);
            trigger('proposalCreationBodies');
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
                    {allBodies?.map((body) => (
                        <VotingBodyCheckboxCard key={body.id} values={votingBodyField.value} body={body} />
                    ))}
                </InputContainer>
            )}
        </>
    );
};
