'use client';

import { Dialog, DialogAlert, type IDialogRootProps as IGukDialogRootProps } from '@aragon/gov-ui-kit';
import { useDialogContext, type IDialogComponentDefinitions } from '../dialogProvider';
import { useTranslations } from '../translationsProvider';

export interface IDialogRootProps extends IGukDialogRootProps {
    /**
     * Dialogs of the application.
     */
    dialogs: Partial<Record<string, IDialogComponentDefinitions>>;
}

export const DialogRoot: React.FC<IDialogRootProps> = (props) => {
    const { dialogs } = props;

    const { t } = useTranslations();
    const { locations, close } = useDialogContext();

    // Render each dialog in the stack but only top one should be visible.
    // Non-visible dialogs should still be rendered in order to keep the state. Useful in parent-child dialog relationships.
    return (
        <>
            {locations.map((location, index) => {
                const isTopmost = index === locations.length - 1;
                const dialogDefinition = dialogs[location.id];

                if (dialogDefinition == null) {
                    return null;
                }

                const {
                    Component: ActiveDialogComponent,
                    hiddenTitle,
                    hiddenDescription,
                    ...otherDialogProps
                } = dialogDefinition;

                const isAlertDialog = 'variant' in otherDialogProps;
                const { disableOutsideClick, onClose } = location;

                const handleInteractOutside = (event: Event) => {
                    // Only handle interaction for the topmost dialog
                    if (!isTopmost) {
                        event.preventDefault();
                        return;
                    }

                    if (disableOutsideClick) {
                        event.preventDefault();
                    }
                };

                const handleOpenChange = () => {
                    const closeFunction = onClose ?? (() => close(location.id));
                    closeFunction();
                };

                const DialogWrapper = isAlertDialog ? DialogAlert.Root : Dialog.Root;

                const processedHiddenTitle = hiddenTitle ? t(hiddenTitle) : undefined;
                const processedHiddenDescription = hiddenDescription ? t(hiddenDescription) : undefined;
                const onOpenChange = !isAlertDialog ? handleOpenChange : undefined;

                return (
                    <DialogWrapper
                        key={`${location.id}-${String(index)}`}
                        open={true}
                        onOpenChange={onOpenChange}
                        onInteractOutside={handleInteractOutside}
                        hiddenTitle={processedHiddenTitle}
                        hiddenDescription={processedHiddenDescription}
                        containerClassName={isTopmost ? undefined : 'hidden'}
                        {...otherDialogProps}
                    >
                        <ActiveDialogComponent location={location} />
                    </DialogWrapper>
                );
            })}
        </>
    );
};
