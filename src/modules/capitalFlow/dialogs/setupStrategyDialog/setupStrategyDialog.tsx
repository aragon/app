import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { invariant } from '@aragon/gov-ui-kit';
import { RouterType, StrategyType, type ISetupStrategyForm } from './setupStrategyDialogDefinitions';
import { SetupStrategyDialogSteps, type ISetupStrategyDialogStepsProps } from './setupStrategyDialogSteps';

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

    const handleSubmit = (values: ISetupStrategyForm) => {
        // Filter out empty router addresses for MULTI_DISPATCH
        if (values.type === StrategyType.CAPITAL_ROUTER && values.routerType === RouterType.MULTI_DISPATCH) {
            const filteredAddresses = values.distributionMultiDispatch.routerAddresses.filter(
                (router) => router.address && router.address.trim() !== '',
            );

            const processedValues: ISetupStrategyForm = {
                ...values,
                distributionMultiDispatch: {
                    routerAddresses: filteredAddresses,
                },
            };

            onSubmit(processedValues);
        } else {
            onSubmit(values);
        }
    };

    return (
        <WizardDialog.Container
            title={t('app.capitalFlow.setupStrategyDialog.title')}
            formId="strategySetup"
            onSubmit={handleSubmit}
            defaultValues={initialValues}
            submitLabel={t('app.capitalFlow.setupStrategyDialog.submit')}
        >
            <SetupStrategyDialogSteps initialValues={initialValues} daoId={daoId} />
        </WizardDialog.Container>
    );
};
