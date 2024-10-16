import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputContainer, RadioCard, RadioGroup } from '@aragon/ods';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { VotingBodyCheckboxCard } from './components/votingBodyCheckboxCard';
import type { Body, PermissionsData } from './createProcessFormPermissions.api';

export interface ICreateProcessFormPermissionProps {}

export const CreateProcessFormPermissions: React.FC<ICreateProcessFormPermissionProps> = () => {
    const { getValues } = useFormContext();

    const { t } = useTranslations();

    const eligibleField = useFormField<PermissionsData, 'eligibleVoters'>('eligibleVoters', {
        label: t('app.governance.createProcessForm.permissions.eligibleVoters.label'),
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
                    {bodies &&
                        bodies.map((body: Body, index: number) => (
                            <VotingBodyCheckboxCard values={votingBodyField.value} key={index} body={body} />
                        ))}
                </InputContainer>
            )}
        </>
    );
};
