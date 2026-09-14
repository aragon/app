'use client';

import {
    AlertInline,
    addressUtils,
    Dialog,
    invariant,
    Tag,
} from '@aragon/gov-ui-kit';
import { useQuery } from '@tanstack/react-query';
import { smartContractService } from '@/modules/governance/api/smartContractService';
import type { Network } from '@/shared/api/daoService';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    type ISafeCall,
    maxSafeBatchDepth,
    SafeBatchStatus,
    SafeHashVerification,
    safeTransactionEnvelopeUtils,
} from '../../utils/safeTransactionEnvelopeUtils';

export interface ISafeTransactionReviewDialogParams {
    /**
     * Transaction the owner is asked to authorise, as reported by the Safe transaction service.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * Address of the Safe the transaction belongs to.
     */
    safeAddress: string;
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Contract version of the Safe, needed to recompute the transaction hash. Null while unknown,
     * which makes the hash unverifiable rather than wrong.
     */
    safeVersion: string | null;
    /**
     * Label of the action the owner confirms with, e.g. "Approve" for a governance report.
     */
    confirmLabel: string;
    /**
     * What the confirmation is claimed to do, when the caller knows. Shown above the payload so a
     * narrow claim sits next to the calls that back it.
     */
    intent?: string;
    /**
     * What confirming will cost the owner in wallet interactions, when the caller knows. A
     * signature is free, but a confirmation that completes the threshold is followed by an onchain
     * execution that is not — said before the first prompt rather than after it.
     */
    costNote?: string;
    /**
     * Called once the owner authorises this exact payload.
     */
    onConfirm: () => void;
}

export interface ISafeTransactionReviewDialogProps
    extends IDialogComponentProps<ISafeTransactionReviewDialogParams> {}

interface IReviewedCall {
    /**
     * Call as carried by the transaction.
     */
    call: ISafeCall;
    /**
     * Nesting level, 0 for the transaction itself.
     */
    depth: number;
}

const translationKey = 'app.safe.safeTransactionReviewDialog';

/**
 * Flattens a transaction into the calls it actually executes, depth first, and reports whether the
 * list is the whole story. A batch whose packed calls do not add up yields the prefix that did
 * unpack, and the caller is told so — a decoded prefix is not a reviewed transaction.
 */
const collectCalls = (
    call: ISafeCall,
    depth = 0,
): { calls: IReviewedCall[]; isComplete: boolean } => {
    const { status, calls: innerCalls } =
        safeTransactionEnvelopeUtils.inspectBatch(call.data);

    if (status === SafeBatchStatus.NOT_A_BATCH) {
        return { calls: [{ call, depth }], isComplete: true };
    }

    if (status === SafeBatchStatus.UNRECOGNIZED) {
        return { calls: [{ call, depth }], isComplete: false };
    }

    // The cap bounds a hostile payload. Stopping short is not a complete review either.
    if (depth >= maxSafeBatchDepth) {
        return { calls: [{ call, depth }], isComplete: false };
    }

    const collected = innerCalls.map((innerCall) =>
        collectCalls(innerCall, depth + 1),
    );

    return {
        calls: [{ call, depth }, ...collected.flatMap((entry) => entry.calls)],
        isComplete:
            status === SafeBatchStatus.COMPLETE &&
            collected.every((entry) => entry.isComplete),
    };
};

