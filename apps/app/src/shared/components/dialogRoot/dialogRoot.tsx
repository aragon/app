'use client';

import {
    Dialog,
    DialogAlert,
    type IDialogRootProps as IGukDialogRootProps,
} from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import {
    type IDialogComponentDefinitions,
    useDialogContext,
} from '../dialogProvider';
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
    const { address, isConnecting, isReconnecting } = useWalletAccount();

    // Wallet-requiring dialogs read the address during render, so they must be unmounted from
    // here before a disconnect makes them throw.
    // Only close once wagmi settles: both 'connecting' (connector switch) and 'reconnecting'
    // (mount) blank the address for a moment without the wallet actually being gone.

    const missingAddress = address == null;
    const walletSettling = isConnecting || isReconnecting;
    const walletDisconnected = missingAddress && !walletSettling;

    useEffect(() => {
        if (!walletDisconnected) {
            return;
        }

        // Use the context close directly as custom onClose handlers might not pop the stack.
        for (const location of locations) {
            if (dialogs[location.id]?.requiresWallet) {
                close(location.id);
            }
        }
    }, [walletDisconnected, locations, dialogs, close]);

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
                    requiresWallet,
                    ...otherDialogProps
                } = dialogDefinition;

                // Unmount before the dialog renders without an address. While the wallet is
                // settling this only hides it; a real disconnect also pops it via the effect above.
                if (missingAddress && requiresWallet) {
                    return null;
                }

                const isAlertDialog = 'variant' in otherDialogProps;
                const { disableOutsideClick, modal, onClose } = location;

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

                const DialogWrapper = isAlertDialog
                    ? DialogAlert.Root
                    : Dialog.Root;
                const modalProps = isAlertDialog ? {} : { modal };
                const processedHiddenTitle = hiddenTitle
                    ? t(hiddenTitle)
                    : undefined;
                const processedHiddenDescription = hiddenDescription
                    ? t(hiddenDescription)
                    : undefined;
                const onOpenChange = isAlertDialog
                    ? undefined
                    : handleOpenChange;

                return (
                    <DialogWrapper
                        containerClassName={isTopmost ? undefined : 'hidden'}
                        hiddenDescription={processedHiddenDescription}
                        hiddenTitle={processedHiddenTitle}
                        key={`${location.id}-${String(index)}`}
                        {...modalProps}
                        onInteractOutside={handleInteractOutside}
                        onOpenChange={onOpenChange}
                        open={true}
                        {...otherDialogProps}
                    >
                        <ActiveDialogComponent location={location} />
                    </DialogWrapper>
                );
            })}
        </>
    );
};
