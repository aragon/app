import { type ITransactionRequest } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, type Hex } from 'viem';
import { gaugeVoterAbi } from './gaugeVoterAbi';
import type { IBuildVoteTransactionParams } from './gaugeVoterVoteTransactionDialogUtils.api';

class GaugeVoterVoteTransactionDialogUtils {
    buildTransaction = (params: IBuildVoteTransactionParams): Promise<ITransactionRequest> => {
        const { votes, pluginAddress } = params;

        const data = encodeFunctionData({
            abi: gaugeVoterAbi,
            functionName: 'vote',
            args: [votes],
        });

        const transaction = { to: pluginAddress as Hex, data, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const gaugeVoterVoteTransactionDialogUtils = new GaugeVoterVoteTransactionDialogUtils();
