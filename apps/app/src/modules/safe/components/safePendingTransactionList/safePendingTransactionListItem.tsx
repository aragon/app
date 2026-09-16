'use client';

import {
    AlertInline,
    addressUtils,
    Button,
    DataListItem,
    DateFormat,
    Dropdown,
    formatterUtils,
    IconType,
    Link,
    Tag,
} from '@aragon/gov-ui-kit';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { safeAppTransactionUrl } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import type { Network } from '@/shared/api/daoService';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useNetworkSwitch } from '@/shared/hooks/useNetworkSwitch';
import { SafeDialogId } from '../../constants';
import type { SafeQueueSlotMode } from '../../dialogs/safeQueueSlotDialog';
import {
    type ISafeExecutionActionOutcome,
    useSafeTransactionActions,
} from '../../hooks/useSafeTransactionActions';
import { SafeProposalReportLink } from './safeProposalReportLink';

export interface ISafePendingTransactionListItemProps {
    /**
     * Pending transaction to be rendered.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * Address of the Safe holding the transaction.
     */
    safeAddress: string;
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Chain the Safe is deployed on, used to sign for the right network.
     */
    chainId: number;
    /**
     * Contract version of the Safe. Null while unknown, which leaves the transaction hash
     * unverifiable rather than wrong.
     */
    safeVersion: string | null;
    /**
     * Signing threshold read from the Safe itself, preferred over the response's
     * `confirmationsRequired` wherever this row states how many signatures are still needed.
     * Undefined until the Safe info resolves.
     */
    threshold?: number;
    /**
     * Current nonce of the Safe. A transaction executes only at this exact nonce, so anything
     * above it can be signed but not executed. Undefined until the Safe info resolves.
     */
    currentNonce?: string;
    /**
     * Another live transaction in the queue holds this same nonce, so at most one of them can ever
     * execute and the rest become permanently unexecutable.
     */
    hasNonceRival?: boolean;
    /**
     * This row is the transaction a proposal body card linked to. Named so the owner can find it
     * among unrelated account traffic; it says nothing about that proposal, because this surface
     * answers the Safe's nonce sequence and not any proposal's outcome.
     */
    isFollowed?: boolean;
    /**
     * Keeps an execution result visible after a successful execution removes the row.
     */
    onExecutionOutcome: (outcome: ISafeExecutionActionOutcome) => void;
}

export const SafePendingTransactionListItem: React.FC<
    ISafePendingTransactionListItemProps
