import { DialogAlert, type IDialogAlertFooterAction } from '@aragon/ods';

export interface IExitDialogProps {
    /**
     * The title of the dialog.
     */
    title: string;
    /**
     * The description of the dialog.
     */
    description: string;
    /**
     * The label and action to be performed by the accept button.
     */
    acceptAction: IDialogAlertFooterAction;
    /**
     * The label and action to be performed by the cancel button.
     */
    denyAction: IDialogAlertFooterAction;
}

export const ExitDialog: React.FC<IExitDialogProps> = (props) => {
    const { title, description, acceptAction, denyAction } = props;

    return (
        <>
            <DialogAlert.Header title={title} />
            <DialogAlert.Content title={title} className="flex flex-col gap-6 pb-4 pt-6">
                <p className="font-normal leading-normal text-neutral-500">{description}</p>
            </DialogAlert.Content>
            <DialogAlert.Footer actionButton={acceptAction} cancelButton={denyAction} />
        </>
    );
};
