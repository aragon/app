import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { ExitDialog } from '@/shared/components/exitDialog/exitDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { invariant } from '@aragon/ods';

export interface IPublishProposalExitDialogParams {
    /**
     * ID of the DAO where proposal creation is taking place.
     */
    daoId?: string;
    /**
     * Callback called when the user accepts the dialog.
     */
    onAccept?: () => void;
}

export interface IPublishProposalExitDialogProps extends IDialogComponentProps<IPublishProposalExitDialogParams> {}

export const PublishProposalExitDialog: React.FC<IPublishProposalExitDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'PublishProposalExitDialog: required parameters must be set.');
    const { daoId, onAccept } = location.params;

    const { t } = useTranslations();

    const { close } = useDialogContext();

    const handleAcceptAction = () => {
        if (onAccept != null) {
            onAccept();
        }
        close();
    };

    const acceptAction = {
        href: `/dao/${daoId}/proposals/`,
        onClick: handleAcceptAction,
        label: t('app.governance.publishProposalExitDialog.button.accept'),
    };

    const denyAction = {
        onClick: () => close(),
        label: t('app.governance.publishProposalExitDialog.button.deny'),
    };

    return (
        <ExitDialog
            title={t('app.governance.publishProposalDialog.title')}
            description={t('app.governance.publishProposalDialog.description')}
            acceptAction={acceptAction}
            denyAction={denyAction}
        />
    );
};
