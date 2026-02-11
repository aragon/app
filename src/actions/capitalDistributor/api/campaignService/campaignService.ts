import { AragonBackendService } from '@/shared/api/aragonBackendService';
import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import type {
    IGetCampaignPrepareStatusParams,
    IUploadCampaignMembersParams,
} from './campaignService.api';
import type { ICampaignPrepareStatus, ICampaignUploadResult } from './domain';

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
        const {
            daoAddress,
            userAddress,
            multisigAddress,
            capitalDistributorAddress,
            membersFile,
        } = params.body;

        const formData = new FormData();
        formData.append('membersFile', membersFile);
        formData.append('daoAddress', daoAddress);
        formData.append('userAddress', userAddress);
        formData.append('multisigAddress', multisigAddress);
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
        const result = await this.request<ICampaignPrepareStatus | null>(
            this.urls.getCampaignPrepareStatus,
            params,
        );

        return result;
    };
}

export const campaignService = new CampaignService();
