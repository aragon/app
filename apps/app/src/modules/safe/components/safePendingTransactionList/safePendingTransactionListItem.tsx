'use client';

import {
    addressUtils,
    Button,
    DataListItem,
    DateFormat,
    formatterUtils,
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
    } = useSafeTransactionActions({ network, safeAddress, chainId });
    const shouldExecute = confirmations.length >= confirmationsRequired;
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
                confirmLabel: alreadyConfirmed
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
                    {/* Three states, per the backend contract: absent means the calldata is not a
                        recognised report, `[]` means reports decoded but none resolved (not yet
                        indexed, refused by the body check, or the correlation read failed), and a
                        populated array means resolved. Collapsing `[]` into absence would render a
                        governance report as an anonymous payload and discard what the backend
                        knows. Entries stay in calldata order, duplicates included, and each
                        carries its own `daoId` - so no DAO context is hoisted to the row. */}
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
                                required: confirmationsRequired,
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
                </div>
            </div>
            {confirmError != null && (
                <span className="text-critical-500 text-sm leading-tight">
                    {t(
                        `app.safe.safePendingTransactionList.item.${confirmError}`,
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
