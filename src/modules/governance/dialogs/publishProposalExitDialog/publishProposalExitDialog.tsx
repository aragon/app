import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { ExitDialog } from '@/shared/components/exitDialog/exitDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { invariant } from '@aragon/ods';

export interface IPublishProposalExitFormData {
    /**
     * Title of the proposal.
     */
    title: string;
    /**
     * Summary of the proposal.
     */
    description: string;
}

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

    const acceptAction = {
        href: `/dao/${daoId}/proposals/`,
        onClick: () => close(),
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
