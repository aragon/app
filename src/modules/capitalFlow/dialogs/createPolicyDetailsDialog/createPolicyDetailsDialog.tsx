import { invariant } from '@aragon/gov-ui-kit';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { type IWizardDetailsDialogStep, WizardDetailsDialog } from '@/shared/components/wizardDetailsDialog';

export interface ICreatePolicyDetailsDialogParams {
    /**
     * Callback function to be called when the get started action is clicked.
     */
    onActionClick?: () => void;
}

export interface ICreatePolicyDetailsDialogProps extends IDialogComponentProps<ICreatePolicyDetailsDialogParams> {}

export const CreatePolicyDetailsDialog: React.FC<ICreatePolicyDetailsDialogProps> = (props) => {
    const { id, params } = props.location;

    invariant(params != null, 'CreatePolicyDetailsDialog: required parameters must be set.');
    const { onActionClick } = params;

    const { t } = useTranslations();

    const steps: IWizardDetailsDialogStep[] = [
        {
            label: t('app.capitalFlow.createPolicyDetailsDialog.steps.describe'),
            icon: 'LABELS',
        },
        {
            label: t('app.capitalFlow.createPolicyDetailsDialog.steps.configure'),
            icon: 'SETTINGS',
        },
    ];

    return (
        <WizardDetailsDialog
            actionLabel={t('app.capitalFlow.createPolicyDetailsDialog.actionLabel')}
            description={t('app.capitalFlow.createPolicyDetailsDialog.description')}
            dialogId={id}
            onActionClick={onActionClick}
            steps={steps}
            title={t('app.capitalFlow.createPolicyDetailsDialog.title')}
            wizardLink={undefined}
        />
    );
};
