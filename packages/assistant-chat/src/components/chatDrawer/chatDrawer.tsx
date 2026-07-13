import * as Dialog from '@radix-ui/react-dialog';

export interface IChatDrawerProps {
    /**
     * Whether the drawer is open.
     */
    isOpen: boolean;
    /**
     * Called when the drawer requests to close (esc, overlay click, close button).
     */
    onClose: () => void;
    /**
     * Content of the drawer panel.
     */
    children: React.ReactNode;
}

// Built on Radix Dialog directly: the gov-ui-kit DialogRoot is hardcoded to a centered modal and
// cannot render a side panel. The z-index tokens are the ones the host app already sets for
// gov-ui-kit dialogs, so no extra wiring is needed.
export const ChatDrawer: React.FC<IChatDrawerProps> = (props) => {
    const { isOpen, onClose, children } = props;

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    return (
        <Dialog.Root onOpenChange={handleOpenChange} open={isOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[var(--guk-dialog-overlay-z-index)] bg-gradient-to-t from-neutral-100/90 to-neutral-100/20 backdrop-blur-md" />
                <Dialog.Content
                    aria-describedby={undefined}
                    className="fixed inset-y-0 right-0 z-[var(--guk-dialog-content-z-index)] flex h-dvh w-full flex-col border-neutral-100 border-l bg-neutral-0 shadow-neutral-md md:w-[clamp(500px,30vw,640px)]"
                >
                    <Dialog.Title className="sr-only">
                        Aragon Support Assistant
                    </Dialog.Title>
                    {children}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
