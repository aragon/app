'use client';

import {
    type IProposalActionsFooterDropdownItem,
    invariant,
    ProposalActions,
    TransactionDetail,
    TransactionDetailSummary,
} from '@aragon/gov-ui-kit';
import {
    type ITransactionExecution,
    useTransactionActions,
} from '@/modules/finance/api/financeService';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { ProposalActionsItem } from '@/modules/governance/components/proposalActionsItem';
import { proposalActionsImportExportUtils } from '@/modules/governance/utils/proposalActionsImportExportUtils';
import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';
import type { IDao } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';

const emptyActions: IProposalAction[] = [];

export interface ITransactionDetailDialogParams {
    /**
     * DAO that owns the transaction.
     */
    dao: IDao;
    /**
     * Execution transaction to display.
     */
    transaction: ITransactionExecution;
}

export interface ITransactionDetailDialogProps
    extends IDialogComponentProps<ITransactionDetailDialogParams> {}

export const TransactionDetailDialog: React.FC<
    ITransactionDetailDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'TransactionDetailDialog: required parameters must be set.',
    );

    const { dao, transaction } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const { data: actionData, isLoading } = useTransactionActions(
        {
            urlParams: {
                id: transaction.id,
                network: transaction.network,
            },
        },
        {
            refetchInterval: ({ state }) =>
                state.data?.decoding ? 2000 : false,
        },
    );

    const actions = actionData?.actions ?? emptyActions;
    const normalizedActions = proposalActionUtils.normalizeActions(
        actions,
        dao,
    );

    const chainId = networkDefinitions[transaction.network].id;
    const actionCount =
        actionData?.rawActions?.length ??
        actionData?.actionCount ??
        transaction.actionCount;
    const proposalSlug = actionData?.proposalSlug;
    const proposalHref =
        proposalSlug != null
            ? daoUtils.getDaoUrl(dao, `proposals/${proposalSlug}`)
            : undefined;
    const executedByAddress = actionData?.executedBy ?? transaction.fromAddress;
    const executedByLabel = actionData?.source ?? transaction.source;
    const actionsDropdownItems: IProposalActionsFooterDropdownItem[] =
        normalizedActions.length > 0
            ? [
                  {
                      label: t(
                          'app.governance.daoProposalDetailsPage.main.actions.downloadAsJSON',
                      ),
                      onClick: () =>
                          proposalActionsImportExportUtils.downloadActionsAsJSON(
                              actions,
                              `transaction-${transaction.id}-actions.json`,
                          ),
                  },
              ]
            : [];

    return (
        <TransactionDetail.Root onClose={() => close(location.id)}>
            <TransactionDetailSummary
                chainId={chainId}
                date={
                    (actionData?.blockTimestamp ?? transaction.blockTimestamp) *
                    1000
                }
                executedBy={{
                    address: executedByAddress,
                    label: executedByLabel,
                }}
                proposalHref={proposalHref}
                proposalId={proposalSlug?.toUpperCase()}
                totalActions={actionCount}
                transactionHash={
                    actionData?.transactionHash ?? transaction.transactionHash
                }
            />
            <ProposalActions.Root
                actionsCount={actionCount}
                isLoading={isLoading || actionData?.decoding}
            >
                <ProposalActions.Container emptyStateDescription="">
                    {normalizedActions.map((action, index) => (
                        <ProposalActionsItem
                            action={action}
                            chainId={chainId}
                            daoId={dao.id}
                            key={`${action.to}-${action.data}-${index.toString()}`}
                        />
                    ))}
                </ProposalActions.Container>
                <ProposalActions.Footer
                    dropdownAlignment="start"
                    dropdownItems={actionsDropdownItems}
                />
            </ProposalActions.Root>
        </TransactionDetail.Root>
    );
};
