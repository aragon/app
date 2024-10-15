'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { Wizard } from '@/shared/components/wizard';
import type { IWizardStepperStep } from '@/shared/components/wizard/wizardProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { useWatch } from 'react-hook-form';
import { CreateProposalForm, type ICreateProposalFormData } from '../../components/createProposalForm';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { CreateProposalWizardStep } from './createProposalPageDefinitions';

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
    const addActions = useWatch<ICreateProposalFormData>({ name: 'addActions' });

    const [metadataStep, actionsStep, settingsStep] = steps;

    // Hide settings step if plugin has no custom settings for create-proposal flow
    const { id: pluginId } = useDaoPlugins({ daoId, pluginAddress })![0];
    const slotId = GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM;
    const hideSettingsStep = pluginRegistryUtils.getSlotComponent({ slotId, pluginId }) == null;

    return (
        <>
            <Wizard.Step
                title={t(`app.governance.createProposalPage.steps.${CreateProposalWizardStep.METADATA}.title`)}
                description={t(
                    `app.governance.createProposalPage.steps.${CreateProposalWizardStep.METADATA}.description`,
                )}
                {...metadataStep}
            >
                <CreateProposalForm.Metadata />
            </Wizard.Step>
            <Wizard.Step
                title={t(`app.governance.createProposalPage.steps.${CreateProposalWizardStep.ACTIONS}.title`)}
                description={t(
                    `app.governance.createProposalPage.steps.${CreateProposalWizardStep.ACTIONS}.description`,
                )}
                hidden={addActions === false}
                {...actionsStep}
            >
                <CreateProposalForm.Actions daoId={daoId} />
            </Wizard.Step>
            <Wizard.Step
                title={t(`app.governance.createProposalPage.steps.${CreateProposalWizardStep.SETTINGS}.title`)}
                description={t(
                    `app.governance.createProposalPage.steps.${CreateProposalWizardStep.SETTINGS}.description`,
                )}
                hidden={hideSettingsStep}
                {...settingsStep}
            >
                <CreateProposalForm.Settings daoId={daoId} pluginAddress={pluginAddress} />
            </Wizard.Step>
        </>
    );
};
