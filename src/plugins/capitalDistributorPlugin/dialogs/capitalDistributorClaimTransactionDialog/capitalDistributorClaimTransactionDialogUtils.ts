import { encodeAbiParameters, encodeFunctionData, type Hex, zeroHash } from 'viem';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import type { ICampaign, ICampaignUserDataMerkle } from '../../api/capitalDistributorService';
import type { IBuildClaimTransactionParams } from './capitalDistributorClaimTransactionDialogUtils.api';
import { capitalDistributorAbi, merkleClaimDataAbi } from './capitalDistributorPluginAbi';

class CapitalDistributorClaimTransactionDialogUtils {
    buildTransaction = (params: IBuildClaimTransactionParams): Promise<ITransactionRequest> => {
        const { campaign, recipient, pluginAddress } = params;
        const campaignId = BigInt(campaign.campaignId);

        const auxData = this.buildClaimAuxData(campaign);
        const data = encodeFunctionData({
            abi: capitalDistributorAbi,
            functionName: 'claimCampaignPayoutToAddress',
            args: [campaignId, recipient as Hex, auxData, zeroHash],
        });

        const transaction = {
            to: pluginAddress as Hex,
            data,
            value: BigInt(0),
        };

        return Promise.resolve(transaction);
    };

    private readonly buildClaimAuxData = (campaign: ICampaign): Hex => {
        if (this.isMerkleTreeCampaign(campaign)) {
            return this.buildMerkleTreeAuxData(campaign);
        }
        throw new Error('buildClaimAuxData: campaign strategy not supported.');
    };

    private readonly isMerkleTreeCampaign = (campaign: ICampaign): campaign is ICampaign<ICampaignUserDataMerkle> =>
        campaign.strategy != null && typeof campaign.strategy === 'object' && 'root' in campaign.strategy;

    private readonly buildMerkleTreeAuxData = (campaign: ICampaign<ICampaignUserDataMerkle>): Hex => {
        const { totalAmount, proofs } = campaign.userData;
        const auxData = encodeAbiParameters(merkleClaimDataAbi, [proofs as Hex[], BigInt(totalAmount)]);

        return auxData;
    };
}

export const capitalDistributorClaimTransactionDialogUtils = new CapitalDistributorClaimTransactionDialogUtils();
