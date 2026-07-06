import { ProposalActionTypeNoBasicView } from '@aragon/gov-ui-kit';
import type { ITransactionActionsResult } from '@/modules/finance/api/financeService';
import type { IProposalAction } from '@/modules/governance/api/governanceService';

const actionDecodingRefetchInterval = 2000;
const maxActionDecodingRequests = 10;

interface ITransactionActionsQuery {
    state: {
        data?: ITransactionActionsResult;
        dataUpdateCount: number;
    };
}

export const getTransactionActionsRefetchInterval = (
    query: ITransactionActionsQuery,
) =>
    query.state.data?.decoding &&
    query.state.dataUpdateCount < maxActionDecodingRequests
        ? actionDecodingRefetchInterval
        : false;

export const getTransactionActions = (
    actionData: ITransactionActionsResult | undefined,
    fromAddress: string,
): IProposalAction[] => {
    if (actionData == null) {
        return [];
    }

    const { rawActions } = actionData;
    const hasActionDecodeMismatch =
        rawActions != null && rawActions.length !== actionData.actions.length;

    if (!hasActionDecodeMismatch) {
        return actionData.actions;
    }

    return rawActions.map((rawAction) => ({
        from: fromAddress,
        to: rawAction.to,
        data: rawAction.data,
        value: rawAction.value,
        type: ProposalActionTypeNoBasicView.RAW_CALLDATA,
        inputData: null,
    }));
};
