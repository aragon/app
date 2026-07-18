import { Dialog } from '@aragon/gov-ui-kit';

// The capture harness freezes the page clock, so framer-motion's dialog entry
// animation never progresses past its initial state (opacity 0, y 100, scale .88).
// Force the final "open" styles on the overlay + content containers via the
// kit's className hooks (!important beats framer-motion's inline styles).
const forceOpenStyles = (
    <style>{'.ds-force-open { opacity: 1 !important; transform: none !important; }'}</style>
);

export const Default = () => (
    <>
        {forceOpenStyles}
        <Dialog.Root
            containerClassName="ds-force-open"
            modal={false}
            open={true}
            overlayClassName="ds-force-open"
            size="md"
            useFocusTrap={false}
        >
            <Dialog.Header
                description="Delegate your voting power to another member of the DAO. You can undelegate at any time."
                onClose={() => undefined}
                title="Delegate voting power"
            />
            <Dialog.Content>
                <div className="flex flex-col gap-3 pb-2">
                    <div className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3">
                        <span className="text-neutral-800">alice.eth</span>
                        <span className="text-neutral-500 text-sm">120.5K ANT</span>
                    </div>
                    <p className="text-neutral-500 text-sm">
                        Your 4,200 ANT voting power will count towards proposals voted on by alice.eth once the
                        delegation transaction is confirmed on-chain.
                    </p>
                </div>
            </Dialog.Content>
            <Dialog.Footer primaryAction={{ label: 'Delegate' }} secondaryAction={{ label: 'Cancel' }} />
        </Dialog.Root>
    </>
);

export const WizardFooter = () => (
    <>
        {forceOpenStyles}
        <Dialog.Root
            containerClassName="ds-force-open"
            modal={false}
            open={true}
            overlayClassName="ds-force-open"
            size="md"
            useFocusTrap={false}
        >
            <Dialog.Header onClose={() => undefined} title="Publish proposal" />
            <Dialog.Content description="Review the transaction details before publishing your proposal on-chain.">
                <div className="flex flex-col gap-2 pb-2">
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500 text-sm">Network</span>
                        <span className="text-neutral-800 text-sm">Ethereum Mainnet</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500 text-sm">Estimated gas fee</span>
                        <span className="text-neutral-800 text-sm">0.0042 ETH</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500 text-sm">Voting starts</span>
                        <span className="text-neutral-800 text-sm">Immediately after publishing</span>
                    </div>
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{ label: 'Publish proposal' }}
                secondaryAction={{ label: 'Back' }}
                variant="wizard"
            />
        </Dialog.Root>
    </>
);
