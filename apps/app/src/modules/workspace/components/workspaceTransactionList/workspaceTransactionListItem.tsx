'use client';

import {
    Accordion,
    AddressOutput,
    AssetTransfer,
    AvatarIcon,
    type AvatarIconVariant,
    addressUtils,
    DateFormat,
    formatterUtils,
    IconType,
    NumberFormat,
    useGukModulesContext,
} from '@aragon/gov-ui-kit';
import {
    type ITransactionExecution,
    type ITransactionTransfer,
    TransactionSide,
} from '@/modules/finance/api/financeService';
import { TransactionExecutionDetails } from '@/modules/finance/components/transactionExecutionDetails';
import {
    type ITransactionListItemProps,
    TransactionList,
} from '@/modules/finance/components/transactionList';
import { transactionExecutionUtils } from '@/modules/finance/utils/transactionExecutionUtils';
import type { IDao } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

export interface IWorkspaceTransactionListItemProps
    extends Pick<ITransactionListItemProps, 'transaction' | 'index'> {
    /**
     * Value identifying the item in its accordion container. It must be unique within the container, which a
     * transaction ID alone is not when the same transfer is listed once per account.
     */
    value: string;
    /**
     * DAO the transaction belongs to. An execution cannot be expanded without it, as its actions are decoded in the
     * context of the DAO, so it is rendered as a block-explorer row instead.
     */
    dao?: IDao;
}

type TransactionHeaderCopy = ReturnType<
    typeof useGukModulesContext
>['copy']['transactionDataListItemStructure'];

interface ITransactionHeaderDisplay {
    /**
     * Icon of the transaction type.
     */
    icon: IconType;
    /**
     * Variant of the transaction type icon.
     */
    iconVariant: AvatarIconVariant;
    /**
     * Heading of the transaction type.
     */
    heading: string;
    /**
     * Value displayed on the right of the header: the token amount of a transfer, the action count of an execution.
     */
    value: string;
    /**
     * Executor of an execution, a plugin name or an address.
     */
    label?: string;
}

const buildExecutionDisplay = (
    execution: ITransactionExecution,
    headerCopy: TransactionHeaderCopy,
    dao?: IDao,
): ITransactionHeaderDisplay => ({
    icon: IconType.BLOCKCHAIN_SMARTCONTRACT,
    iconVariant: 'info',
    heading: headerCopy.executed,
    value: headerCopy.actionCount(execution.actionCount),
    label: transactionExecutionUtils.getExecutionLabel(execution, dao),
});

const buildTransferDisplay = (
    transfer: ITransactionTransfer,
    headerCopy: TransactionHeaderCopy,
): ITransactionHeaderDisplay => {
    const isDeposit = transfer.side === TransactionSide.DEPOSIT;
    const formattedAmount = formatterUtils.formatNumber(transfer.value, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    return {
        icon: isDeposit ? IconType.DEPOSIT : IconType.WITHDRAW,
        iconVariant: isDeposit ? 'success' : 'warning',
        heading: isDeposit ? headerCopy.received : headerCopy.sent,
        value:
            formattedAmount == null
                ? '-'
                : `${formattedAmount} ${transfer.token.symbol}`,
    };
};

/**
 * Workspace transaction rendered as an expandable accordion item: executions expand to their summary and decoded actions,
 * transfers to the transferred asset. Must be rendered inside an `<Accordion.Container />`.
 */
export const WorkspaceTransactionListItem: React.FC<
    IWorkspaceTransactionListItemProps
> = (props) => {
    const { transaction, value, index, dao } = props;

    const { copy } = useGukModulesContext();
    const headerCopy = copy.transactionDataListItemStructure;

    const isExecution = transactionExecutionUtils.isExecution(transaction);

    if (isExecution && dao == null) {
        return <TransactionList.Item index={index} transaction={transaction} />;
    }

    const { icon, iconVariant, heading, label, ...display } = isExecution
        ? buildExecutionDisplay(transaction, headerCopy, dao)
        : buildTransferDisplay(transaction, headerCopy);

    const isAddressLabel = label != null && addressUtils.isAddress(label);
    const formattedDate = formatterUtils.formatDate(
        transaction.blockTimestamp * 1000,
        { format: DateFormat.YEAR_MONTH_DAY_TIME },
    );

    return (
        <Accordion.Item value={value}>
            <Accordion.ItemHeader>
                <div className="flex min-w-0 grow items-center gap-x-3 md:gap-x-4">
                    <AvatarIcon
                        icon={icon}
                        responsiveSize={{ md: 'md' }}
                        variant={iconVariant}
                    />
                    <div className="flex min-w-0 grow flex-col items-start gap-y-0.5 md:gap-y-1">
                        <span className="text-left text-neutral-800 leading-tight md:text-lg">
                            {heading}
                            {label != null && (
                                <span className="text-neutral-500">
                                    {' '}
                                    {isAddressLabel ? (
                                        // The header is the accordion trigger, so the address must not add a
                                        // control of its own.
                                        <AddressOutput
                                            address={label}
                                            hasInteractiveAncestor={true}
                                        />
                                    ) : (
                                        label
                                    )}
                                </span>
                            )}
                        </span>
                        <p className="text-neutral-500 text-sm leading-tight md:text-base">
                            {formattedDate}
                        </p>
                    </div>
                    <span className="shrink-0 truncate text-neutral-800 leading-tight md:text-lg">
                        {display.value}
                    </span>
                </div>
            </Accordion.ItemHeader>
            <Accordion.ItemContent>
                {isExecution && dao != null && (
                    <div className="flex w-full flex-col gap-y-2 md:gap-y-3">
                        <TransactionExecutionDetails
                            dao={dao}
                            transaction={transaction}
                        />
                    </div>
                )}
                {!isExecution && (
                    <AssetTransfer
                        assetAddress={transaction.token.address}
                        assetAmount={transaction.value}
                        assetFiatPrice={transaction.token.priceUsd}
                        assetIconSrc={transaction.token.logo}
                        assetName={transaction.token.name}
                        assetSymbol={transaction.token.symbol}
                        chainId={networkDefinitions[transaction.network].id}
                        recipient={{ address: transaction.toAddress }}
                        sender={{ address: transaction.fromAddress }}
                    />
                )}
            </Accordion.ItemContent>
        </Accordion.Item>
    );
};
