import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { IWizardDetailsDialogStep, WizardDetailsDialog } from '@/shared/components/wizardDetailsDialog';
import { invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';

export interface ICreateProcessDetailsDialogParams {
    /**
     * ID of the DAO to create the governance process for.
     */
    daoId: string;
}

export interface ICreateProcessDetailsDialogProps extends IDialogComponentProps<ICreateProcessDetailsDialogParams> {}

export const CreateProcessDetailsDialog: React.FC<ICreateProcessDetailsDialogProps> = (props) => {
    const { location } = props;
    const { id } = location;

    invariant(location.params != null, 'CreateProcessInfoDialog: required parameters must be set.');
    const { daoId } = location.params;

    const { t } = useTranslations();

    const router = useRouter();

    const { check: checkWalletConnection, result: isConnected } = useConnectedWalletGuard({
        onSuccess: () => router.push('/create/dao'),
    });

    const steps: IWizardDetailsDialogStep[] = [
        {
            label: t('app.createDao.createProcessDetailsDialog.steps.describe'),
            icon: 'LABELS',
        },
        {
            label: t('app.createDao.createProcessDetailsDialog.steps.design'),
            icon: 'USERS',
        },
        {
            label: t('app.createDao.createProcessDetailsDialog.steps.designate'),
            icon: 'SETTINGS',
        },
    ];

    return (
        <WizardDetailsDialog
            title={t('app.createDao.createProcessDetailsDialog.title')}
            description={t('app.createDao.createProcessDetailsDialog.description')}
            steps={steps}
            actionLabel={t('app.createDao.createProcessDetailsDialog.actionLabel')}
            onActionClick={!isConnected ? checkWalletConnection : undefined}
            wizardLink={isConnected ? `/dao/${daoId}/create/process` : undefined}
            dialogId={id}
        />
    );
};
