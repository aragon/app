'use client';

import {
    type IProposalActionsFooterDropdownItem,
    invariant,
    ProposalActions,
    TransactionDetail,
    TransactionDetailSummary,
} from '@aragon/gov-ui-kit';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
    type ITransactionExecution,
    useTransactionActions,
} from '@/modules/finance/api/financeService';
import { transactionExecutionUtils } from '@/modules/finance/utils/transactionExecutionUtils';
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
import {
    getTransactionActions,
    getTransactionActionsRefetchInterval,
} from './transactionDetailDialogUtils';

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

    const pathname = usePathname();
    const initialPathnameRef = useRef(pathname);

    // Close the dialog when navigating away (e.g. clicking the proposal link).
    useEffect(() => {
        if (pathname !== initialPathnameRef.current) {
            close(location.id);
        }
    }, [pathname, close, location.id]);

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
                  name: sourcePluginName,
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
        <TransactionDetail.Root onClose={() => close(location.id)}>
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
        </TransactionDetail.Root>
    );
};
