import { encodeFunctionData, type Hex } from 'viem';
import { executeAbi } from './abi/execute';

export interface IBuildExecuteData {
    proposalIndex: string;
}

class ExecuteUtils {
    buildExecuteData = (params: IBuildExecuteData): Hex => {
        const { proposalIndex } = params;

        const functionArgs = [proposalIndex];
        const data = encodeFunctionData({
            abi: executeAbi,
            functionName: 'execute',
            args: functionArgs,
        });

        return data;
    };
}

export const executeUtils = new ExecuteUtils();
