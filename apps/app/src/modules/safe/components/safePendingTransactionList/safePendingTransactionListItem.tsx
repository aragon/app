'use client';

import {
    addressUtils,
    Button,
    DataListItem,
    DateFormat,
    formatterUtils,
    Tag,
} from '@aragon/gov-ui-kit';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
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
    const { nonce, safeTxHash, confirmations, confirmationsRequired } =
        transaction;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { check: checkWalletConnection } = useConnectedWalletGuard();
    const { withNetworkSwitch } = useNetworkSwitch({ network });
    const { confirm, confirmError, execute, isConfirming, isExecuting } =
        useSafeTransactionActions({ network, safeAddress, chainId });
    const shouldExecute = confirmations.length >= confirmationsRequired;
    const actionTranslationKey = shouldExecute ? 'execute' : 'confirm';

    const submittedOn = formatterUtils.formatDate(transaction.submissionDate, {
        format: DateFormat.YEAR_MONTH_DAY,
    });
    const handleReviewClick = () =>
        open(SafeDialogId.TRANSACTION_REVIEW, {
            params: {
                transaction,
                safeAddress,
                network,
                safeVersion,
                confirmLabel: t(
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
        <DataListItem className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between md:py-5">
            <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-row items-center gap-2">
                    <Tag
                        label={t(
                            'app.safe.safePendingTransactionList.item.nonce',
                            { nonce },
                        )}
                        variant="neutral"
                    />
                    <span className="truncate text-base text-neutral-800 leading-tight md:text-lg">
                        {addressUtils.truncateHash(safeTxHash)}
                    </span>
                </div>
                <span className="text-neutral-500 text-sm leading-tight md:text-base">
                    {t('app.safe.safePendingTransactionList.item.submittedOn', {
                        date: submittedOn,
                    })}
                </span>
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
            {confirmError != null && (
                <span className="text-critical-500 text-sm">
                    {t(
                        `app.safe.safePendingTransactionList.item.${confirmError}`,
                    )}
                </span>
            )}
        </DataListItem>
    );
};
