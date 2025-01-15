import { useTranslations } from '@/shared/components/translationsProvider';
import { type IWizardDetailsDialogStep, WizardDetailsDialog } from '@/shared/components/wizardDetailsDialog';

export interface ICreateDaoDetailsDialogProps {}

export const CreateDaoDetailsDialog: React.FC<ICreateDaoDetailsDialogProps> = () => {
    const { t } = useTranslations();

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
            wizardLink="/create/dao"
        />
    );
};
