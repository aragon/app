import { invariant } from '@aragon/gov-ui-kit';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import type { ISetupStrategyForm } from './setupStrategyDialogDefinitions';
import { type ISetupStrategyDialogStepsProps, SetupStrategyDialogSteps } from './setupStrategyDialogSteps';

export interface ISetupStrategyDialogParams extends ISetupStrategyDialogStepsProps {
    /**
     * Callback called on submit.
     */
    onSubmit: (values: ISetupStrategyForm) => void;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface ISetupStrategyDialogProps extends IDialogComponentProps<ISetupStrategyDialogParams> {}

export const SetupStrategyDialog: React.FC<ISetupStrategyDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'SetupStrategyDialog: required parameters must be set.');
    const { onSubmit, initialValues, daoId } = location.params;

    const { t } = useTranslations();

    return (
        <WizardDialog.Container
            defaultValues={initialValues}
            formId="strategySetup"
            onSubmit={onSubmit}
            submitLabel={t('app.capitalFlow.setupStrategyDialog.submit')}
            title={t('app.capitalFlow.setupStrategyDialog.title')}
        >
            <SetupStrategyDialogSteps daoId={daoId} initialValues={initialValues} />
        </WizardDialog.Container>
    );
};
