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
    IWorkspaceTransactionTransfer,
} from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { workspaceTransactionUtils } from '../../utils/workspaceTransactionUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceListItemSummary } from '../workspaceListItemSummary';

export interface IWorkspaceTransactionListItemProps
    extends Pick<ITransactionListItemProps, 'index'> {
    /**
     * Transaction to render.
     */
    transaction: IWorkspaceTransaction;
    /**
     * Account the transaction belongs to. Its type decides how an execution is decoded and its name labels the
     * transactions of a Safe account.
     */
    account?: IWorkspaceAccount;
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
     * Title of the transaction: its type for a transfer; for an execution, its executor (a plugin name or an address)
     * or the account of a Safe transaction.
     */
    title: string;
    /**
     * Identifier displayed after the title of an execution: the slug of the proposal behind it or the nonce of its
     * Safe transaction, when known.
     */
    identifier?: string;
    /**
     * Token amount of a transfer, displayed on the right of the header.
     */
    value?: string;
    /**
     * Status of an execution, displayed on the right of the header.
     */
    status?: ITagProps;
}

/**
 * Kind of a row, deciding how its header is built and what it expands to, along with the data that kind needs.
 */
type WorkspaceTransactionRow =
    | {
          /**
           * Transfer of an asset, expanding to the transferred asset.
           */
          kind: 'transfer';
          /**
           * Transfer to render.
           */
          transaction: IWorkspaceTransactionTransfer;
      }
    | {
          /**
           * Safe transaction, executed or pending, expanding to the actions read from the Safe.
           */
          kind: 'safe';
          /**
           * Execution to render.
           */
          transaction:
              | IWorkspaceTransactionExecution
              | IWorkspaceTransactionPendingExecution;
          /**
           * Hash of the Safe transaction.
           */
          safeTxHash: string;
      }
    | {
          /**
           * Execution of a DAO account, expanding to its actions decoded in the context of the DAO.
           */
          kind: 'daoExecution';
          /**
           * Execution to render.
           */
          transaction: IWorkspaceTransactionExecution;
          /**
           * DAO the execution belongs to.
           */
          dao: IDao;
      }
    | {
          /**
           * Execution that cannot be decoded, rendered as a block-explorer row.
           */
          kind: 'explorerLink';
          /**
           * Execution to render.
           */
          transaction: IWorkspaceTransactionExecution;
      };

type ExecutionRow = Extract<
    WorkspaceTransactionRow,
    { kind: 'safe' | 'daoExecution' }
>;

interface IBuildExecutionDisplayParams {
    /**
     * Row of the execution to display.
     */
    row: ExecutionRow;
    /**
     * Slug of the proposal that triggered the execution, when known.
     */
    proposalSlug?: string;
    /**
     * Name of the account the execution belongs to.
     */
    accountName?: string;
    /**
     * Translation function.
     */
    t: TranslationFunction;
}

const getRow = (
    transaction: IWorkspaceTransaction,
    accountType?: WorkspaceAccountType,
    dao?: IDao,
): WorkspaceTransactionRow => {
    if (!workspaceTransactionUtils.isExecution(transaction)) {
        return { kind: 'transfer', transaction };
    }

    // A pending transaction only exists on a Safe, whatever the type of its account resolves to.
    if (workspaceTransactionUtils.isPendingExecution(transaction)) {
        return {
            kind: 'safe',
            transaction,
            safeTxHash: transaction.safeTxHash,
        };
    }

    const { safeTxHash } = transaction;
    if (accountType === WorkspaceAccountType.SAFE && safeTxHash != null) {
        return { kind: 'safe', transaction, safeTxHash };
    }

    return dao == null
        ? { kind: 'explorerLink', transaction }
        : { kind: 'daoExecution', transaction, dao };
};

