import { executeUtils } from '@/modules/governance/components/executeProposal/utils/executeUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import type { Hex } from 'viem';

export interface IBuildTransactionParams {
    proposalIndex: string;
    /**
     * Plugin of the DAO to interact with.
     */
    plugin: IDaoPlugin;
}

class ExecuteDialogUtils {
    buildTransaction = (params: IBuildTransactionParams) => {
        const { plugin } = params;
        const transactionData = executeUtils.buildExecuteData(params);

        const transaction: TransactionDialogPrepareReturn = {
            to: plugin.address as Hex,
            data: transactionData,
        };

        return transaction;
    };
}

export const executeDialogUtils = new ExecuteDialogUtils();
