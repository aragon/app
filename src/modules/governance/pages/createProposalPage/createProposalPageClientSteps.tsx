'use client';

import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { type IWizardStepperStep } from '@/shared/components/wizards/wizard';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { useFormContext, useWatch } from 'react-hook-form';
import { CreateProposalForm, type ICreateProposalFormData } from '../../components/createProposalForm';
import { useCreateProposalFormContext } from '../../components/createProposalForm/createProposalFormProvider';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { publishProposalDialogUtils } from '../../dialogs/publishProposalDialog/publishProposalDialogUtils';
import type { ISimulateActionsDialogParams } from '../../dialogs/simulateActionsDialog';
import { createProposalWizardId, CreateProposalWizardStep } from './createProposalPageDefinitions';

export interface ICreateProposalPageClientStepsProps {
    /**
     * Steps of the wizard.
     */
    steps: IWizardStepperStep[];
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Address of the plugin to create the proposal for.
     */
    pluginAddress: string;
}

export const CreateProposalPageClientSteps: React.FC<ICreateProposalPageClientStepsProps> = (props) => {
    const { steps, daoId, pluginAddress } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { trigger } = useFormContext();

    const addActions = useWatch<ICreateProposalFormData>({ name: 'addActions' });
    const actions = useWatch<ICreateProposalFormData['actions']>({ name: 'actions' });
    const { prepareActions } = useCreateProposalFormContext();

    const [metadataStep, actionsStep, settingsStep] = steps;

    // Hide settings step if plugin has no custom settings for create-proposal flow
    const { id: pluginId } = useDaoPlugins({ daoId, pluginAddress })![0];
    const slotId = GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM;
    const hideSettingsStep = pluginRegistryUtils.getSlotComponent({ slotId, pluginId }) == null;

    const handleSimulateActions = async () => {
        // Prevent running simulation if form is invalid.
        const isValid = await trigger();
        if (!isValid) {
            return;
        }

        const processedActions = await publishProposalDialogUtils.prepareActions({ actions, prepareActions });

        const { network } = daoUtils.parseDaoId(daoId);

        const params: ISimulateActionsDialogParams = {
            network,
            pluginAddress,
            actions: processedActions,
            formId: createProposalWizardId,
        };
        open(GovernanceDialogId.SIMULATE_ACTIONS, { params });
    };

    const getActionStepDropdownItems = () => {
        const labelBase = 'app.governance.createProposalPage.createProposalPageClientSteps';

        const { network } = daoUtils.parseDaoId(daoId);
        const { tenderlySupport } = networkDefinitions[network];

        const dropdownItems = [
            { label: t(`${labelBase}.simulate`), onClick: handleSimulateActions },
            { label: t(`${labelBase}.skipSimulation`), formId: createProposalWizardId },
        ];

        return actions.length > 0 && tenderlySupport ? dropdownItems : undefined;
    };

    return (
        <>
            <WizardPage.Step
                title={t(`app.governance.createProposalPage.steps.${CreateProposalWizardStep.METADATA}.title`)}
                description={t(
                    `app.governance.createProposalPage.steps.${CreateProposalWizardStep.METADATA}.description`,
                )}
                {...metadataStep}
            >
                <CreateProposalForm.Metadata />
            </WizardPage.Step>
            <WizardPage.Step
                title={t(`app.governance.createProposalPage.steps.${CreateProposalWizardStep.ACTIONS}.title`)}
                description={t(
                    `app.governance.createProposalPage.steps.${CreateProposalWizardStep.ACTIONS}.description`,
                )}
                hidden={addActions === false}
                nextDropdownItems={getActionStepDropdownItems()}
                {...actionsStep}
            >
                <CreateProposalForm.Actions daoId={daoId} pluginAddress={pluginAddress} />
            </WizardPage.Step>
            <WizardPage.Step
                title={t(`app.governance.createProposalPage.steps.${CreateProposalWizardStep.SETTINGS}.title`)}
                description={t(
                    `app.governance.createProposalPage.steps.${CreateProposalWizardStep.SETTINGS}.description`,
                )}
                hidden={hideSettingsStep}
                {...settingsStep}
            >
                <CreateProposalForm.Settings daoId={daoId} pluginAddress={pluginAddress} />
            </WizardPage.Step>
        </>
    );
};
