import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { SetupBodyType } from '@/modules/createDao/dialogs/setupBodyDialog';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputContainer, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { GovernanceType, ProposalCreationMode, type ICreateProcessFormData } from '../createProcessFormDefinitions';

export interface ICreateProcessFormPermissionProps {}

export const CreateProcessFormPermissions: React.FC<ICreateProcessFormPermissionProps> = () => {
    const { t } = useTranslations();
    const { trigger } = useFormContext();

    const governanceType = useWatch<ICreateProcessFormData, 'governanceType'>({ name: 'governanceType' });
    const isAdvancedGovernance = governanceType === GovernanceType.ADVANCED;

    const basicProcessBody = useWatch<ICreateProcessFormData, 'body'>({ name: 'body' });
    const stages = useWatch<ICreateProcessFormData, 'stages'>({ name: 'stages' });

    const getBodyFormPrefix = (bodyIndex: number, stageIndex?: number) => {
        const basePrefix = `bodies.${bodyIndex.toString()}`;
        return stageIndex != null ? `stages.${stageIndex.toString()}.${basePrefix}` : 'body';
    };

    const processBodies = useMemo(() => {
        // we need to keep the original bodyIndex since EXTERNAL bodies are filtered out!
        const processedBodies = isAdvancedGovernance
            ? stages.flatMap((stage, stageIndex) =>
                  stage.bodies.map((body, index) => ({ ...body, stageIndex, bodyIndex: index })),
              )
            : [{ ...basicProcessBody, stageIndex: undefined, bodyIndex: 0 }];

        return processedBodies.filter((body) => body.type === SetupBodyType.NEW);
    }, [isAdvancedGovernance, stages, basicProcessBody]);

    const canBodiesCreateProposals = processBodies.some((body) => body.canCreateProposal);
    const createProposalsError = 'app.createDao.createProcessForm.permissions.proposalCreation.bodies.error';

    const { ANY_WALLET, LISTED_BODIES } = ProposalCreationMode;

    const {
        onChange: onModeChange,
        value: mode,
        alert: permissionsAlert,
        ...modeField
    } = useFormField<ICreateProcessFormData, 'proposalCreationMode'>('proposalCreationMode', {
        label: t('app.createDao.createProcessForm.permissions.proposalCreation.mode.label'),
        rules: {
            validate: (value) => (value !== ANY_WALLET && !canBodiesCreateProposals ? createProposalsError : undefined),
        },
        defaultValue: LISTED_BODIES,
    });

    // Trigger proposalCreationMode validation on allowed bodies selection change
    useEffect(() => {
        void trigger('proposalCreationMode');
    }, [trigger, canBodiesCreateProposals]);

    return (
        <>
            <RadioGroup className="flex gap-4 md:!flex-row" onValueChange={onModeChange} value={mode} {...modeField}>
                <RadioCard
                    className="min-w-0"
                    label={t('app.createDao.createProcessForm.permissions.proposalCreation.mode.bodiesLabel')}
                    description={t(
                        'app.createDao.createProcessForm.permissions.proposalCreation.mode.bodiesDescription',
                    )}
                    value={LISTED_BODIES}
                />
                <RadioCard
                    className="min-w-0"
                    label={t('app.createDao.createProcessForm.permissions.proposalCreation.mode.anyLabel')}
                    description={t('app.createDao.createProcessForm.permissions.proposalCreation.mode.anyDescription')}
                    value={ANY_WALLET}
                />
            </RadioGroup>
            <InputContainer
                id="proposalCreationBodies"
                label={t('app.createDao.createProcessForm.permissions.proposalCreation.bodies.label')}
                useCustomWrapper={true}
                className={mode === ANY_WALLET ? 'hidden' : ''}
                alert={permissionsAlert}
            >
                {processBodies.map((body) => (
                    <PluginSingleComponent
                        key={body.internalId}
                        pluginId={body.plugin}
                        slotId={CreateDaoSlotId.CREATE_DAO_PROPOSAL_CREATION_SETTINGS}
                        body={body}
                        mode={mode}
                        disableCheckbox={processBodies.length === 1}
                        formPrefix={getBodyFormPrefix(body.bodyIndex, body.stageIndex)}
                    />
                ))}
            </InputContainer>
        </>
    );
};
