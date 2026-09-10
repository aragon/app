import {
    addressUtils,
    DataListItem,
    DateFormat,
    formatterUtils,
    Tag,
} from '@aragon/gov-ui-kit';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface ISafePendingTransactionListItemProps {
    /**
     * Pending transaction to be rendered.
     */
    transaction: ISafeMultisigTransaction;
}

export const SafePendingTransactionListItem: React.FC<
    ISafePendingTransactionListItemProps
> = (props) => {
    const { transaction } = props;
    const { nonce, safeTxHash, confirmations, confirmationsRequired } =
        transaction;

    const { t } = useTranslations();

    const submittedOn = formatterUtils.formatDate(transaction.submissionDate, {
        format: DateFormat.YEAR_MONTH_DAY,
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
            <span className="shrink-0 text-neutral-500 text-sm leading-tight md:text-base">
                {t('app.safe.safePendingTransactionList.item.confirmations', {
                    count: confirmations.length,
                    required: confirmationsRequired,
                })}
            </span>
        </DataListItem>
    );
};
