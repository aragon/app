import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputContainer, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import {
    ProposalCreationMode,
    type ICreateProcessFormData,
    type ICreateProcessFormPermissions,
} from '../createProcessFormDefinitions';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';

export interface ICreateProcessFormPermissionProps {}

const validateProposalCreationBodies =
    (proposalCreationMode: ProposalCreationMode) =>
    (bodies: ICreateProcessFormPermissions['proposalCreationBodies']) => {
        if (proposalCreationMode === ProposalCreationMode.ANY_WALLET) {
            return true;
        }

        return bodies.length > 0 || 'app.createDao.createProcessForm.permissions.votingBodies.error';
    };

export const CreateProcessFormPermissions: React.FC<ICreateProcessFormPermissionProps> = () => {
    const { t } = useTranslations();
    const { setValue, trigger } = useFormContext();

    const processBodies = useWatch<ICreateProcessFormData, 'bodies'>({ name: 'bodies' });
    const defaultBodiesValue = useMemo(
        () => processBodies.map((body) => ({ bodyId: body.internalId })),
        [processBodies],
    );

    const {
        onChange: onProposalCreationModeChange,
        value: proposalCreationMode,
        ...proposalCreationModeField
    } = useFormField<ICreateProcessFormPermissions, 'proposalCreationMode'>('proposalCreationMode', {
        label: t('app.createDao.createProcessForm.permissions.proposalCreationMode.label'),
        fieldPrefix: 'permissions',
        defaultValue: ProposalCreationMode.LISTED_BODIES,
    });

    const proposalCreationBodiesName = 'permissions.proposalCreationBodies';
    const {
        fields: proposalCreationBodies,
        remove: removeProposalCreationBody,
        append: addProposalCreationBody,
    } = useFieldArray<ICreateProcessFormData, typeof proposalCreationBodiesName>({
        name: proposalCreationBodiesName,
        rules: { validate: validateProposalCreationBodies(proposalCreationMode) },
    });

    // Initialise proposalCreationBodies to all process bodies and update value on bodies list change
    useEffect(() => {
        setValue(proposalCreationBodiesName, defaultBodiesValue);
    }, [setValue, defaultBodiesValue]);

    const handleProposalCreationModeChange = (value: string) => {
        onProposalCreationModeChange(value);
        if (value === ProposalCreationMode.LISTED_BODIES) {
            setValue(proposalCreationBodiesName, defaultBodiesValue);
            void trigger(proposalCreationBodiesName);
        }
    };

    const handleBodyCheckboxChange = (bodyId: string, value: boolean) => {
        if (value) {
            addProposalCreationBody({ bodyId });
        } else {
            const checkedBodyIndex = proposalCreationBodies.findIndex((body) => body.bodyId === bodyId);
            removeProposalCreationBody(checkedBodyIndex);
        }
    };

    console.log('processBodies', processBodies);

    return (
        <>
            <RadioGroup
                className="flex gap-4 md:!flex-row"
                onValueChange={handleProposalCreationModeChange}
                value={proposalCreationMode}
                {...proposalCreationModeField}
            >
                <RadioCard
                    className="min-w-0"
                    label={t('app.createDao.createProcessForm.permissions.proposalCreationMode.bodiesLabel')}
                    description={t(
                        'app.createDao.createProcessForm.permissions.proposalCreationMode.bodiesDescription',
                    )}
                    value={ProposalCreationMode.LISTED_BODIES}
                />
                <RadioCard
                    className="min-w-0"
                    label={t('app.createDao.createProcessForm.permissions.proposalCreationMode.anyLabel')}
                    description={t('app.createDao.createProcessForm.permissions.proposalCreationMode.anyDescription')}
                    value={ProposalCreationMode.ANY_WALLET}
                />
            </RadioGroup>
            {proposalCreationMode === ProposalCreationMode.LISTED_BODIES && (
                <InputContainer
                    id="proposalCreationBodies"
                    label={t('app.createDao.createProcessForm.permissions.proposalCreationBodies.label')}
                    useCustomWrapper={true}
                >
                    {processBodies.map((body) => (
                        <PluginSingleComponent
                            key={body.internalId}
                            pluginId={body.plugin}
                            slotId={CreateDaoSlotId.CREATE_DAO_PROPOSAL_CREATION_REQUIREMENTS}
                            body={body}
                            onChange={handleBodyCheckboxChange}
                            checked={proposalCreationBodies.some(({ bodyId }) => body.internalId === bodyId)}
                            fieldPrefix={`${proposalCreationBodiesName}.${proposalCreationBodies.findIndex(({ bodyId }) => body.internalId === bodyId).toString()}`}
                        />
                    ))}
                </InputContainer>
            )}
        </>
    );
};
