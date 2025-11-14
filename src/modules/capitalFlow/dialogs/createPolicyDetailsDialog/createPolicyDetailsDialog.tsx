import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { type IWizardDetailsDialogStep, WizardDetailsDialog } from '@/shared/components/wizardDetailsDialog';
import { useRouter } from 'next/navigation';

export interface ICreatePolicyDetailsDialogProps extends IDialogComponentProps {}

export const CreatePolicyDetailsDialog: React.FC<ICreatePolicyDetailsDialogProps> = (props) => {
    const { id } = props.location;

    const { t } = useTranslations();

    const router = useRouter();

    const { check: checkWalletConnection, result: isConnected } = useConnectedWalletGuard({
        onSuccess: () => router.push('/create/policy'),
    });

    const steps: IWizardDetailsDialogStep[] = [
        {
            label: t('app.capitalFlow.createPolicyDetailsDialog.steps.network'),
            icon: 'CHAIN',
        },
        {
            label: t('app.capitalFlow.createPolicyDetailsDialog.steps.describe'),
            icon: 'DATABASE',
        },
    ];

    return (
        <WizardDetailsDialog
            title={t('app.capitalFlow.createPolicyDetailsDialog.title')}
            description={t('app.capitalFlow.createPolicyDetailsDialog.description')}
            steps={steps}
            actionLabel={t('app.capitalFlow.createPolicyDetailsDialog.actionLabel')}
            onActionClick={!isConnected ? checkWalletConnection : undefined}
            wizardLink={isConnected ? '/create/policy' : undefined}
            dialogId={id}
        />
    );
};