export const SafeTransactionReviewDialog: React.FC<
    ISafeTransactionReviewDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'SafeTransactionReviewDialog: required parameters must be set.',
    );

    const {
        transaction,
        safeAddress,
        network,
        safeVersion,
        confirmLabel,
        intent,
        costNote,
        onConfirm,
    } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const envelope = safeTransactionEnvelopeUtils.getEnvelope(transaction);
    const { verification, computedHash } =
        safeTransactionEnvelopeUtils.verifyTransactionHash({
            transaction,
            safeAddress,
            safeVersion,
            chainId: BigInt(networkDefinitions[network].id),
        });
    const { calls, isComplete } = collectCalls(
        safeTransactionEnvelopeUtils.getCall(transaction),
    );

    // Decoding is a readability aid, never an authorisation check: the raw calldata below is what
    // executes, so a failed or missing decode leaves the payload reviewable.
    const { data: decodedActions } = useQuery({
        queryKey: ['SAFE_TRANSACTION_DECODE', network, transaction.safeTxHash],
        queryFn: () =>
            smartContractService.decodeTransactionsLight({
                urlParams: { network },
                body: calls.map(({ call }) => ({
                    to: call.to,
                    value: call.value.toString(),
                    data: call.data ?? '0x',
                })),
            }),
    });

    /**
     * Decoded actions are matched to calls by position, so a response of a different length cannot
     * be trusted to line up: labelling call N with call M's function inside a consent surface is
     * worse than labelling nothing. Mirrors the raw-calldata downgrade in
     * `transactionDetailDialogUtils.getTransactionActions`.
     */
    const decoded =
        decodedActions?.length === calls.length ? decodedActions : undefined;

    const isHashMismatch = verification === SafeHashVerification.MISMATCH;

    const handleConfirm = () => {
        close(location.id);
        onConfirm();
    };

    return (
        <>
            <Dialog.Header
                onClose={() => close(location.id)}
                title={t(`${translationKey}.title`)}
            />
            <Dialog.Content className="pb-4 md:pb-6" description={intent}>
                {isHashMismatch && (
                    <AlertInline
                        message={t(`${translationKey}.hashMismatch`)}
                        variant="critical"
                    />
                )}
                {verification === SafeHashVerification.UNVERIFIABLE && (
                    <AlertInline
                        message={t(`${translationKey}.hashUnverifiable`)}
                        variant="warning"
                    />
                )}
                {!isComplete && (
                    <AlertInline
                        message={t(`${translationKey}.incompleteBatch`)}
                        variant="warning"
                    />
                )}
                <dl className="flex flex-col gap-3 pt-4">
                    <SafeTransactionReviewRow
                        label={t(`${translationKey}.fields.safe`)}
                        value={addressUtils.truncateAddress(safeAddress)}
                    />
                    <SafeTransactionReviewRow
                        label={t(`${translationKey}.fields.network`)}
                        value={networkDefinitions[network].name}
                    />
                    <SafeTransactionReviewRow
                        label={t(`${translationKey}.fields.nonce`)}
                        value={envelope.nonce}
                    />
                    <SafeTransactionReviewRow
                        label={t(`${translationKey}.fields.safeTxHash`)}
                        value={addressUtils.truncateHash(
                            computedHash ?? transaction.safeTxHash,
                        )}
                    />
                    <SafeTransactionReviewRow
                        label={t(`${translationKey}.fields.safeTxGas`)}
                        value={envelope.safeTxGas}
                    />
                    <SafeTransactionReviewRow
                        label={t(`${translationKey}.fields.baseGas`)}
                        value={envelope.baseGas}
                    />
                    <SafeTransactionReviewRow
                        label={t(`${translationKey}.fields.gasPrice`)}
                        value={envelope.gasPrice}
                    />
                    <SafeTransactionReviewRow
                        label={t(`${translationKey}.fields.gasToken`)}
                        value={addressUtils.truncateAddress(envelope.gasToken)}
                    />
                    <SafeTransactionReviewRow
                        label={t(`${translationKey}.fields.refundReceiver`)}
                        value={addressUtils.truncateAddress(
                            envelope.refundReceiver,
                        )}
                    />
                </dl>
                <ol className="flex flex-col gap-3 pt-4">
                    {calls.map(({ call, depth }, index) => (
                        <li
                            className="flex flex-col gap-1 border-neutral-100 border-t pt-3"
                            // Position identifies a call: the same target can legitimately appear
                            // more than once in a batch.
                            key={`${index.toString()}-${call.to}`}
                            style={{
                                marginLeft: `${(depth * 12).toString()}px`,
                            }}
                        >
                            <div className="flex flex-row items-center gap-2">
                                <Tag
                                    label={t(
                                        `${translationKey}.operation.${call.operation === 1 ? 'delegateCall' : 'call'}`,
                                    )}
                                    variant={
                                        call.operation === 1
                                            ? 'critical'
                                            : 'neutral'
                                    }
                                />
                                <span className="truncate text-neutral-800 text-sm md:text-base">
                                    {/* A blank type is the service saying it could not decode,
                                        not a name. */}
                                    {decoded?.[index]?.inputData?.function ||
                                        decoded?.[index]?.type ||
                                        t(`${translationKey}.unknownAction`)}
                                </span>
                            </div>
                            <span className="text-neutral-500 text-sm">
                                {t(`${translationKey}.callTarget`, {
                                    target: addressUtils.truncateAddress(
                                        call.to,
                                    ),
                                    value: call.value.toString(),
                                })}
                            </span>
                            <span className="break-all font-mono text-neutral-500 text-xs">
                                {call.data ?? '0x'}
                            </span>
                        </li>
                    ))}
                </ol>
                {costNote != null && (
                    <p className="pt-4 text-neutral-500 text-sm md:text-base">
                        {costNote}
                    </p>
                )}
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: confirmLabel,
                    disabled: isHashMismatch,
                    onClick: handleConfirm,
                }}
                secondaryAction={{
                    label: t(`${translationKey}.cancel`),
                    onClick: () => close(location.id),
                }}
            />
        </>
    );
};

const SafeTransactionReviewRow: React.FC<{
    label: string;
    value: string;
}> = (props) => {
    const { label, value } = props;

    return (
        <div className="flex flex-row items-baseline justify-between gap-4">
            <dt className="text-neutral-500 text-sm md:text-base">{label}</dt>
            <dd className="truncate text-neutral-800 text-sm md:text-base">
                {value}
            </dd>
        </div>
    );
};
