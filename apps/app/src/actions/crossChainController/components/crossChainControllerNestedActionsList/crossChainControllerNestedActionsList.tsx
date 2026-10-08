'use client';

import { ProposalActions } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import {
    type IProposalAction,
    ProposalActionType,
} from '@/modules/governance/api/governanceService';
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
 * Action types whose views read nothing from the DAO, so they can be resolved by type on the destination chain.
 */
const chainAgnosticActionTypes: string[] = [
    ProposalActionType.TRANSFER,
    ProposalActionType.TRANSFER_NATIVE,
];

/**
 * Resolves the custom view of a forwarded action. Chain-agnostic action types are resolved by type first, so they keep
 * their view even when a selector view matches the same calldata; other actions are resolved by selector only.
 */
const getCustomActionView = (
    action: IProposalAction,
    functionSelector?: Hex,
) => {
    if (chainAgnosticActionTypes.includes(action.type)) {
        const customActionViewByType = actionViewRegistry.getViewByActionType(
            action.type,
        );

        if (customActionViewByType != null) {
            return customActionViewByType;
        }
    }

    return actionViewRegistry.getViewBySelector(functionSelector);
};

/**
 * Renders the actions forwarded to another chain by a cross-chain controller message. Unlike `NestedActionsList`,
 * actions are rendered with `ProposalActions.Item` directly and only go through the DAO-agnostic default
 * normalization, without a plugin-specific `CustomComponent`: the DAO's own network and installed plugins belong to
 * its home chain, not the destination chain the actions execute on, so resolving a plugin view for them would read
 * the wrong chain's state.
 *
 * Views matched by function selector are the exception: they carry no `daoId`, so they resolve nothing from the
 * home chain and only decode what is chain-independent, such as a permission hash to its name. Token and native
 * transfers are resolved by action type for the same reason: their view renders the decoded action as is.
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

                    const customActionView = getCustomActionView(
                        action,
                        functionSelector,
                    );

                    return (
                        <ProposalActions.Item<IProposalActionData>
                            action={action as IProposalActionData}
                            actionFunctionSelector={functionSelector}
                            CustomComponent={customActionView?.componentDetails}
                            chainId={chainId}
                            // biome-ignore lint/suspicious/noArrayIndexKey: actions have no id and are never reordered
                            key={index}
                            readOnly={true}
                        />
                    );
                })}
            </ProposalActions.Container>
        </ProposalActions.Root>
    );
};
