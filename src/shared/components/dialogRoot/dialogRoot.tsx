'use client';

import { Dialog, DialogAlert, type IDialogRootProps as IGukDialogRootProps } from '@aragon/gov-ui-kit';
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

    const isAlertDialog = 'variant' in activeDialogProps;
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

    const DialogWrapper = isAlertDialog ? DialogAlert.Root : Dialog.Root;

    const processedHiddenTitle = hiddenTitle ? t(hiddenTitle) : undefined;
    const processedHiddenDescription = hiddenDescription ? t(hiddenDescription) : undefined;
    const onOpenChange = !isAlertDialog ? handleOpenChange : undefined;

    return (
        <DialogWrapper
            {...props}
            open={isOpen}
            onOpenChange={onOpenChange}
            onInteractOutside={handleInteractOutside}
            hiddenTitle={processedHiddenTitle}
            hiddenDescription={processedHiddenDescription}
            {...activeDialogProps}
        >
            {ActiveDialogComponent && <ActiveDialogComponent location={location!} />}
        </DialogWrapper>
    );
};
