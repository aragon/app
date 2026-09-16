'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';

/**
 * Which route out of the nonce slot the owner chose. Named after the mechanism rather than the
 * wish: removal and replacement differ in cost, in who must act and in whether anything is visible
 * onchain, so one "Cancel" would mislead whichever of the two the owner had in mind.
 */
export type SafeQueueSlotMode = 'remove' | 'replace';

export interface ISafeQueueSlotDialogParams {
    /**
     * Route the owner chose, which decides what this dialog has to disclose.
     */
    mode: SafeQueueSlotMode;
    /**
     * Called once the owner accepts the disclosed consequences.
     */
    onConfirm: () => void;
}

export interface ISafeQueueSlotDialogProps
    extends IDialogComponentProps<ISafeQueueSlotDialogParams> {}

const translationKey = 'app.safe.safeQueueSlotDialog';

/**
 * Discloses what a route out of a queued nonce slot actually does, before it is taken.
 *
 * Both routes are usually wanted for the same reason — the slot is blocked — and neither does what
 * "cancel" implies. Removal deletes the service's record and revokes nothing; replacement is a real
 * Safe transaction that consumes the nonce and needs the full threshold. That is stated here
 * because this is the last point before an owner spends a signature or gas on one of them.
 */
export const SafeQueueSlotDialog: React.FC<ISafeQueueSlotDialogProps> = (
    props,
) => {
    const { location } = props;

    invariant(
        location.params != null,
        'SafeQueueSlotDialog: required parameters must be set.',
    );

    const { mode, onConfirm } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const handleConfirm = () => {
        close(location.id);
        onConfirm();
    };

    return (
        <>
            <Dialog.Header
                onClose={() => close(location.id)}
                title={t(`${translationKey}.${mode}.title`)}
            />
            <Dialog.Content className="pb-4 md:pb-6">
                <p className="text-neutral-500 text-sm md:text-base">
                    {t(`${translationKey}.${mode}.body`)}
                </p>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(`${translationKey}.${mode}.confirm`),
                    onClick: handleConfirm,
                }}
                secondaryAction={{
                    label: t(`${translationKey}.dismiss`),
                    onClick: () => close(location.id),
                }}
            />
        </>
    );
};
