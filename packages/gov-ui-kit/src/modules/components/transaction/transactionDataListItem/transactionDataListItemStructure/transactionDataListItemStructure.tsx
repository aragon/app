import classNames from 'classnames';
import {
    AddressOutput,
    AvatarIcon,
    type AvatarIconVariant,
    addressUtils,
    DataList,
    DateFormat,
    formatterUtils,
    IconType,
    NumberFormat,
    Spinner,
} from '../../../../../core';
import { ChainEntityType, useBlockExplorer } from '../../../../hooks';
import { useGukModulesContext } from '../../../gukModulesProvider';
import {
    type ITransactionDataListItemProps,
    TransactionStatus,
    TransactionType,
} from './transactionDataListItemStructure.api';

const typeToIcon: Record<TransactionType, IconType> = {
    [TransactionType.DEPOSIT]: IconType.DEPOSIT,
    [TransactionType.WITHDRAW]: IconType.WITHDRAW,
    [TransactionType.ACTION]: IconType.BLOCKCHAIN_SMARTCONTRACT,
    [TransactionType.EXECUTION]: IconType.BLOCKCHAIN_SMARTCONTRACT,
};

const typeToIconVariant: Record<TransactionType, AvatarIconVariant> = {
    [TransactionType.DEPOSIT]: 'success',
    [TransactionType.WITHDRAW]: 'warning',
    [TransactionType.ACTION]: 'info',
    [TransactionType.EXECUTION]: 'info',
};

export const TransactionDataListItemStructure: React.FC<ITransactionDataListItemProps> = (props) => {
    const {
        chainId,
        tokenSymbol,
        tokenAmount,
        amountUsd,
        hideValue,
        label,
        actionCount,
        type = TransactionType.ACTION,
        status = TransactionStatus.PENDING,
        date,
        hash,
        className,
        ...otherProps
    } = props;

    const isExecution = type === TransactionType.EXECUTION;

    const { copy } = useGukModulesContext();
    const componentCopy = copy.transactionDataListItemStructure;
    const typeToHeading: Record<TransactionType, string> = {
        [TransactionType.DEPOSIT]: componentCopy.received,
        [TransactionType.WITHDRAW]: componentCopy.sent,
        [TransactionType.ACTION]: componentCopy.action,
        [TransactionType.EXECUTION]: componentCopy.executed,
    };

    const { buildEntityUrl } = useBlockExplorer({ chainId });

    const blockExplorerHref = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: hash });
    const processedHref = 'href' in otherProps && otherProps.href != null ? otherProps.href : blockExplorerHref;

    const formattedTokenAmount = formatterUtils.formatNumber(tokenAmount, { format: NumberFormat.TOKEN_AMOUNT_SHORT });
    const formattedTransactionValue = formatterUtils.formatNumber(amountUsd, {
        format: NumberFormat.FIAT_TOTAL_SHORT,
        fallback: '-',
    });

    const processedTokenAmount =
        type === TransactionType.ACTION || formattedTokenAmount == null
            ? '-'
            : `${formattedTokenAmount} ${tokenSymbol}`;

    // Executions display the executor label (a plugin name or a truncated address) and an action count instead of a
    // token amount; every other transaction type keeps the transfer layout untouched.
    const addressLabel = label != null && addressUtils.isAddress(label) ? label : undefined;
    const processedLabel = addressLabel == null ? label : addressUtils.truncateAddress(addressLabel);
    const processedValue = isExecution ? componentCopy.actionCount(actionCount as number) : processedTokenAmount;
    const showValue = !hideValue && !isExecution;

    return (
        <DataList.Item
            className={classNames('flex items-center justify-between gap-x-related--12-16 py-inset-item', className)}
            href={processedHref}
            {...otherProps}
        >
            {status === TransactionStatus.SUCCESS && (
                <AvatarIcon icon={typeToIcon[type]} responsiveSize={{ md: 'md' }} variant={typeToIconVariant[type]} />
            )}
            {status === TransactionStatus.FAILED && (
                <AvatarIcon icon={IconType.CLOSE} responsiveSize={{ md: 'md' }} variant="critical" />
            )}
            {status === TransactionStatus.PENDING && (
                <div className="flex size-6 shrink-0 items-center justify-center md:size-8">
                    <Spinner className="transition" responsiveSize={{ md: 'lg' }} variant="neutral" />
                </div>
            )}
            <div className="flex w-full flex-col items-start gap-y-tight--2-4 self-center">
                <span className="type-title-item text-surface-primary">
                    {typeToHeading[type]}
                    {isExecution && processedLabel != null && (
                        <span className="text-surface-secondary">
                            {' '}
                            {addressLabel == null ? processedLabel : <AddressOutput address={addressLabel} />}
                        </span>
                    )}
                </span>
                {date && (
                    <p className="type-caption--list-date text-surface-secondary">
                        {formatterUtils.formatDate(date, { format: DateFormat.YEAR_MONTH_DAY_TIME })}
                    </p>
                )}
            </div>

            <div className="flex h-full shrink-0 flex-col items-end gap-y-tight--2-4 truncate">
                <span className="type-supporting--row-value text-surface-primary">{processedValue}</span>
                {showValue && (
                    <span className="type-supporting text-surface-secondary">{formattedTransactionValue}</span>
                )}
            </div>
        </DataList.Item>
    );
};
