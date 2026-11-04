import type { ITransactionActionsResult } from '@/modules/finance/api/financeService';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';

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
): IProposalAction[] =>
    actionData == null
        ? []
        : proposalActionUtils.resolveActions(
              actionData.actions,
              actionData.rawActions,
              fromAddress,
          );
