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

type RawActionTupleEntry = IRawActionTuple | unknown[];

const normalizeRawActionTupleEntry = (
    entry: RawActionTupleEntry,
    components: IProposalActionInputDataParameter['components'] = [],
): IRawActionTuple => {
    if (!Array.isArray(entry)) {
        return entry;
    }

    const getComponentValue = (componentName: keyof IRawActionTuple) => {
        const componentIndex = components.findIndex(
            (component) => component.name === componentName,
        );
        const fallbackIndex = ['to', 'value', 'data'].indexOf(componentName);
        const value = entry[componentIndex >= 0 ? componentIndex : fallbackIndex];

        return value == null ? '' : String(value);
    };

    return {
        to: getComponentValue('to'),
        value: getComponentValue('value'),
        data: getComponentValue('data'),
    };
};

const normalizeRawActionTuple = (
    tuple: RawActionTupleEntry[],
    components: IProposalActionInputDataParameter['components'] = [],
): IRawActionTuple[] =>
    tuple.map((entry) => normalizeRawActionTupleEntry(entry, components));

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

    const rawActionsParam = outerParams.find((param) => param.name === '_actions');
    const rawTuple = normalizeRawActionTuple(
        (rawActionsParam?.value as RawActionTupleEntry[] | undefined) ?? [],
        rawActionsParam?.components,
    );

    const hasDecodedMismatch =
        rawActions == null || rawActions.length !== rawTuple.length;

    const decodedFallbackParams =
        dao == null
            ? undefined
            : {
                  urlParams: {
                      network: dao.network,
                      address: dao.address,
                  },
                  body: rawTuple,
              };
    const { data: decodedFallbackActions } = useDecodeTransactionsLight(
        decodedFallbackParams,
        {
            enabled:
                dao != null && hasDecodedMismatch && rawTuple.length > 0,
        },
    );

    if (dao == null) {
        return null;
    }

    const hasDecodedFallback =
        decodedFallbackActions != null &&
        decodedFallbackActions.length === rawTuple.length;
    const rawActionStubs = buildRawActionStubs(rawTuple);

    const actionsToRender = hasDecodedMismatch
        ? hasDecodedFallback
            ? decodedFallbackActions
            : rawActionStubs
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
