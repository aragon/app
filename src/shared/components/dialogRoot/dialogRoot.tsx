'use client';

import { Dialog, type IDialogRootProps as IGukDialogRootProps } from '@aragon/gov-ui-kit';
import { useDialogContext, type IDialogComponentDefinitions } from '../dialogProvider';
import { useTranslations } from '../translationsProvider';

export interface IDialogRootProps extends IGukDialogRootProps {
    /**
     * Dialogs of the application.
     */
    dialogs: Record<string, IDialogComponentDefinitions>;
}

export const DialogRoot: React.FC<IDialogRootProps> = (props) => {
    const { dialogs } = props;

    const { t } = useTranslations();
    const { location, close } = useDialogContext();

    const isOpen = location != null;
    const activeDialog = location != null ? dialogs[location.id] : undefined;

    const {
        Component: ActiveDialogComponent,
        hiddenTitle,
        hiddenDescription,
        ...activeDialogProps
    } = activeDialog ?? {};

    const { disableOutsideClick, onClose } = location ?? {};

    const handleInteractOutside = (event: Event) => {
        const target = event.target as HTMLElement;

        const debugPanel = document.getElementById('debug-panel');
        const debugButton = document.getElementById('debug-button');

        const isInDebugPanel = debugPanel?.contains(target);
        const isInDebugButton = debugButton?.contains(target);

        if ((disableOutsideClick || isInDebugPanel || isInDebugButton) && event.cancelable) {
            event.preventDefault();
        }
    };

    const handleOpenChange = () => {
        const closeFunction = onClose ?? close;
        closeFunction();
    };

    return (
        <Dialog.Root
            {...props}
            open={isOpen}
            onOpenChange={handleOpenChange}
            onInteractOutside={handleInteractOutside}
            hiddenTitle={hiddenTitle ? t(hiddenTitle) : undefined}
            hiddenDescription={hiddenDescription ? t(hiddenDescription) : undefined}
            {...activeDialogProps}
        >
            {ActiveDialogComponent && <ActiveDialogComponent location={location!} />}
        </Dialog.Root>
    );
};
