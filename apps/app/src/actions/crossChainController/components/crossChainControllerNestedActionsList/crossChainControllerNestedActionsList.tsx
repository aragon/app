'use client';

import { ProposalActions } from '@aragon/gov-ui-kit';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IRawActionTuple } from '@/modules/governance/types';
import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';

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
 * actions are rendered with `ProposalActions.Item` directly, without normalization or a plugin-specific
 * `CustomComponent`: the DAO's own network and installed plugins belong to its home chain, not the destination chain
 * the actions execute on, so resolving a plugin view for them would read the wrong chain's state.
 */
export const CrossChainControllerNestedActionsList: React.FC<
    ICrossChainControllerNestedActionsListProps
> = (props) => {
    const { rawTuple, rawActions, chainId } = props;

    const actions = proposalActionUtils.resolveNestedActions(
        rawActions,
        rawTuple,
    );

    if (actions.length === 0) {
        return null;
    }

    return (
        <ProposalActions.Root actionsCount={actions.length}>
            <ProposalActions.Container emptyStateDescription="">
                {actions.map((action, index) => (
                    <ProposalActions.Item
                        action={action}
                        actionFunctionSelector={proposalActionUtils.actionToFunctionSelector(
                            action,
                        )}
                        chainId={chainId}
                        key={index}
                        readOnly={true}
                    />
                ))}
            </ProposalActions.Container>
        </ProposalActions.Root>
    );
};
