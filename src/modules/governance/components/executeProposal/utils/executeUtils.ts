import { encodeFunctionData, type Hex } from 'viem';
import { executeAbi } from './abi/execute';

export interface IBuildExecuteData {
    proposalId: string;
}

class ExecuteUtils {
    buildExecuteData = (params: IBuildExecuteData): Hex => {
        const { proposalId } = params;

        const functionArgs = [proposalId];
        const data = encodeFunctionData({
            abi: executeAbi,
            functionName: 'execute',
            args: functionArgs,
        });

        return data;
    };
}

export const executeUtils = new ExecuteUtils();
