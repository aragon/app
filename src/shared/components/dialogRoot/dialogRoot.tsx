'use client';

import { Dialog, type IDialogRootProps as IGukDialogRootProps } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
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
        if (disableOutsideClick) {
            event.preventDefault();
        }
    };

    const handleOpenChange = () => {
        const closeFunction = onClose ?? close;
        closeFunction();
    };

    useEffect(() => {
        if (location == null) {
            const closeFunction = onClose ?? close;
            closeFunction();
        }
    }, [location, close, onClose]);

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
