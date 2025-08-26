import type { ICampaign } from '../../api/capitalDistributorService';

export interface IBuildClaimTransactionParams {
    /**
     * The campaign to claim.
     */
    campaign: ICampaign;
    /**
     * The address where the payout will be sent.
     */
    recipient: string;
    /**
     * The address of the plugin to use for the claim.
     */
    pluginAddress: string;
}
