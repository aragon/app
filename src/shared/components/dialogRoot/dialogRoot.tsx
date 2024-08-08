'use client';

import { Dialog, type IDialogRootProps as IOdsDialogRootProps } from '@aragon/ods';
import { useDialogContext } from '../dialogProvider';

export interface IDialogRootProps extends IOdsDialogRootProps {}

export const DialogRoot: React.FC<IDialogRootProps> = (props) => {
    const { active, dialogs, close } = useDialogContext();

    const isOpen = active != null;
    const ActiveDialogComponent = active != null ? dialogs[active.id] : undefined;

    return (
        <Dialog.Root {...props} open={isOpen} onOpenChange={close}>
            {ActiveDialogComponent && <ActiveDialogComponent definition={active!} />}
        </Dialog.Root>
    );
};
