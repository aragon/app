'use client';

import { Dialog, type IDialogRootProps as IGukDialogRootProps } from '@aragon/gov-ui-kit';
import { useDialogContext, type IDialogComponentDefinitions } from '../dialogProvider';
import { DialogRootHiddenElement } from './dialogRootHiddenElement';

export interface IDialogRootProps extends IGukDialogRootProps {
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
        <Dialog.Root {...props} open={isOpen} onOpenChange={close}>
            {activeDialog && (
                <>
                    <DialogRootHiddenElement labelKey={activeDialog.title} type="title" />
                    <DialogRootHiddenElement labelKey={activeDialog.description} type="description" />
                    <activeDialog.Component location={location!} />
                </>
            )}
        </Dialog.Root>
    );
};
