'use client';

import {
    AlertInline,
    type IProposalAction as IGukProposalAction,
    type IProposalActionsFooterDropdownItem,
    ProposalActions,
} from '@aragon/gov-ui-kit';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { ProposalActionsItem } from '@/modules/governance/components/proposalActionsItem';
import { proposalActionsImportExportUtils } from '@/modules/governance/utils/proposalActionsImportExportUtils';
import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';

export interface ITransactionExecutionActionsProps {
    /**
     * Decoded actions of the execution, exported by the "Download as JSON" option.
     */
    actions: IProposalAction[];
    /**
     * Actions to render when they differ from `actions`, e.g. after the DAO-specific normalization. Defaults to
     * `actions`.
     */
    normalizedActions?: IGukProposalAction[];
    /**
     * Number of actions bundled in the execution.
     */
    actionCount: number;
    /**
     * Whether the actions are still being read.
     */
    isLoading: boolean;
    /**
     * Whether the actions could not be read.
     */
    isError: boolean;
    /**
     * Chain ID of the execution.
     */
    chainId: number;
    /**
     * ID of the execution, used to name the exported file.
     */
    transactionId: string;
    /**
     * ID of the DAO that executed the actions, when executed by a DAO. Without it, only the action views that do not
     * depend on the DAO are resolved.
     */
    daoId?: string;
}

/**
 * Decoded actions of an execution transaction, shared by the DAO and Safe execution details.
 */
export const TransactionExecutionActions: React.FC<
    ITransactionExecutionActionsProps
> = (props) => {
    const {
        actions,
        normalizedActions = actions,
        actionCount,
        isLoading,
        isError,
        chainId,
        transactionId,
        daoId,
    } = props;

    const { t } = useTranslations();

    // Without actions to render, the list would report the execution as having none.
    if (isError) {
        return (
            <AlertInline
                message={t('app.finance.transactionExecutionActions.loadError')}
                variant="critical"
            />
        );
    }

    const dropdownItems: IProposalActionsFooterDropdownItem[] =
        normalizedActions.length > 0
            ? [
                  {
                      label: t(
                          'app.governance.daoProposalDetailsPage.main.actions.downloadAsJSON',
                      ),
                      onClick: () =>
                          proposalActionsImportExportUtils.downloadActionsAsJSON(
                              actions,
                              `transaction-${transactionId}-actions.json`,
                          ),
                  },
              ]
            : [];

    return (
        <ProposalActions.Root actionsCount={actionCount} isLoading={isLoading}>
            <ProposalActions.Container emptyStateDescription="">
                {normalizedActions.map((action, index) => {
                    const key = `${action.to}-${action.data}-${index.toString()}`;

                    if (daoId != null) {
                        return (
                            <ProposalActionsItem
                                action={action}
                                chainId={chainId}
                                daoId={daoId}
                                key={key}
                            />
                        );
                    }

                    const functionSelector =
                        proposalActionUtils.actionToFunctionSelector(action);
                    const customActionView =
                        actionViewRegistry.getDaoIndependentView(
                            action.type,
                            functionSelector,
                        );

                    return (
                        <ProposalActions.Item<IProposalActionData>
                            action={action as IProposalActionData}
                            actionFunctionSelector={functionSelector}
                            CustomComponent={customActionView?.componentDetails}
                            chainId={chainId}
                            key={key}
                            readOnly={true}
                        />
                    );
                })}
            </ProposalActions.Container>
            <ProposalActions.Footer dropdownItems={dropdownItems} />
        </ProposalActions.Root>
    );
};
