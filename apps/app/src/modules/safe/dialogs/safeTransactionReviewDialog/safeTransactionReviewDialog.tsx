'use client';

import {
    AlertInline,
    addressUtils,
    Dialog,
    invariant,
    Tag,
} from '@aragon/gov-ui-kit';
import { useQuery } from '@tanstack/react-query';
import type { Hex } from 'viem';
import { useBytecode, useReadContract } from 'wagmi';
import { smartContractService } from '@/modules/governance/api/smartContractService';
import type { Network } from '@/shared/api/daoService';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { safeCalldataUtils } from '../../utils/safeCalldataUtils';
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
     * Label of the action the owner confirms with, e.g. "Approve" for a governance report. Omit it
     * when the connected owner already confirmed, leaving this as a review-only dialog.
     */
    confirmLabel?: string;
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
 * `VERSION()` is a plain string getter present on every Safe singleton from 1.0.0 onward.
 */
const safeVersionAbi = [
    {
        inputs: [],
        name: 'VERSION',
        outputs: [{ type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

/**
 * The transaction service reports L2 singletons as `1.4.1+L2` while the contract's own `VERSION()`
 * returns the bare `1.4.1`, so a strict comparison would refuse signing on every L2 Safe. Only the
 * semver core selects the EIP-712 domain, so only the core is compared.
 */
const semverCore = (version: string): string => version.split('+')[0];

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

/**
 * Canonical MultiSend and MultiSendCallOnly deployments for Safe 1.3.0 and 1.4.1, lowercased for
 * comparison. Deterministic across the standard EVM chains this app supports.
 */
const knownDelegateTargets: Record<string, true> = {
    '0x38869bf66a61cf6bdb996a6ae40d5853fd43b526': true,
    '0x9641d764fc13c8b624c04430c7356c1c7c8102e2': true,
    '0xa238cbeb142c10ef7ad8442c6d1f9e89e07e7761': true,
    '0x40a2accbd92bca938b02010e17a5b8929b49130d': true,
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

    /**
     * The EIP-712 domain depends on the Safe's version, so whoever supplies the version chooses
     * which domain the hashes are computed under. Taking it from the same backend that supplied
     * the envelope and the reported hash makes a match a statement about one source's internal
     * consistency; reading `VERSION()` from the Safe removes that input from the trusted set (W11).
     *
     * The backend value is never a fallback. While this read is outstanding or failed the version
     * is simply unknown, which withholds the device pair exactly as a pre-1.3.0 Safe already does
     * - a hash computed under a domain the Safe never used fails against the device and teaches
     * signers to ignore mismatches.
     */
    const { data: chainVersion, isPending: isVersionPending } = useReadContract(
        {
            abi: safeVersionAbi,
            address: safeAddress as Hex,
            functionName: 'VERSION',
            chainId: networkDefinitions[network].id,
        },
    );
    const {
        verification,
        safeTxHash: computedHash,
        domainHash,
        messageHash,
    } = safeTransactionEnvelopeUtils.getVerificationHashes({
        transaction,
        safeAddress,
        safeVersion: chainVersion ?? null,
        chainId: BigInt(networkDefinitions[network].id),
    });

    /**
     * Two sources disagreeing about what the Safe is means the dialog cannot describe the payload
     * correctly, so this is the misdescription class rather than the uncertainty class: refuse and
     * show both values. An absent backend version is not a disagreement.
     */
    const isVersionMismatch =
        chainVersion != null &&
        safeVersion != null &&
        semverCore(chainVersion) !== semverCore(safeVersion);

    const { calls, isComplete } = collectCalls(
        safeTransactionEnvelopeUtils.getCall(transaction),
    );

    // Decoding is a readability aid, never an authorisation check - and the reason is stronger than
    // "a decode can fail": this decode is an Aragon backend call, so the friendly labels arrive
    // from the same trust domain as the envelope they describe. A backend that served a malicious
    // envelope can label it a benign transfer. The raw `to`/`value`/`data` below are unpacked
    // locally and are what a signer must actually check. Decoding offline from a bundled selector
    // set is W12; until then this stays a convenience, and the copy says so.
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

    /**
     * Local decode first (W12). The remote decode arrives from the same backend as the envelope it
     * describes, so a backend that served a malicious payload can also label it benignly; a
     * bundled governance selector set removes that input for the calls Aragon actually originates.
     * The remote answer is kept only for selectors outside that set, where it is strictly more
     * than nothing and the copy already frames decoding as a convenience.
     */
    const localNames = calls.map(({ call }) =>
        safeCalldataUtils.decodeFunctionName(call.data),
    );

    /**
     * Two decoders naming different functions for the same bytes means the label above the
     * calldata is wrong in one of them, and nothing here can say which. That is the
     * misdescription class, so it refuses rather than picking a winner.
     */
    const hasDecoderDisagreement = localNames.some((localName, index) =>
        safeCalldataUtils.disagrees(
            localName,
            decoded?.[index]?.inputData?.function,
        ),
    );

    /**
     * A delegate call runs in the Safe's own context: it can rewrite owners, threshold and the
     * singleton the Safe delegates to. Batching is the only reason an ordinary Aragon transaction
     * uses one, so a target that is not a canonical MultiSend deserves saying out loud - and this
     * needs no network read, so it holds for every call at every depth of the batch.
     *
     * Narrower than the equivalent check in `safe-tx-hashes-util`, whose Rule 2 pairs "always
     * independently decode and verify transaction calldata" with "don't sign untrusted delegate
     * calls" against a curated allowlist of trusted `delegatecall`able contracts. This recognises
     * MultiSend only, so a legitimate delegate call to any other audited helper is flagged
     * unrecognised. That is the safe direction to be wrong in - it warns rather than permits - but
     * it means the warning is about "not MultiSend", not about "not trusted".
     *
     * ponytail: canonical 1.3.0/1.4.1 addresses only. Chains with non-standard deployments (the
     * zkSync-style forks) would mislabel a legitimate MultiSend as unrecognised; widen from
     * `safe-deployments` if one of those networks is ever supported.
     */
    const delegateCalls = calls.filter(({ call }) => call.operation === 1);
    const hasUnrecognisedDelegateTarget = delegateCalls.some(
        ({ call }) => knownDelegateTargets[call.to.toLowerCase()] !== true,
    );

    /**
     * The sharper case, and the one that needs the chain: a delegate call to an address holding no
     * code succeeds and runs nothing. The Safe consumes the nonce, emits `ExecutionSuccess`, and
     * every call listed below never happens. Observed on sepolia at nonce 6 of the gate Safe - a
     * fully reviewed, correctly hashed, fully signed batch that did nothing at all.
     *
     * `useBytecode` is one address and hook-bound, so it reads the outer target: the one receiving
     * the Safe's context, and the only one whose emptiness voids the whole batch. An empty inner
     * delegate target wastes its own slot, and the unrecognised-target warning above already names
     * it, since an empty address is never a canonical MultiSend.
     */
    const outerCall = safeTransactionEnvelopeUtils.getCall(transaction);
    const isDelegateCall = outerCall.operation === 1;
    const {
        data: outerBytecode,
        isSuccess: isBytecodeKnown,
        isError: isBytecodeUnavailable,
    } = useBytecode({
        address: outerCall.to as Hex,
        chainId: networkDefinitions[network].id,
        query: { enabled: isDelegateCall },
    });
    const hasCodelessTarget =
        isDelegateCall && isBytecodeKnown && (outerBytecode ?? '0x') === '0x';

    /**
     * Until that read answers, a codeless target is indistinguishable from a legitimate one, so a
     * delegate call is refused while it is outstanding and if it fails outright. Without this the
     * gate is a race an owner wins by clicking quickly — `hasCodelessTarget` is false until the
     * node replies, which is exactly the window the check exists to cover. Failure is treated the
     * same way rather than optimistically: the whole batch's effect hangs on this one answer.
     */
    const isDelegateTargetUnresolved =
        isDelegateCall && (!isBytecodeKnown || isBytecodeUnavailable);
    const isHashMismatch = verification === SafeHashVerification.MISMATCH;

    /**
     * Refused rather than disclosed, because in these states what this dialog *says* is wrong, not
     * merely incomplete:
     *
     * - a hash mismatch means the fields and the identity they are stored under disagree, so
     *   nothing about the transaction can be signed;
     * - an incomplete batch means the calls listed below are a decoded prefix, and a prefix
     *   presented as the transaction understates what executing it does;
     * - a codeless delegate target means every call listed below never happens, while the Safe
     *   still spends the nonce and emits `ExecutionSuccess`;
     * - two decoders disagreeing about a call means its label is wrong in one of them;
     * - a version disagreement means the two sources describe different Safes.
     *
     * An unverifiable hash and an undecodable call stay signable on purpose: both are honest about
     * themselves — the fields are shown either way, and the owner can still read the calldata. A
     * gate there would lock owners out of legitimately exotic payloads, which §7.1 of the logic map
     * rules out: a narrow refusal must not become the only route to signing.
     */
    const isPayloadMisdescribed =
        isHashMismatch ||
        !isComplete ||
        hasCodelessTarget ||
        isDelegateTargetUnresolved ||
        isVersionMismatch ||
        hasDecoderDisagreement;

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
                {isVersionMismatch && (
                    <AlertInline
                        message={t(`${translationKey}.versionMismatch`, {
                            chainVersion,
                            reportedVersion: safeVersion,
                        })}
                        variant="critical"
                    />
                )}
                {hasDecoderDisagreement && (
                    <AlertInline
                        message={t(`${translationKey}.decoderDisagreement`)}
                        variant="critical"
                    />
                )}
                {/* While the version read is in flight the hash is not unverifiable, it is
                    unchecked - and this alert is one signers are being taught to take seriously,
                    so it must not appear and then retract a moment later. A resolved unknown
                    (failed read, or a Safe whose version cannot produce the hashes) still shows
                    it. */}
                {verification === SafeHashVerification.UNVERIFIABLE &&
                    !isVersionPending && (
                        <AlertInline
                            message={t(`${translationKey}.hashUnverifiable`)}
                            variant="warning"
                        />
                    )}
                {!isComplete && (
                    <AlertInline
                        message={t(`${translationKey}.incompleteBatch`)}
                        variant="critical"
                    />
                )}
                {hasCodelessTarget && (
                    <AlertInline
                        message={t(`${translationKey}.codelessDelegateCall`)}
                        variant="critical"
                    />
                )}
                {hasUnrecognisedDelegateTarget && !hasCodelessTarget && (
                    <AlertInline
                        message={t(
                            `${translationKey}.unrecognisedDelegateCall`,
                        )}
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
                {/*
                 * The values a signer compares somewhere this app does not control: the domain and
                 * message hashes against the hardware wallet's screen, the safeTxHash against an
                 * independent tool. Rendered in full and selectable - a truncated hash is
                 * checkable only at its ends, which is exactly where a grinding attacker makes it
                 * match.
                 *
                 * Deliberately never labelled verified, and never accompanied by a checkmark or
                 * green state. These are computed from an envelope and a Safe version this app
                 * received over the wire, so a self-consistent malicious payload produces hashes
                 * that match the device perfectly. The comparison catches a UI that displays one
                 * thing and sends another (Bybit, Feb 2025); it cannot catch a coherent lie. Any
                 * affirmation here would overstate what these values prove.
                 *
                 * The device pair is withheld when it cannot be derived exactly - below Safe
                 * v1.3.0 the EIP-712 domain has no chainId, and pre-1.1.0 the SafeTx struct
                 * itself differs - never approximated. The safeTxHash is still computed and
                 * shown in that case: protocol-kit handles the older domains, so an old-Safe
                 * signer can still cross-check it with an external tool that supports 0.1.0+,
                 * they just cannot complete the device comparison here.
                 */}
                <div className="flex flex-col gap-2 border-neutral-100 border-t pt-4">
                    <p className="text-neutral-500 text-sm">
                        {t(`${translationKey}.hashComparison`)}
                    </p>
                    <dl className="flex flex-col gap-2">
                        {domainHash != null && messageHash != null && (
                            <>
                                <SafeTransactionReviewHash
                                    label={t(
                                        `${translationKey}.fields.domainHash`,
                                    )}
                                    value={domainHash}
                                />
                                <SafeTransactionReviewHash
                                    label={t(
                                        `${translationKey}.fields.messageHash`,
                                    )}
                                    value={messageHash}
                                />
                            </>
                        )}
                        <SafeTransactionReviewHash
                            label={t(`${translationKey}.fields.safeTxHash`)}
                            value={computedHash ?? transaction.safeTxHash}
                        />
                    </dl>
                </div>
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
                                    {/* Local decode wins; a blank remote type is the service
                                        saying it could not decode, not a name. */}
                                    {localNames[index] ||
                                        decoded?.[index]?.inputData?.function ||
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
                primaryAction={
                    confirmLabel == null
                        ? undefined
                        : {
                              label: confirmLabel,
                              disabled: isPayloadMisdescribed,
                              onClick: handleConfirm,
                          }
                }
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

/**
 * A hash a signer must compare against a device, so it renders in full and stays selectable.
 * `break-all` rather than `truncate`: a partially shown hash is a hash that cannot be checked,
 * and the first and last characters matching is the exact weakness an attacker exploits.
 */
const SafeTransactionReviewHash: React.FC<{
    label: string;
    value: string;
}> = (props) => {
    const { label, value } = props;

    return (
        <div className="flex flex-col gap-0.5">
            <dt className="text-neutral-500 text-sm">{label}</dt>
            <dd className="break-all font-mono text-neutral-800 text-xs md:text-sm">
                {value}
            </dd>
        </div>
    );
};