> = (props) => {
    const {
        transaction,
        safeAddress,
        network,
        chainId,
        safeVersion,
        threshold,
        currentNonce,
        hasNonceRival,
        isFollowed,
        onExecutionOutcome,
    } = props;
    const {
        nonce,
        safeTxHash,
        confirmations,
        confirmationsRequired,
        aragonReports,
    } = transaction;
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { check: checkWalletConnection } = useConnectedWalletGuard();
    const { withNetworkSwitch } = useNetworkSwitch({ network });
    const {
        confirm,
        confirmError,
        submittedConfirmations,
        confirmationSyncTimedOut,
        refreshQueue,
        execute,
        isConfirming,
        isExecuting,
        removeFromQueue,
        isRemoving,
        removeError,
        replaceOnchain,
        isReplacing,
        replaceError,
    } = useSafeTransactionActions({ network, safeAddress, chainId });
    /**
     * The chain threshold decides, not the queue's `confirmationsRequired`. That field is
     * service-derived (upstream falls back to the Safe's latest status, then to the indexed
     * confirmation count) and sits outside the EIP-712 `SafeTx` struct, so no hash comparison can
     * detect a wrong value. Deflated, it flips this row to "Execute" and stops offering Confirm to
     * owners whose signature is still required; inflated, it keeps owners signing something that
     * has been executable for hours. Falls back to the reported value only until the Safe info
     * resolves.
     */
    const requiredConfirmations = threshold ?? confirmationsRequired;
    /**
     * A Safe executes strictly in nonce order: `execTransaction` reverts unless the transaction's
     * nonce equals the Safe's current one. Offering "Execute" on a fully signed row further up the
     * queue sends an owner to a wallet prompt for gas on a call that cannot succeed, so the action
     * is withheld until this row is the next one and the wait is stated instead.
     */
    const isNextInQueue =
        currentNonce != null && BigInt(nonce) === BigInt(currentNonce);
    const isFullySigned = confirmations.length >= requiredConfirmations;
    const shouldExecute = isFullySigned && isNextInQueue;
    const actionTranslationKey = shouldExecute ? 'execute' : 'confirm';
    const { address: connectedAddress } = useWalletAccount();
    const isConfirmedInQueue =
        connectedAddress != null &&
        confirmations.some(({ owner }) =>
            addressUtils.isAddressEqual(owner, connectedAddress),
        );
    // Only outstanding while the queue still omits it. Reconciliation can give up before the
    // backend catches up, and the list's own refresh then answers instead — at which point the
    // queue is the answer and saying "submitted, not visible yet" would be false.
    const isSubmitted =
        !isConfirmedInQueue &&
        connectedAddress != null &&
        submittedConfirmations.has(
            `${safeTxHash.toLowerCase()}:${connectedAddress.toLowerCase()}`,
        );
    // Held by the Safe either way: the queue returned it, or the service accepted it this session
    // and the queue has not caught up yet. Both mean this owner must not be asked to sign again.
    const alreadyConfirmed =
        !shouldExecute && (isSubmitted || isConfirmedInQueue);
    // Fully signed but not yet the Safe's turn: there is nothing left to sign and nothing that can
    // be executed, so no action is offered and the reason is stated below instead.
    const isWaitingForTurn = isFullySigned && !isNextInQueue;

    const submittedOn = formatterUtils.formatDate(transaction.submissionDate, {
        format: DateFormat.YEAR_MONTH_DAY,
    });
    // Both targets when Aragon is detected, never one instead of the other: the queue is a
    // universal surface and a Safe can be reused anywhere, so the hash always addresses the Safe
    // app — where an owner actually signs — and any correlated proposal is offered alongside it.
    // Undefined on a network with no Safe short name, where the row stays plain text.
    const safeAppLink = safeAppTransactionUrl({
        network,
        address: safeAddress,
        safeTxHash,
    });

    const handleReviewClick = () =>
        open(SafeDialogId.TRANSACTION_REVIEW, {
            params: {
                transaction,
                safeAddress,
                network,
                safeVersion,
                confirmLabel:
                    alreadyConfirmed || isWaitingForTurn
                        ? undefined
                        : t(
                              `app.safe.safePendingTransactionList.item.${actionTranslationKey}`,
                          ),
                // Reviewing needs no wallet; the guard and chain switch run on authorisation, so a
                // disconnected viewer still sees the payload before being asked to connect.
                onConfirm: () =>
                    checkWalletConnection({
                        onSuccess: () =>
                            withNetworkSwitch(() => {
                                if (shouldExecute) {
                                    void execute(transaction).then(
                                        onExecutionOutcome,
                                        () =>
                                            onExecutionOutcome({
                                                status: 'error',
                                                messageKey: 'error',
                                            }),
                                    );
                                } else {
                                    void confirm(transaction);
                                }
                            }),
                    }),
            },
        });

    /**
     * Routes out of this nonce slot, offered by eligibility rather than as a fallback chain (W2).
     *
     * Removal is the service's own record and the service accepts it only from the proposer, so
     * offering it to anyone else would spend a wallet prompt on a call that is refused. Replacement
     * is a real Safe transaction any owner can propose. Both cost and authority differ, so neither
     * is presented as "cancel" and the app never escalates silently from one to the other.
     */
    const canRemove =
        connectedAddress != null &&
        transaction.from != null &&
        addressUtils.isAddressEqual(transaction.from, connectedAddress);
    const isSlotActionBusy = isRemoving || isReplacing;

    const handleSlotAction = (mode: SafeQueueSlotMode) =>
        open(SafeDialogId.QUEUE_SLOT, {
            params: {
                mode,
                // The disclosure is worth reading while disconnected; the wallet is only needed
                // once the owner accepts it, exactly as the review dialog does.
                onConfirm: () =>
                    checkWalletConnection({
                        onSuccess: () =>
                            withNetworkSwitch(() => {
                                if (mode === 'remove') {
                                    void removeFromQueue(transaction);
                                } else {
                                    void replaceOnchain(transaction);
                                }
                            }),
                    }),
            },
        });

    return (
        <DataListItem className="flex flex-col gap-3 py-3 md:py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex min-w-0 flex-row items-center gap-2">
                        <span className="shrink-0">
                            <Tag
                                label={t(
                                    'app.safe.safePendingTransactionList.item.nonce',
                                    { nonce },
                                )}
                                variant="neutral"
                            />
                        </span>
                        {isFollowed === true && (
                            <span className="shrink-0">
                                <Tag
                                    label={t(
                                        'app.safe.safePendingTransactionList.item.followed',
                                    )}
                                    variant="info"
                                />
                            </span>
                        )}
                        {safeAppLink == null ? (
                            <span className="truncate text-base text-neutral-800 leading-tight md:text-lg">
                                {addressUtils.truncateHash(safeTxHash)}
                            </span>
                        ) : (
                            <Link
                                href={safeAppLink}
                                isExternal={true}
                                textClassName="truncate text-base leading-tight md:text-lg"
                            >
                                {addressUtils.truncateHash(safeTxHash)}
                            </Link>
                        )}
                    </div>
                    <span className="text-neutral-500 text-sm leading-tight md:text-base">
                        {t(
                            'app.safe.safePendingTransactionList.item.submittedOn',
                            {
                                date: submittedOn,
                            },
                        )}
                    </span>
                    {isWaitingForTurn && (
                        <span className="text-neutral-500 text-sm leading-tight">
                            {t(
                                'app.safe.safePendingTransactionList.item.waitingForTurn',
                                { currentNonce },
                            )}
                        </span>
                    )}
                    {hasNonceRival === true && (
                        <AlertInline
                            message={t(
                                'app.safe.safePendingTransactionList.item.nonceRival',
                            )}
                            variant="warning"
                        />
                    )}
                    {/* Three states, per the backend contract: absent means the calldata is not a
                        recognised report, `[]` means reports decoded but none resolved (not yet
                        indexed, refused by the body check, or the correlation read failed), and a
                        populated array means resolved. Collapsing `[]` into absence would render a
                        governance report as an anonymous payload and discard what the backend
                        knows. Entries stay in calldata order, duplicates included, and each
                        carries its own `daoId` - so no DAO context is hoisted to the row. */}
                    {/* The claim is attributed, not asserted (audit B2): the correlation is the
                        indexer's reading of the calldata, and this surface cannot check it. The
                        `proposalId` here is the backend's incremental id while the calldata carries
                        the contract's own, so closing the loop locally needs a mapping only the
                        backend holds - and the decoder that would read the rest lives in
                        `safeMultisigPlugin`, outside this SPP-agnostic module. Naming the source
                        is what keeps an informational link from reading as a verified one. */}
                    {aragonReports != null && aragonReports.length === 0 && (
                        <span className="text-neutral-500 text-sm leading-tight">
                            {t(
                                'app.safe.safePendingTransactionList.item.reportsToUnresolved',
                            )}
                        </span>
                    )}
                    {aragonReports != null && aragonReports.length > 0 && (
                        <div className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-neutral-500 text-sm leading-tight">
                                {t(
                                    'app.safe.safePendingTransactionList.item.reportsTo',
                                )}
                            </span>
                            {aragonReports.map((report, index) => (
                                <SafeProposalReportLink
                                    key={`${report.daoId}-${report.bodyId}-${report.proposalId}-${index}`}
                                    report={report}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex shrink-0 flex-row items-center gap-3">
                    <span className="text-neutral-500 text-sm leading-tight md:text-base">
                        {t(
                            'app.safe.safePendingTransactionList.item.confirmations',
                            {
                                count: confirmations.length,
                                required: requiredConfirmations,
                            },
                        )}
                    </span>
                    <Button
                        isLoading={isConfirming || isExecuting}
                        onClick={handleReviewClick}
                        size="sm"
                        variant="secondary"
                    >
                        {t('app.safe.safePendingTransactionList.item.review')}
                    </Button>
                    {/* A queued transaction holds a nonce no later transaction can skip, so the
                        routes out of the slot belong on the row that holds it. Grouped behind one
                        trigger because they are the secondary answer to "this is stuck", not the
                        action the row is for. */}
                    <Dropdown.Container
                        align="end"
                        constrainContentWidth={false}
                        customTrigger={
                            <Button
                                aria-label={t(
                                    'app.safe.safePendingTransactionList.item.moreActions',
                                )}
                                iconLeft={IconType.DOTS_VERTICAL}
                                isLoading={isSlotActionBusy}
                                size="sm"
                                variant="tertiary"
                            />
                        }
                    >
                        {canRemove && (
                            <Dropdown.Item
                                onClick={() => handleSlotAction('remove')}
                            >
                                {t(
                                    'app.safe.safePendingTransactionList.item.removeFromQueue',
                                )}
                            </Dropdown.Item>
                        )}
                        <Dropdown.Item
                            onClick={() => handleSlotAction('replace')}
                        >
                            {t(
                                'app.safe.safePendingTransactionList.item.replaceOnchain',
                            )}
                        </Dropdown.Item>
                    </Dropdown.Container>
                </div>
            </div>
            {confirmError != null && (
                <span className="text-critical-500 text-sm leading-tight">
                    {t(
                        `app.safe.safePendingTransactionList.item.${confirmError}`,
                    )}
                </span>
            )}
            {/* Said once, as a fact about the service rather than a disabled button: only the
                address that proposed a transaction can have the service forget it. Withheld from a
                disconnected viewer, for whom it would be noise on every row. */}
            {connectedAddress != null && !canRemove && (
                <span className="text-neutral-500 text-sm leading-tight">
                    {t(
                        'app.safe.safePendingTransactionList.item.removeProposerOnly',
                    )}
                </span>
            )}
            {(removeError ?? replaceError) != null && (
                <span className="text-critical-500 text-sm leading-tight">
                    {t(
                        `app.safe.safePendingTransactionList.item.${removeError ?? replaceError}`,
                    )}
                </span>
            )}
            {confirmError == null && isSubmitted && (
                <div className="flex flex-col items-start gap-2">
                    <span className="text-neutral-500 text-sm leading-tight">
                        {t(
                            `app.safe.safePendingTransactionList.item.${
                                confirmationSyncTimedOut
                                    ? 'submittedUnsynced'
                                    : 'submittedSyncing'
                            }`,
                        )}
                    </span>
                    {confirmationSyncTimedOut && (
                        <Button
                            onClick={refreshQueue}
                            size="sm"
                            variant="tertiary"
                        >
                            {t(
                                'app.safe.safePendingTransactionList.item.refresh',
                            )}
                        </Button>
                    )}
                </div>
            )}
        </DataListItem>
    );
};
