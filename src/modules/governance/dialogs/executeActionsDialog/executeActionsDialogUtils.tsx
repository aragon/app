import type { Hex } from 'viem';
import type { IDao } from '@/shared/api/daoService';
import {
    type ITransactionRequest,
    transactionUtils,
} from '@/shared/utils/transactionUtils';
import { proposalActionPreparationUtils } from '../../utils/proposalActionPreparationUtils';
import type { IProposalCreateAction } from '../publishProposalDialog';

export interface IBuildExecuteTransactionParams {
    /**
     * DAO to execute the actions on.
     */
    dao: IDao;
    /**
     * Actions with their data already prepared (e.g. metadata pinned).
     */
    preparedActions: IProposalCreateAction[];
}

class ExecuteActionsDialogUtils {
    prepareActions = proposalActionPreparationUtils.prepareActions;

    /**
     * Encodes the prepared actions into a single `DAO.execute(callId, actions, allowFailureMap)`
     * call targeting the DAO itself.
     */
    buildExecuteTransaction = (
        params: IBuildExecuteTransactionParams,
    ): ITransactionRequest => {
        const { dao, preparedActions } = params;

        const mappedActions = preparedActions.map(
            this.actionToTransactionRequest,
        );

        return transactionUtils.buildExecuteTransaction(
            mappedActions,
            dao.address as Hex,
        );
    };

    private actionToTransactionRequest = (
        action: IProposalCreateAction,
    ): ITransactionRequest => {
        const { to, value, data } = action;

        return { to: to as Hex, value: BigInt(value), data: data as Hex };
    };
}

export const executeActionsDialogUtils = new ExecuteActionsDialogUtils();
