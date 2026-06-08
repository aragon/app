'use client';

import { useWatch } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import {
    CreateProposalForm,
    type ICreateProposalFormData,
} from '../../components/createProposalForm';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { useSimulateActionsDropdown } from '../../hooks/useSimulateActionsDropdown';
import {
    CreateProposalWizardStep,
    createProposalWizardId,
} from './createProposalPageDefinitions';

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

export const CreateProposalPageClientSteps: React.FC<
    ICreateProposalPageClientStepsProps
> = (props) => {
    const { steps, daoId, pluginAddress } = props;

    const { t } = useTranslations();

    const addActions = useWatch<ICreateProposalFormData>({
        name: 'addActions',
        defaultValue: true,
    });

    const [metadataStep, actionsStep, settingsStep] = steps;

    const { id: pluginId } = useDaoPlugins({
        daoId,
        pluginAddress,
        includeLinkedAccounts: true,
    })![0];
    const slotId = GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM;
    const hideSettingsStep =
        pluginRegistryUtils.getSlotComponent({ slotId, pluginId }) == null;

    const simulateDropdownItems = useSimulateActionsDropdown({
        daoId,
        from: pluginAddress,
        formId: createProposalWizardId,
    });

    return (
        <>
            <WizardPage.Step
                description={t(
                    `app.governance.createProposalPage.steps.${CreateProposalWizardStep.METADATA}.description`,
                )}
                title={t(
                    `app.governance.createProposalPage.steps.${CreateProposalWizardStep.METADATA}.title`,
                )}
                {...metadataStep}
            >
                <CreateProposalForm.Metadata />
            </WizardPage.Step>
            <WizardPage.Step
                description={t(
                    `app.governance.createProposalPage.steps.${CreateProposalWizardStep.ACTIONS}.description`,
                )}
                hidden={addActions === false}
                nextDropdownItems={simulateDropdownItems}
                title={t(
                    `app.governance.createProposalPage.steps.${CreateProposalWizardStep.ACTIONS}.title`,
                )}
                {...actionsStep}
            >
                <CreateProposalForm.Actions
                    daoId={daoId}
                    pluginAddress={pluginAddress}
                />
            </WizardPage.Step>
            <WizardPage.Step
                description={t(
                    `app.governance.createProposalPage.steps.${CreateProposalWizardStep.SETTINGS}.description`,
                )}
                hidden={hideSettingsStep}
                title={t(
                    `app.governance.createProposalPage.steps.${CreateProposalWizardStep.SETTINGS}.title`,
                )}
                {...settingsStep}
            >
                <CreateProposalForm.Settings
                    daoId={daoId}
                    pluginAddress={pluginAddress}
                />
            </WizardPage.Step>
        </>
    );
};
