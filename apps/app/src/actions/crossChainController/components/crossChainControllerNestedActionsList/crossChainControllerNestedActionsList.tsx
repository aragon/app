'use client';

import { ProposalActions } from '@aragon/gov-ui-kit';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IRawActionTuple } from '@/modules/governance/types';
import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';

export interface ICrossChainControllerNestedActionsListProps {
    /**
     * Raw actions tuple decoded from the `_message` payload. Used to detect a mismatch with the decoded sub-actions.
     */
    rawTuple: IRawActionTuple[];
    /**
     * Decoded sub-actions emitted by the backend. When they do not describe the same calls as `rawTuple`, raw-calldata
     * stubs are rendered instead.
     */
    rawActions: IProposalAction[] | undefined;
    /**
     * Chain ID of the destination chain the actions execute on.
     */
    chainId?: number;
}

/**
 * Renders the actions forwarded to another chain by a cross-chain controller message. Unlike `NestedActionsList`,
 * actions are rendered with `ProposalActions.Item` directly and only go through the DAO-agnostic default
 * normalization, without a plugin-specific `CustomComponent`: the DAO's own network and installed plugins belong to
 * its home chain, not the destination chain the actions execute on, so resolving a plugin view for them would read
 * the wrong chain's state.
 *
 * Views matched by function selector are the exception: they carry no `daoId`, so they resolve nothing from the
 * home chain and only decode what is chain-independent, such as a permission hash to its name.
 */
export const CrossChainControllerNestedActionsList: React.FC<
    ICrossChainControllerNestedActionsListProps
> = (props) => {
    const { rawTuple, rawActions, chainId } = props;

    const actions = proposalActionUtils
        .resolveNestedActions(rawActions, rawTuple)
        .map((action) => proposalActionUtils.normalizeDefaultAction(action));

    if (actions.length === 0) {
        return null;
    }

    return (
        <ProposalActions.Root actionsCount={actions.length}>
            <ProposalActions.Container emptyStateDescription="">
                {actions.map((action, index) => {
                    const functionSelector =
                        proposalActionUtils.actionToFunctionSelector(action);

                    return (
                        <ProposalActions.Item<IProposalActionData>
                            action={action as IProposalActionData}
                            actionFunctionSelector={functionSelector}
                            CustomComponent={
                                actionViewRegistry.getViewBySelector(
                                    functionSelector,
                                )?.componentDetails
                            }
                            chainId={chainId}
                            key={index}
                            readOnly={true}
                        />
                    );
                })}
            </ProposalActions.Container>
        </ProposalActions.Root>
    );
};
