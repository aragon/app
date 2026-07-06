'use client';

import {
    type IProposalActionInputDataParameter,
    ProposalActions,
    ProposalActionTypeNoBasicView,
} from '@aragon/gov-ui-kit';
import { useDao } from '@/shared/api/daoService';
import type { IProposalAction } from '../../api/governanceService';
import { proposalActionUtils } from '../../utils/proposalActionUtils';
import { ProposalActionsItem } from '../proposalActionsItem';

export interface INestedActionsListProps {
    /**
     * Decoded input parameters of the outer wrapper action (e.g. `createProposal`/`execute`). Used to read the raw
     * `_actions` tuple as a fallback when the decoded sub-actions are missing or out of sync.
     */
    outerParams: IProposalActionInputDataParameter[];
    /**
     * Decoded sub-actions emitted by the backend. When the length differs from the raw `_actions` tuple, raw-calldata
     * stubs are rendered instead.
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

interface IRawActionTuple {
    to: string;
    value: string;
    data: string;
}

const buildRawActionStubs = (tuple: IRawActionTuple[]): IProposalAction[] =>
    tuple.map((entry) => ({
        from: '',
        to: entry.to,
        data: entry.data,
        value: entry.value,
        type: ProposalActionTypeNoBasicView.RAW_CALLDATA,
        inputData: null,
    }));

export const NestedActionsList: React.FC<INestedActionsListProps> = (props) => {
    const { outerParams, rawActions, daoId, chainId } = props;

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    if (dao == null) {
        return null;
    }

    const rawTuple =
        (outerParams.find((param) => param.name === '_actions')?.value as
            | IRawActionTuple[]
            | undefined) ?? [];

    const hasDecodedMismatch =
        rawActions == null || rawActions.length !== rawTuple.length;

    const actionsToRender = hasDecodedMismatch
        ? buildRawActionStubs(rawTuple)
        : rawActions;

    if (actionsToRender.length === 0) {
        return null;
    }

    const normalizedActions = proposalActionUtils.normalizeActions(
        actionsToRender,
        dao,
    );

    return (
        <ProposalActions.Root actionsCount={normalizedActions.length}>
            <ProposalActions.Container emptyStateDescription="">
                {normalizedActions.map((action, index) => (
                    <ProposalActionsItem
                        action={action}
                        chainId={chainId}
                        daoId={daoId}
                        key={index}
                    />
                ))}
            </ProposalActions.Container>
        </ProposalActions.Root>
    );
};
