import { AragonBackendService } from '@/shared/api/aragonBackendService';
import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import type {
    IGetCampaignPrepareStatusParams,
    IUploadCampaignMembersParams,
} from './campaignService.api';
import type { ICampaignPrepareStatus, ICampaignUploadResult } from './domain';

// MOCK: Track prepare status poll count (remove with mock)
let prepareStatusCallCount = 0;

class CampaignService extends AragonBackendService {
    private basePaths = {
        uploadCampaignMembers: '/capital-distributor/:network/campaign/upload',
        getCampaignPrepareStatus:
            '/capital-distributor/:network/campaign/prepare/status',
    };

    private get urls() {
        return {
            uploadCampaignMembers: apiVersionUtils.buildVersionedUrl(
                this.basePaths.uploadCampaignMembers,
                { forceVersion: 'v2' },
            ),
            getCampaignPrepareStatus: apiVersionUtils.buildVersionedUrl(
                this.basePaths.getCampaignPrepareStatus,
                { forceVersion: 'v2' },
            ),
        };
    }

    /**
     * Upload a JSON list of campaign members (reward recipients) for a capital distributor campaign.
     * Generates a draft campaign with a random UUID and queues merkle tree generation.
     */
    uploadCampaignMembers = async (
        params: IUploadCampaignMembersParams,
    ): Promise<ICampaignUploadResult> => {
        // ========== MOCK START ==========
        // Remove this block when API is ready
        await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 second delay

        // Toggle error scenario by uncommenting:
        // throw new Error('Upload failed: Invalid file format');

        return {
            success: true,
            message: 'Campaign members uploaded successfully',
            campaignId: `campaign-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        };
        // ========== MOCK END ==========

        const { daoAddress, capitalDistributorAddress, membersFile } =
            params.body;

        const formData = new FormData();
        formData.append('membersFile', membersFile);
        formData.append('daoAddress', daoAddress);
        formData.append('capitalDistributorAddress', capitalDistributorAddress);

        const result = await this.request<ICampaignUploadResult>(
            this.urls.uploadCampaignMembers,
            { urlParams: params.urlParams, body: formData },
            { method: 'POST' },
        );

        return result;
    };

    /**
     * Get the prepare status of a draft campaign, including its merkle root and member count.
     */
    getCampaignPrepareStatus = async (
        params: IGetCampaignPrepareStatusParams,
    ): Promise<ICampaignPrepareStatus | null> => {
        // ========== MOCK START ==========
        // Remove this block when API is ready
        prepareStatusCallCount++;
        await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 second delay

        // Toggle error scenario by uncommenting:
        // throw new Error('Failed to generate merkle tree');

        // Return pending state (null merkleRoot) for first 2 calls
        if (prepareStatusCallCount < 3) {
            return {
                campaignId: params.queryParams.campaignId,
                merkleRoot: null,
                totalMembers: 150,
            };
        }

        // Reset counter for next upload (optional, for testing multiple uploads)
        prepareStatusCallCount = 0;

        // Return final result on 3rd call
        return {
            campaignId: params.queryParams.campaignId,
            merkleRoot:
                '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            totalMembers: 150,
        };
        // ========== MOCK END ==========

        const result = await this.request<ICampaignPrepareStatus | null>(
            this.urls.getCampaignPrepareStatus,
            params,
        );

        return result;
    };
}

export const campaignService = new CampaignService();
