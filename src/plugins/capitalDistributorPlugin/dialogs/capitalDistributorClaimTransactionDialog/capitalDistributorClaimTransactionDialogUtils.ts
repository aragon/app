import { type ITransactionRequest } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, type Hex } from 'viem';
import type { IBuildClaimTransactionParams } from './capitalDistributorClaimTransactionDialogUtils.api';

const capitalDistributorAbi = [
    {
        type: 'function',
        name: 'claimCampaignPayout',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'campaignId', type: 'uint256' },
            { name: 'recipient', type: 'address' },
            { name: 'auxData', type: 'bytes' },
        ],
        outputs: [],
    },
];

class CapitalDistributorClaimTransactionDialogUtils {
    buildTransaction = (params: IBuildClaimTransactionParams): Promise<ITransactionRequest> => {
        const { campaignId, recipient, auxData, pluginAddress } = params;

        const encodedAuxData = auxData ?? '0x';

        const data = encodeFunctionData({
            abi: capitalDistributorAbi,
            functionName: 'claimCampaignPayout',
            args: [campaignId, recipient, encodedAuxData],
        });

        const transaction = { to: pluginAddress as Hex, data, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const capitalDistributorClaimTransactionDialog = new CapitalDistributorClaimTransactionDialogUtils();
