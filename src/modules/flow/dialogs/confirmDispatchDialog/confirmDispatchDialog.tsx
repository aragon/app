'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { FlowAddressLabel } from '../../components/flowPrimitives/flowAddressLabel';
import { FlowBlockieAvatar } from '../../components/flowPrimitives/flowBlockieAvatar';
import { FlowTokenChip } from '../../components/flowPrimitives/flowTokenChip';
import type { IFlowPolicy } from '../../types';
import {
    formatFlowAmount,
    formatFlowAmountWithToken,
} from '../../utils/flowFormatters';

export interface IConfirmDispatchDialogParams {
    policy: IFlowPolicy;
    onConfirm: () => void;
}

export interface IConfirmDispatchDialogProps
    extends IDialogComponentProps<IConfirmDispatchDialogParams> {}

export const ConfirmDispatchDialog: React.FC<IConfirmDispatchDialogProps> = (
    props,
) => {
    const { location } = props;

    invariant(
        location.params != null,
        'ConfirmDispatchDialog: required parameters must be set.',
    );

    const { policy, onConfirm } = location.params;
    const { close } = useDialogContext();

    const pending = policy.pending;
    const topRecipients = policy.recipients.slice(0, 3);

    // `onConfirm` is responsible for transitioning the dialog stack (replacing this
    // review step with the `DispatchTransactionDialog`). Calling `close()` here
    // would clobber the newly opened transaction dialog.
    const handleConfirm = () => {
        onConfirm();
    };

    const pendingAmount =
        pending != null
            ? formatFlowAmountWithToken(pending.amount, pending.token)
            : formatFlowAmountWithToken(0, policy.token);

    return (
        <>
            <Dialog.Header
                description="Review the pending dispatch before sending it on-chain."
                onClose={close}
                title={`Dispatch now · ${policy.name}`}
            />
            <Dialog.Content>
                <div className="flex flex-col gap-5 pb-4">
                    <div className="flex flex-col gap-2 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                        <span className="font-normal text-neutral-500 text-sm leading-tight">
                            Pending amount
                        </span>
                        <div className="flex flex-wrap items-baseline gap-2">
                            <span className="font-semibold text-2xl text-neutral-800 tabular-nums leading-tight md:text-3xl">
                                {pendingAmount}
                            </span>
                            <FlowTokenChip token={policy.token} />
                        </div>
                        <span className="font-normal text-neutral-500 text-sm leading-tight">
                            {policy.strategyLong} · {policy.recipientGroup}
                        </span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="font-semibold text-neutral-800 text-sm leading-tight">
                            Top recipients
                        </span>
                        <ul className="flex flex-col gap-2">
                            {topRecipients.map((recipient) => (
                                <li
                                    className="flex items-center gap-2"
                                    key={recipient.address}
                                >
                                    <FlowBlockieAvatar
                                        address={recipient.address}
                                        size={24}
                                    />
                                    <FlowAddressLabel
                                        address={recipient.address}
                                        className="min-w-0 flex-1"
                                        knownEns={recipient.ens}
                                        knownLabel={
                                            recipient.role != null
                                                ? recipient.name
                                                : undefined
                                        }
                                        knownRole={recipient.role}
                                        showSubtitle={false}
                                    />
                                    {recipient.pct != null &&
                                        pending != null && (
                                            <span className="font-normal text-neutral-500 text-sm tabular-nums leading-tight">
                                                ≈{' '}
                                                {formatFlowAmount(
                                                    pending.amount *
                                                        (recipient.pct / 100),
                                                    pending.token,
                                                )}{' '}
                                                {pending.token}
                                            </span>
                                        )}
                                </li>
                            ))}
                            {policy.recipientsMore > 0 && (
                                <li className="font-normal text-neutral-500 text-xs leading-tight">
                                    +{policy.recipientsMore} more ·{' '}
                                    {policy.recipientGroup}
                                </li>
                            )}
                        </ul>
                    </div>

                    <p className="font-normal text-neutral-500 text-xs leading-snug">
                        Dispatching submits an on-chain transaction calling{' '}
                        <code className="font-mono">dispatch()</code> on the
                        policy plugin.
                    </p>
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: 'Dispatch now',
                    onClick: handleConfirm,
                }}
                secondaryAction={{
                    label: 'Cancel',
                    onClick: () => close(),
                }}
            />
        </>
    );
};
