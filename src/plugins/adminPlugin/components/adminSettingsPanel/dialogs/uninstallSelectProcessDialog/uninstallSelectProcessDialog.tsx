import { GovernanceDialog } from '@/modules/governance/constants/moduleDialogs';
import { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { DialogAlert, DialogAlertFooter } from '@aragon/gov-ui-kit';

export interface IUninstallSelectProcessDialogProps {
    daoId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const UninstallSelectProcessDialog: React.FC<IUninstallSelectProcessDialogProps> = (props) => {
    const { daoId, isOpen, onClose } = props;

    const { open } = useDialogContext();

    const params: ISelectPluginDialogParams = { daoId };

    const handleSelectProcessClick = () => {
        open(GovernanceDialog.SELECT_PLUGIN, { params });
        onClose();
    };

    return (
        <DialogAlert.Root open={isOpen} variant="critical">
            <DialogAlert.Header title="Remove all admins" />
            <DialogAlert.Content>
                <div className="flex flex-col gap-y-6">
                    <p>
                        You have to create and pass a proposal in another governance process to remove admin control
                        from the DAO.
                    </p>
                    <p>This should only be done when the DAO is ready and no longer requires admin control. </p>
                </div>
            </DialogAlert.Content>
            <DialogAlertFooter
                actionButton={{ label: 'Select process', onClick: handleSelectProcessClick }}
                cancelButton={{ label: 'Cancel', onClick: onClose }}
            />
        </DialogAlert.Root>
    );
};
