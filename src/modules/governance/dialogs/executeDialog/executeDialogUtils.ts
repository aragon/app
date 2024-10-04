import { executeUtils } from '@/modules/governance/components/executeProposal/utils/executeUtils';
import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import type { Hex } from 'viem';

export interface IBuildTransactionParams {
    /**
     * The incremental id of the proposal
     */
    proposalIndex: string;
    /**
     * Address of the proposal plugin.
     */
    pluginAddress: string;
}

class ExecuteDialogUtils {
    buildTransaction = (params: IBuildTransactionParams) => {
        const { pluginAddress } = params;
        const transactionData = executeUtils.buildExecuteData(params);

        const transaction: TransactionDialogPrepareReturn = {
            to: pluginAddress as Hex,
            data: transactionData,
        };

        return transaction;
    };
}

export const executeDialogUtils = new ExecuteDialogUtils();
