import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { type IWizardDetailsDialogStep, WizardDetailsDialog } from '@/shared/components/wizardDetailsDialog';
import { invariant } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';

export interface ICreateProcessDetailsDialogParams {
    /**
     * URL of the DAO to create the governance process for.
     */
    daoUrl?: string;
    /**
     * Plugin address used to create a proposal for adding a new process.
     */
    pluginAddress?: Hex;
    /**
     * Callback function to be called when the get started action is clicked.
     */
    onActionClick?: () => void;
}

export interface ICreateProcessDetailsDialogProps extends IDialogComponentProps<ICreateProcessDetailsDialogParams> {}

export const CreateProcessDetailsDialog: React.FC<ICreateProcessDetailsDialogProps> = (props) => {
    const { location } = props;
    const { id } = location;

    invariant(location.params != null, 'CreateProcessDetailsDialog: required parameters must be set.');
    const { daoUrl, pluginAddress, onActionClick } = location.params;

    const { t } = useTranslations();

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
            onActionClick={onActionClick}
            wizardLink={pluginAddress && daoUrl ? `${daoUrl}/create/${pluginAddress}/process` : undefined}
            infoLink="https://docs.aragon.org/spp/1.x/index.html#staged_governance_processes"
            dialogId={id}
        />
    );
};
