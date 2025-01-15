import { useTranslations } from '@/shared/components/translationsProvider';
import { type IWizardDetailsDialogStep, WizardDetailsDialog } from '@/shared/components/wizardDetailsDialog';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useRouter } from 'next/navigation';
import { useDialogContext } from '@/shared/components/dialogProvider';

export interface ICreateDaoDetailsDialogProps {}

export const CreateDaoDetailsDialog: React.FC<ICreateDaoDetailsDialogProps> = () => {
    const { t } = useTranslations();
    const { check, result: isConnected } = useConnectedWalletGuard();
    const { close } = useDialogContext();

    const router = useRouter();

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

    const onPrimaryButtonClick = () => {
        if (!isConnected) {
            check({
                onSuccess: () => {
                    router.push('/create/dao');
                },
                onError: () => {
                    router.push('/');
                },
            });
        } else {
            router.push('/create/dao');
            close();
        }
    };

    return (
        <WizardDetailsDialog
            title={t('app.createDao.createDaoDetailsDialog.title')}
            description={t('app.createDao.createDaoDetailsDialog.description')}
            steps={steps}
            actionLabel={t('app.createDao.createDaoDetailsDialog.actionLabel')}
            onPrimaryButtonClick={onPrimaryButtonClick}
        />
    );
};
