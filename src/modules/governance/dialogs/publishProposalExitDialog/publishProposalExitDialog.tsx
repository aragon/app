import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { ExitDialog } from '@/shared/components/exitDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { invariant } from '@aragon/ods';

export interface IPublishProposalExitDialogParams {
    /**
     * ID of the DAO where proposal creation is taking place.
     */
    daoId?: string;
}

export interface IPublishProposalExitDialogProps extends IDialogComponentProps<IPublishProposalExitDialogParams> {}

export const PublishProposalExitDialog: React.FC<IPublishProposalExitDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'PublishProposalExitDialog: required parameters must be set.');
    const { daoId } = location.params;

    const { t } = useTranslations();

    const { close } = useDialogContext();

    const actionButton = {
        href: `/dao/${daoId}/proposals/`,
        onClick: () => close,
        label: t('app.governance.publishProposalExitDialog.button.accept'),
    };

    const cancelButton = {
        onClick: () => close,
        label: t('app.governance.publishProposalExitDialog.button.deny'),
    };

    return (
        <ExitDialog
            title={t('app.governance.publishProposalExitDialog.title')}
            description={t('app.governance.publishProposalExitDialog.description')}
            actionButton={actionButton}
            cancelButton={cancelButton}
        />
    );
};
