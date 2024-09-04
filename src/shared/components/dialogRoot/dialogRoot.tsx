'use client';

import { Dialog, DialogAlert, type IDialogRootProps as IOdsDialogRootProps } from '@aragon/ods';
import { useDialogContext, type IDialogComponentDefinitions } from '../dialogProvider';
import { DialogAlertRootHiddenElement } from './dialogAlertRootHiddenElement';
import { DialogRootHiddenElement } from './dialogRootHiddenElement';

export interface IDialogRootProps extends IOdsDialogRootProps {
    /**
     * Dialogs of the application.
     */
    dialogs: Record<string, IDialogComponentDefinitions>;
}

export const DialogRoot: React.FC<IDialogRootProps> = (props) => {
    const { dialogs } = props;
    const { location, close } = useDialogContext();

    const isOpen = location != null;
    const activeDialog = location != null ? dialogs[location.id] : undefined;

    return (
        <>
            {activeDialog?.isAlert === true && (
                <DialogAlert.Root variant="warning" {...props} open={isOpen} onOpenChange={close}>
                    {activeDialog && (
                        <>
                            <DialogAlertRootHiddenElement labelKey={activeDialog.title} type="title" />
                            <DialogAlertRootHiddenElement labelKey={activeDialog.description} type="description" />
                            <activeDialog.Component location={location!} />
                        </>
                    )}
                </DialogAlert.Root>
            )}
            {activeDialog?.isAlert === false && (
                <Dialog.Root {...props} open={isOpen} onOpenChange={close}>
                    {activeDialog && (
                        <>
                            <DialogRootHiddenElement labelKey={activeDialog.title} type="title" />
                            <DialogRootHiddenElement labelKey={activeDialog.description} type="description" />
                            <activeDialog.Component location={location!} />
                        </>
                    )}
                </Dialog.Root>
            )}
        </>
    );
};
