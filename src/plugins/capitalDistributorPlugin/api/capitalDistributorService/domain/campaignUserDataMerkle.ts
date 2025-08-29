import type { ICampaignUserData } from './campaignUserData';

export interface ICampaignUserDataMerkle extends ICampaignUserData {
    /**
     * Proofs of the merkle tree for the user.
     */
    proofs: string[];
}
