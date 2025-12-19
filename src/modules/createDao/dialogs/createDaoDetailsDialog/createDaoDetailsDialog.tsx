import { useRouter } from 'next/navigation';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    type IWizardDetailsDialogStep,
    WizardDetailsDialog,
} from '@/shared/components/wizardDetailsDialog';

export interface ICreateDaoDetailsDialogProps extends IDialogComponentProps {}

export const CreateDaoDetailsDialog: React.FC<ICreateDaoDetailsDialogProps> = (
    props,
) => {
    const { id } = props.location;

    const { t } = useTranslations();

    const router = useRouter();

    const { check: checkWalletConnection, result: isConnected } =
        useConnectedWalletGuard({
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
            actionLabel={t('app.createDao.createDaoDetailsDialog.actionLabel')}
            description={t('app.createDao.createDaoDetailsDialog.description')}
            dialogId={id}
            onActionClick={isConnected ? undefined : checkWalletConnection}
            steps={steps}
            title={t('app.createDao.createDaoDetailsDialog.title')}
            wizardLink={isConnected ? '/create/dao' : undefined}
        />
    );
};
