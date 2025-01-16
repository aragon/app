import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { type IWizardDetailsDialogStep, WizardDetailsDialog } from '@/shared/components/wizardDetailsDialog';
import { useRouter } from 'next/navigation';

export interface ICreateDaoDetailsDialogProps {}

export const CreateDaoDetailsDialog: React.FC<ICreateDaoDetailsDialogProps> = () => {
    const { t } = useTranslations();
    const router = useRouter();

    const { check: checkWalletConnection, result: isConnected } = useConnectedWalletGuard({
        onSuccess: () => router.push('/create/dao'),
    });

    const steps: IWizardDetailsDialogStep[] = [
        {
            label: t('app.createDao.createDaoDetailsDialog.steps.network'),
            icon: 'CHAIN',
        },
        {
            label: t('app.createDao.createDaoDetailsDialog.steps.describe'),
            icon: 'DATABASE',
        },
    ];

    return (
        <WizardDetailsDialog
            title={t('app.createDao.createDaoDetailsDialog.title')}
            description={t('app.createDao.createDaoDetailsDialog.description')}
            steps={steps}
            actionLabel={t('app.createDao.createDaoDetailsDialog.actionLabel')}
            onActionClick={!isConnected ? checkWalletConnection : undefined}
            wizardLink={isConnected ? '/create/dao' : undefined}
        />
    );
};
