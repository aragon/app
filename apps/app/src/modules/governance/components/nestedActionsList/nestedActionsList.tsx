'use client';

import {
    type IProposalActionInputDataParameter,
    ProposalActions,
} from '@aragon/gov-ui-kit';
import type { IProposalAction } from '../../api/governanceService';
import { useNormalizedProposalActions } from '../../hooks/useNormalizedProposalActions';
import { proposalActionUtils } from '../../utils/proposalActionUtils';
import { ProposalActionsItem } from '../proposalActionsItem';

export interface INestedActionsListProps {
    /**
     * Decoded input parameters of the outer wrapper action (e.g. `createProposal`/`execute`). Used to read the raw
     * `_actions` tuple, both to check the decoded sub-actions against and as a fallback when they are missing or out
     * of sync.
     */
    outerParams: IProposalActionInputDataParameter[];
    /**
     * Decoded sub-actions emitted by the backend. When they do not describe the same calls as the raw `_actions`
     * tuple, raw-calldata stubs are rendered instead.
     */
    rawActions: IProposalAction[] | undefined;
    /**
     * ID of the DAO that owns the proposal.
     */
    daoId: string;
    /**
     * Chain ID for blockchain RPC calls.
     */
    chainId?: number;
}

export const NestedActionsList: React.FC<INestedActionsListProps> = (props) => {
    const { outerParams, rawActions, daoId, chainId } = props;

    const rawTuple = proposalActionUtils.parseRawActionTuple(
        outerParams.find((param) => param.name === '_actions')?.value,
    );

    const actionsToRender = proposalActionUtils.resolveNestedActions(
        rawActions,
        rawTuple,
    );

    const normalizedActions = useNormalizedProposalActions({
        actions: actionsToRender,
        daoId,
    });

    if (normalizedActions.length === 0) {
        return null;
    }

    return (
        <ProposalActions.Root actionsCount={normalizedActions.length}>
            <ProposalActions.Container emptyStateDescription="">
                {normalizedActions.map((action, index) => (
                    <ProposalActionsItem
                        action={action}
                        chainId={chainId}
                        daoId={daoId}
                        // biome-ignore lint/suspicious/noArrayIndexKey: actions have no id and are never reordered
                        key={index}
                    />
                ))}
            </ProposalActions.Container>
        </ProposalActions.Root>
    );
};
