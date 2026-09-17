'use client';

import {
    AlertInline,
    Button,
    DataListItem,
    DateFormat,
    formatterUtils,
    Link,
} from '@aragon/gov-ui-kit';
import { safeAppTransactionUrl } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import type { Network } from '@/shared/api/daoService';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { SafeDialogId } from '../../constants';
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
}

/**
 * A row of the Safe's shared nonce queue, read as high-level account context: what occupies the
 * nonce sequence, how far its confirmations stand, and where the transaction lives in the Safe
 * app. Signing stays in the proposal context that produced the transaction — a Safe can hold
 * transactions unrelated to any Aragon proposal, so this surface answers the Safe, not a
 * proposal.
 */
export const SafePendingTransactionListItem: React.FC<
    ISafePendingTransactionListItemProps
> = (props) => {
    const {
        transaction,
        safeAddress,
        network,
        safeVersion,
        threshold,
        currentNonce,
        hasNonceRival,
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
    const isMounted = useIsMounted();

    const requiredConfirmations = threshold ?? confirmationsRequired;
    const isFullySigned = confirmations.length >= requiredConfirmations;
    const isWaitingForTurn =
        isFullySigned &&
        currentNonce != null &&
        BigInt(nonce) !== BigInt(currentNonce);

    // Both targets when Aragon is detected, never one instead of the other: the queue is a
    // universal surface and a Safe can be reused anywhere, so the submitted line addresses the
    // Safe app — where an owner actually signs — and any correlated proposal is offered
    // alongside it. Undefined on a network with no Safe short name, where the line stays plain
    // text.
    const safeAppLink = safeAppTransactionUrl({
        network,
        address: safeAddress,
        safeTxHash,
    });

    // Relative time is computed against "now", so the server and client render different text —
    // the absolute date holds the line until mount.
    const queuedDate = formatterUtils.formatDate(transaction.submissionDate, {
        format: isMounted ? DateFormat.RELATIVE : DateFormat.YEAR_MONTH_DAY,
    });
    const queuedLabel = t('app.safe.safePendingTransactionList.item.queuedOn', {
        date: queuedDate,
    });

    const handleReviewClick = () =>
        open(SafeDialogId.TRANSACTION_REVIEW, {
            params: {
                transaction,
                safeAddress,
                network,
                safeVersion,
            },
        });

    return (
        <DataListItem className="flex flex-col gap-3 py-3 md:py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex min-w-0 flex-row items-center gap-2">
                        {/* Placeholder until the backend correlation lands: this surface cannot yet
                            name the proposal a row reports to — a Safe can be a body on several DAOs
                            or SPP processes, and one transaction can report to several proposals.
                            Once the indexer's `aragonReports` can route, the row names its proposal
                            and the whole row deep-links there. */}
                        <span className="truncate text-base text-neutral-800 leading-tight md:text-lg">
                            {t(
                                'app.safe.safePendingTransactionList.item.proposalTitle',
                            )}
                        </span>
                    </div>
                    {/* The queued line carries the transaction link: the Safe app is where
                        co-signer state lives, so its date text routes out externally. */}
                    <div className="flex min-w-0 flex-row items-center gap-2">
                        {safeAppLink == null ? (
                            <span className="text-neutral-500 text-sm leading-tight">
                                {queuedLabel}
                            </span>
                        ) : (
                            <Link
                                href={safeAppLink}
                                isExternal={true}
                                showUrl={false}
                                textClassName="text-sm leading-tight"
                            >
                                {queuedLabel}
                            </Link>
                        )}
                    </div>
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
                        onClick={handleReviewClick}
                        size="sm"
                        variant="secondary"
                    >
                        {t('app.safe.safePendingTransactionList.item.review')}
                    </Button>
                </div>
            </div>
        </DataListItem>
    );
};
