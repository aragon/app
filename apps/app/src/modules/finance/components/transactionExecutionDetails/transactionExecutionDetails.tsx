'use client';

import {
    type IProposalActionsFooterDropdownItem,
    ProposalActions,
    TransactionDetailSummary,
} from '@aragon/gov-ui-kit';
import { ProposalActionsItem } from '@/modules/governance/components/proposalActionsItem';
import { useNormalizedProposalActions } from '@/modules/governance/hooks/useNormalizedProposalActions';
import { proposalActionsImportExportUtils } from '@/modules/governance/utils/proposalActionsImportExportUtils';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    type ITransactionExecution,
    useTransactionActions,
} from '../../api/financeService';
import { transactionExecutionUtils } from '../../utils/transactionExecutionUtils';
import {
    getTransactionActions,
    getTransactionActionsRefetchInterval,
} from './transactionExecutionDetailsUtils';

export interface ITransactionExecutionDetailsProps {
    /**
     * DAO that owns the transaction.
     */
    dao: IDao;
    /**
     * Execution transaction to display.
     */
    transaction: ITransactionExecution;
}

/**
 * Summary and decoded actions of an execution transaction. It renders no layout of its own, so the transaction
 * detail dialog and the transaction list accordion can each lay it out in their own shell.
 */
export const TransactionExecutionDetails: React.FC<
    ITransactionExecutionDetailsProps
> = (props) => {
    const { dao, transaction } = props;

    const { t } = useTranslations();

    const { data: actionData, isLoading } = useTransactionActions(
        {
            urlParams: {
                id: transaction.id,
                network: transaction.network,
            },
        },
        {
            refetchInterval: getTransactionActionsRefetchInterval,
        },
    );

    const actions = getTransactionActions(actionData, transaction.fromAddress);
    const normalizedActions = useNormalizedProposalActions({
        actions,
        daoId: dao.id,
    });

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
    const executedBySource = actionData?.source ?? transaction.source;
    const sourcePlugin = transactionExecutionUtils.getSourcePlugin(
        executedBySource,
        dao,
    );
    const sourcePluginName =
        sourcePlugin != null ? daoUtils.getPluginName(sourcePlugin) : undefined;
    // Always show the executor as the (truncated, linked) address with the resolved
    // plugin name and version below it. gov-ui-kit truncates and links the address
    // itself when no `label` is set.
    const executedByHelptext =
        sourcePlugin?.release && sourcePlugin?.build
            ? t('app.shared.daoPluginInfo.pluginVersionInfo', {
                  name: daoUtils.getPluginContractName(sourcePlugin),
                  release: sourcePlugin.release,
                  build: sourcePlugin.build,
              })
            : sourcePluginName;
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
        <>
            <TransactionDetailSummary
                chainId={chainId}
                date={
                    (actionData?.blockTimestamp ?? transaction.blockTimestamp) *
                    1000
                }
                executedBy={{
                    address: executedByAddress,
                    helptext: executedByHelptext,
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
                isLoading={
                    isLoading ||
                    (actionData?.decoding && actionData.rawActions == null)
                }
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
                <ProposalActions.Footer dropdownItems={actionsDropdownItems} />
            </ProposalActions.Root>
        </>
    );
};
