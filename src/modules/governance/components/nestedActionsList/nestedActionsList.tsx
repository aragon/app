'use client';

import {
    type IProposalActionInputDataParameter,
    ProposalActions,
    ProposalActionTypeNoBasicView,
} from '@aragon/gov-ui-kit';
import { useDao } from '@/shared/api/daoService';
import type { IProposalAction } from '../../api/governanceService';
import { useDecodeTransactionsLight } from '../../api/smartContractService';
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

// The raw `_actions` tuple entries arrive either as keyed objects or as positional arrays following the fixed
// `(to, value, data)` component order of the executor Action struct.
const normalizeRawActionTupleEntry = (
    entry: IRawActionTuple | unknown[],
): IRawActionTuple =>
    Array.isArray(entry)
        ? {
              to: String(entry[0] ?? ''),
              value: String(entry[1] ?? ''),
              data: String(entry[2] ?? ''),
          }
        : entry;

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

    // The selector-matched executor signature does not constrain parameter names, so fall back to the single
    // tuple[] parameter when the wrapper does not name it `_actions`.
    const actionsParam =
        outerParams.find((param) => param.name === '_actions') ??
        outerParams.find((param) => param.type === 'tuple[]');
    const rawTuple = (
        (actionsParam?.value as Array<IRawActionTuple | unknown[]> | undefined) ??
        []
    ).map(normalizeRawActionTupleEntry);

    const hasDecodedMismatch =
        rawActions == null || rawActions.length !== rawTuple.length;

    // Client-side fallback for nested actions the backend did not decode (e.g. wrappers it types as Unknown).
    const decodeParams =
        dao != null
            ? {
                  urlParams: { network: dao.network, address: dao.address },
                  body: rawTuple,
              }
            : undefined;
    const { data: decodedActions } = useDecodeTransactionsLight(decodeParams, {
        enabled: hasDecodedMismatch && rawTuple.length > 0,
    });

    if (dao == null) {
        return null;
    }

    const decodedFallback =
        decodedActions?.length === rawTuple.length ? decodedActions : undefined;
    const isStubFallback = hasDecodedMismatch && decodedFallback == null;

    const actionsToRender = hasDecodedMismatch
        ? (decodedFallback ?? buildRawActionStubs(rawTuple))
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
                        // Gov-ui-kit initializes the item view mode only on mount; force a remount when the
                        // raw-calldata stubs are replaced by decoded actions so items default to the decoded view.
                        key={`${isStubFallback ? 'stub' : 'action'}-${index.toString()}`}
                    />
                ))}
            </ProposalActions.Container>
        </ProposalActions.Root>
    );
};
