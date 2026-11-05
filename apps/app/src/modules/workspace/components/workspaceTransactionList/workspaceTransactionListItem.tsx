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
    type ITagProps,
    NumberFormat,
    Tag,
    useGukModulesContext,
} from '@aragon/gov-ui-kit';
import {
    type ITransactionTransfer,
    TransactionSide,
} from '@/modules/finance/api/financeService';
import { TransactionExecutionDetails } from '@/modules/finance/components/transactionExecutionDetails';
import {
    type ITransactionListItemProps,
    TransactionList,
} from '@/modules/finance/components/transactionList';
import { transactionExecutionUtils } from '@/modules/finance/utils/transactionExecutionUtils';
import { SafeExecutionDetails } from '@/modules/safe/components/safeExecutionDetails';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type {
    IWorkspaceTransaction,
    IWorkspaceTransactionExecution,
    IWorkspaceTransactionPendingExecution,
} from '../../api/workspaceQueryService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import { workspaceTransactionUtils } from '../../utils/workspaceTransactionUtils';

export interface IWorkspaceTransactionListItemProps
    extends Pick<ITransactionListItemProps, 'index'> {
    /**
     * Transaction to render.
     */
    transaction: IWorkspaceTransaction;
    /**
     * Type of the account the transaction belongs to, which decides how an execution is decoded.
     */
    accountType?: WorkspaceAccountType;
    /**
     * Name of the account the transaction belongs to, used to label the transactions of a Safe account.
     */
    accountName?: string;
    /**
     * Value identifying the item in its accordion container. It must be unique within the container, which a
     * transaction ID alone is not when the same transfer is listed once per account.
     */
    value: string;
    /**
     * DAO the transaction belongs to. An execution of a DAO account cannot be expanded without it, as its actions are
     * decoded in the context of the DAO, so it is rendered as a block-explorer row instead.
     */
    dao?: IDao;
}

type TransactionHeaderCopy = ReturnType<
    typeof useGukModulesContext
>['copy']['transactionDataListItemStructure'];

type TranslationFunction = ReturnType<typeof useTranslations>['t'];

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
     * Token amount of a transfer, displayed on the right of the header.
     */
    value?: string;
    /**
     * Status of an execution, displayed on the right of the header.
     */
    status?: ITagProps;
    /**
     * Executor of an execution, a plugin name or an address, or the account of a Safe transaction.
     */
    label?: string;
}

interface IBuildExecutionDisplayParams {
    /**
     * Execution to display, executed or pending.
     */
    execution:
        | IWorkspaceTransactionExecution
        | IWorkspaceTransactionPendingExecution;
    /**
     * Hash of the Safe transaction behind the execution, set when it is read from a Safe.
     */
    safeTxHash?: string;
    /**
     * Name of the account the execution belongs to.
     */
    accountName?: string;
    /**
     * DAO the execution belongs to.
     */
    dao?: IDao;
    /**
     * Copy of the transaction header.
     */
    headerCopy: TransactionHeaderCopy;
    /**
     * Translation function.
     */
    t: TranslationFunction;
}

const buildExecutionStatus = (
    execution:
        | IWorkspaceTransactionExecution
        | IWorkspaceTransactionPendingExecution,
    t: TranslationFunction,
): ITagProps => {
    if (!workspaceTransactionUtils.isPendingExecution(execution)) {
        return {
            label: t(
                'app.workspace.workspaceTransactionList.item.status.executed',
            ),
            variant: 'success',
        };
    }

    const status = workspaceTransactionUtils.isExecutable(execution)
        ? 'executable'
        : 'active';

    return {
        label: t(
            `app.workspace.workspaceTransactionList.item.status.${status}`,
        ),
        variant: 'info',
    };
};

const buildExecutionDisplay = (
    params: IBuildExecutionDisplayParams,
): ITransactionHeaderDisplay => {
    const { execution, safeTxHash, accountName, dao, headerCopy, t } = params;

    // A Safe transaction is identified by its account and nonce, as an executed one may not have been run by a plugin.
    const isSafeTransaction = safeTxHash != null;
    const heading =
        isSafeTransaction && execution.nonce != null
            ? workspaceTransactionUtils.getSafeTransactionTitle(
                  execution.nonce,
                  accountName,
              )
            : headerCopy.executed;
    const label =
        !isSafeTransaction &&
        workspaceTransactionUtils.isExecutedExecution(execution)
            ? transactionExecutionUtils.getExecutionLabel(execution, dao)
            : (accountName ?? execution.account.address);

    return {
        icon: IconType.BLOCKCHAIN_SMARTCONTRACT,
        iconVariant: 'neutral',
        heading,
        label,
        status: buildExecutionStatus(execution, t),
    };
};

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
 * Workspace transaction rendered as an expandable accordion item: executions expand to their summary and decoded actions
 * (read from the Safe of a Safe account, in the context of the DAO otherwise), transfers to the transferred asset.
 * Safe transactions still waiting to be executed are listed with their confirmation status and expand to their
 * decoded actions only. Must be rendered inside an `<Accordion.Container />`.
 */
export const WorkspaceTransactionListItem: React.FC<
    IWorkspaceTransactionListItemProps
> = (props) => {
    const { transaction, value, index, accountType, accountName, dao } = props;

    const { t } = useTranslations();
    const { copy } = useGukModulesContext();
    const headerCopy = copy.transactionDataListItemStructure;

    const isExecution = workspaceTransactionUtils.isExecution(transaction);
    const isPendingExecution =
        workspaceTransactionUtils.isPendingExecution(transaction);
    const isExecuted =
        workspaceTransactionUtils.isExecutedExecution(transaction);

    // A pending transaction only exists on a Safe, whatever the type of its account resolves to.
    const safeTxHash =
        isExecution &&
        (isPendingExecution || accountType === WorkspaceAccountType.SAFE)
            ? transaction.safeTxHash
            : undefined;

    if (isExecuted && dao == null && safeTxHash == null) {
        return <TransactionList.Item index={index} transaction={transaction} />;
    }

    const {
        icon,
        iconVariant,
        heading,
        label,
        status,
        value: amount,
    } = isExecution
        ? buildExecutionDisplay({
              execution: transaction,
              safeTxHash,
              accountName,
              dao,
              headerCopy,
              t,
          })
        : buildTransferDisplay(transaction, headerCopy);

    const isAddressLabel = label != null && addressUtils.isAddress(label);
    const formattedDate = formatterUtils.formatDate(
        workspaceTransactionUtils.getTimestamp(transaction) * 1000,
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
                    {amount != null && (
                        <span className="shrink-0 truncate text-neutral-800 leading-tight md:text-lg">
                            {amount}
                        </span>
                    )}
                    {status != null && <Tag className="shrink-0" {...status} />}
                </div>
            </Accordion.ItemHeader>
            <Accordion.ItemContent>
                {isExecution && (
                    <div className="flex w-full flex-col gap-y-2 md:gap-y-3">
                        {safeTxHash != null && (
                            <SafeExecutionDetails
                                safeAddress={transaction.account.address}
                                safeTxHash={safeTxHash}
                                transaction={transaction}
                            />
                        )}
                        {isExecuted && safeTxHash == null && dao != null && (
                            <TransactionExecutionDetails
                                dao={dao}
                                transaction={transaction}
                            />
                        )}
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
