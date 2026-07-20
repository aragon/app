import { DialogAlert } from '@aragon/gov-ui-kit';

// The capture harness freezes the page clock, so framer-motion's dialog entry
// animation never progresses past its initial state (opacity 0, y 100, scale .88).
// Force the final "open" styles on the overlay + content containers via the
// kit's className hooks (!important beats framer-motion's inline styles).
const forceOpenStyles = (
    <style>
        {
            '.ds-force-open { opacity: 1 !important; transform: none !important; }'
        }
    </style>
);

export const Critical = () => (
    <>
        {forceOpenStyles}
        <DialogAlert.Root
            containerClassName="ds-force-open"
            open={true}
            overlayClassName="ds-force-open"
            size="md"
            useFocusTrap={false}
            variant="critical"
        >
            <DialogAlert.Header title="Delete proposal draft" />
            <DialogAlert.Content>
                <p className="pb-2 text-neutral-500">
                    The draft "Fund Q3 grants program with 250K USDC" will be
                    permanently deleted. This action cannot be undone.
                </p>
            </DialogAlert.Content>
            <DialogAlert.Footer
                actionButton={{ label: 'Delete draft' }}
                cancelButton={{ label: 'Keep draft' }}
            />
        </DialogAlert.Root>
    </>
);

export const Warning = () => (
    <>
        {forceOpenStyles}
        <DialogAlert.Root
            containerClassName="ds-force-open"
            open={true}
            overlayClassName="ds-force-open"
            size="md"
            useFocusTrap={false}
            variant="warning"
        >
            <DialogAlert.Header title="Unsaved changes" />
            <DialogAlert.Content>
                <p className="pb-2 text-neutral-500">
                    You have unsaved changes to the voting settings. Leaving now
                    will discard the updated support threshold and voting
                    duration.
                </p>
            </DialogAlert.Content>
            <DialogAlert.Footer
                actionButton={{ label: 'Discard changes' }}
                cancelButton={{ label: 'Continue editing' }}
            />
        </DialogAlert.Root>
    </>
);
