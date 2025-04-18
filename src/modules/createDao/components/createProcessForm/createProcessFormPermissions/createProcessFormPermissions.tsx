import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputContainer, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { GovernanceType, ProposalCreationMode, type ICreateProcessFormData } from '../createProcessFormDefinitions';

export interface ICreateProcessFormPermissionProps {}

export const CreateProcessFormPermissions: React.FC<ICreateProcessFormPermissionProps> = () => {
    const { t } = useTranslations();
    const { trigger } = useFormContext();

    const governanceType = useWatch<ICreateProcessFormData, 'governanceType'>({ name: 'governanceType' });
    const simpleProcessBodies = useWatch<ICreateProcessFormData, 'bodies'>({ name: 'bodies' });

    const stages = useWatch<ICreateProcessFormData, 'stages'>({ name: 'stages' });
    const stageBodies = stages.flatMap((stage) => stage.bodies);

    const isAdvancedGovernance = governanceType === GovernanceType.ADVANCED;
    const activeBodies = isAdvancedGovernance ? stageBodies : simpleProcessBodies;

    const canBodiesCreateProposals = activeBodies.some((body) => body.canCreateProposal);
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

    const getPluginCardProps = (body: ISetupBodyForm, bodyIndex: number, stageIndex?: number) => {
        const { plugin: pluginId } = body;
        const slotId = CreateDaoSlotId.CREATE_DAO_PROPOSAL_CREATION_SETTINGS;
        const disableCheckbox = activeBodies.length === 1;

        const baseFormPrefix = `bodies.${bodyIndex.toString()}`;
        const formPrefix = stageIndex ? `stages.${stageIndex.toString()}.${baseFormPrefix}` : baseFormPrefix;

        return { pluginId, slotId, body, mode, disableCheckbox, formPrefix };
    };

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
                {isAdvancedGovernance &&
                    stages.map((stage, stageIndex) =>
                        stage.bodies.map((body, bodyIndex) => (
                            <PluginSingleComponent
                                key={body.internalId}
                                {...getPluginCardProps(body, bodyIndex, stageIndex)}
                            />
                        )),
                    )}

                {!isAdvancedGovernance &&
                    simpleProcessBodies.map((body, index) => (
                        <PluginSingleComponent key={body.internalId} {...getPluginCardProps(body, index)} />
                    ))}
            </InputContainer>
        </>
    );
};
