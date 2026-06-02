import { useWatch } from 'react-hook-form';
import { useTranslations } from '../../../../shared/components/translationsProvider';
import { WizardPage } from '../../../../shared/components/wizards/wizardPage';
import {
    CreateExecuteActionsForm,
    type IExecuteActionsFormData,
} from '../../components/createExecuteActionsForm';
import {
    CreateExecuteActionsWizardStep,
    createExecuteActionsWizardSteps,
} from './createExecuteActionsPageDefinitions';

export interface ICreateExecuteActionsPageClientStepsProps {
    /**
     * ID of the DAO to execute actions on.
     */
    daoId: string;
}

export const CreateExecuteActionsPageClientSteps: React.FC<
    ICreateExecuteActionsPageClientStepsProps
> = (props) => {
    const { daoId } = props;
    const { t } = useTranslations();

    const actions = useWatch<
        Record<string, IExecuteActionsFormData['actions']>
    >({ name: 'actions' });
    const [actionsStep] = createExecuteActionsWizardSteps;

    return (
        <WizardPage.Step
            description={t(
                `app.governance.createExecuteActionsPage.steps.${CreateExecuteActionsWizardStep.ACTIONS}.description`,
            )}
            disableNext={actions?.length ? undefined : true}
            title={t(
                `app.governance.createExecuteActionsPage.steps.${CreateExecuteActionsWizardStep.ACTIONS}.title`,
            )}
            {...actionsStep}
        >
            <CreateExecuteActionsForm.Actions daoId={daoId} />
        </WizardPage.Step>
    );
};
