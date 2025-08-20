import { type ITransactionRequest } from '@/shared/utils/transactionUtils';
import { encodeAbiParameters, encodeFunctionData, zeroHash, type Hex } from 'viem';
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
            functionName: 'claimCampaignPayout',
            args: [campaignId, recipient as Hex, auxData, zeroHash],
        });

        const transaction = { to: pluginAddress as Hex, data, value: BigInt(0) };

        return Promise.resolve(transaction);
    };

    private buildClaimAuxData = (campaign: ICampaign): Hex => {
        if (this.isMerkleTreeCampaign(campaign)) {
            return this.buildMerkleTreeAuxData(campaign);
        } else {
            throw new Error('buildClaimAuxData: campaign strategy not supported.');
        }
    };

    private isMerkleTreeCampaign = (campaign: ICampaign): campaign is ICampaign<ICampaignUserDataMerkle> =>
        campaign.strategy != null && typeof campaign.strategy === 'object' && 'root' in campaign.strategy;

    private buildMerkleTreeAuxData = (campaign: ICampaign<ICampaignUserDataMerkle>): Hex => {
        const { totalAmount, proofs } = campaign.userData;
        const auxData = encodeAbiParameters(merkleClaimDataAbi, [proofs as Hex[], BigInt(totalAmount)]);

        return auxData;
    };
}

export const capitalDistributorClaimTransactionDialogUtils = new CapitalDistributorClaimTransactionDialogUtils();