const buildExecutionStatus = (
    execution: ExecutionRow['transaction'],
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
    const { row, proposalSlug, accountName, t } = params;
    const { transaction } = row;

    // An execution is identified by the proposal behind it, else, for a Safe transaction, by its account and nonce.
    // Without either it is identified by its executor alone, its status tag already saying it executed.
    const safeTransactionIdentifier =
        row.kind === 'safe' && transaction.nonce != null
            ? workspaceTransactionUtils.getSafeTransactionTitle(
                  transaction.nonce,
                  accountName,
              )
            : undefined;
    const title =
        row.kind === 'safe'
            ? (accountName ?? transaction.account.address)
            : transactionExecutionUtils.getExecutionLabel(
                  row.transaction,
                  row.dao,
              );

    return {
        icon: IconType.BLOCKCHAIN_SMARTCONTRACT,
        iconVariant: 'neutral',
        title,
        identifier: proposalSlug?.toUpperCase() ?? safeTransactionIdentifier,
        status: buildExecutionStatus(transaction, t),
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
        title: isDeposit ? headerCopy.received : headerCopy.sent,
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
    const { transaction, value, index, account, dao } = props;

    const { t } = useTranslations();
    const { copy } = useGukModulesContext();
    const headerCopy = copy.transactionDataListItemStructure;

    const row = getRow(transaction, account?.type, dao);
    const accountName =
        account == null ? undefined : workspaceUtils.getAccountName(account);

    if (row.kind === 'explorerLink') {
        return (
            <TransactionList.Item index={index} transaction={row.transaction} />
        );
    }

    const {
        icon,
        iconVariant,
        title,
        identifier,
        status,
        value: amount,
    } = row.kind === 'transfer'
        ? buildTransferDisplay(row.transaction, headerCopy)
        : buildExecutionDisplay({
              row,
              proposalSlug: row.transaction.proposalSlug,
              accountName,
              t,
          });

    const isAddressTitle = addressUtils.isAddress(title);
    const formattedDate = formatterUtils.formatDate(
        workspaceTransactionUtils.getTimestamp(transaction) * 1000,
        { format: DateFormat.YEAR_MONTH_DAY_TIME },
    );

    return (
        <Accordion.Item value={value}>
            <Accordion.ItemHeader>
                <WorkspaceListItemSummary
                    avatar={
                        <AvatarIcon
                            icon={icon}
                            responsiveSize={{ md: 'md' }}
                            variant={iconVariant}
                        />
                    }
                    description={formattedDate}
                    identifier={identifier}
                    tag={status}
                    title={
                        isAddressTitle ? (
                            // The header is the accordion trigger, so the address must not add a control of its
                            // own.
                            <AddressOutput
                                address={title}
                                hasInteractiveAncestor={true}
                            />
                        ) : (
                            title
                        )
                    }
                    value={amount}
                />
            </Accordion.ItemHeader>
            <Accordion.ItemContent>
                {row.kind === 'transfer' && (
                    <AssetTransfer
                        assetAddress={row.transaction.token.address}
                        assetAmount={row.transaction.value}
                        assetFiatPrice={row.transaction.token.priceUsd}
                        assetIconSrc={row.transaction.token.logo}
                        assetName={row.transaction.token.name}
                        assetSymbol={row.transaction.token.symbol}
                        chainId={networkDefinitions[row.transaction.network].id}
                        recipient={{ address: row.transaction.toAddress }}
                        sender={{ address: row.transaction.fromAddress }}
                    />
                )}
                {row.kind === 'safe' && (
                    <div className="flex w-full flex-col gap-y-2 md:gap-y-3">
                        <SafeExecutionDetails
                            safeAddress={row.transaction.account.address}
                            safeTxHash={row.safeTxHash}
                            transaction={row.transaction}
                        />
                    </div>
                )}
                {row.kind === 'daoExecution' && (
                    <div className="flex w-full flex-col gap-y-2 md:gap-y-3">
                        <TransactionExecutionDetails
                            dao={row.dao}
                            transaction={row.transaction}
                        />
                    </div>
                )}
            </Accordion.ItemContent>
        </Accordion.Item>
    );
};
