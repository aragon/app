'use client';

import {
    AlertInline,
    Button,
    DataListItem,
    DateFormat,
    formatterUtils,
    Icon,
    IconType,
    Link,
} from '@aragon/gov-ui-kit';
import { safeAppTransactionUrl } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import type { Network } from '@/shared/api/daoService';
import {
    type ISafeMultisigTransaction,
    isAragonProposalReport,
} from '@/shared/api/safeService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { SafeDialogId } from '../../constants';
import {
    SafeProposalReportLink,
    SafeTransactionCardLink,
} from './safeProposalReportLink';

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
 * A row of the Safe's shared nonce queue. A single resolved Aragon report stretches its proposal
 * link across the card; multiple distinct reports stay as separate links. Transactions without a
 * resolved report use the Safe app as their card destination.
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

    const safeAppLink = safeAppTransactionUrl({
        network,
        address: safeAddress,
        safeTxHash,
    });

    const associatedReports = (aragonReports ?? [])
        .filter(isAragonProposalReport)
        .filter(
            (report, index, reports) =>
                reports.findIndex(
                    (candidate) =>
                        candidate.daoId === report.daoId &&
                        candidate.bodyId === report.bodyId &&
                        candidate.proposalId === report.proposalId,
                ) === index,
        );

    const queuedDate = formatterUtils.formatDate(transaction.submissionDate, {
        format: isMounted ? DateFormat.RELATIVE : DateFormat.YEAR_MONTH_DAY,
    });
    const queuedLabel = t('app.safe.safePendingTransactionList.item.queuedOn', {
        date: queuedDate,
    });
    const confirmationLabel = t(
        'app.safe.safePendingTransactionList.item.confirmations',
        {
            count: confirmations.length,
            required: requiredConfirmations,
        },
    );

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
        <DataListItem className="relative flex flex-col gap-3 py-3 md:py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex min-w-0 flex-row items-center gap-2">
                        {associatedReports.length === 0 ? (
                            <SafeTransactionCardLink href={safeAppLink} />
                        ) : (
                            <div className="flex min-w-0 flex-row flex-wrap items-center gap-x-2 gap-y-1">
                                {associatedReports.map((report) => (
                                    <SafeProposalReportLink
                                        fallbackHref={safeAppLink}
                                        key={`${report.daoId}-${report.bodyId}-${report.proposalId}`}
                                        report={report}
                                        stretch={associatedReports.length === 1}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {safeAppLink == null ? (
                        <span className="text-neutral-500 text-sm leading-tight">
                            {queuedLabel}
                        </span>
                    ) : (
                        <Link
                            className="relative z-10 self-start"
                            href={safeAppLink}
                            isExternal={true}
                            showUrl={false}
                        >
                            {queuedLabel}
                        </Link>
                    )}
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
                </div>
                <div className="flex shrink-0 flex-row items-center gap-3">
                    <span
                        aria-label={confirmationLabel}
                        className="flex items-center gap-1 text-neutral-500 text-sm leading-tight md:text-base"
                        role="img"
                    >
                        <Icon
                            aria-hidden={true}
                            className="text-neutral-500"
                            icon={IconType.CHECKMARK}
                            size="sm"
                        />
                        <span aria-hidden={true}>
                            {t(
                                'app.safe.safePendingTransactionList.item.confirmationCount',
                                {
                                    count: confirmations.length,
                                    required: requiredConfirmations,
                                },
                            )}
                        </span>
                    </span>
                    <Button
                        className="relative z-10"
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
