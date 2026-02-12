import type { Network } from '@/shared/api/daoService/domain';
import type {
    IRequestUrlBodyParams,
    IRequestUrlParams,
} from '@/shared/api/httpService';

export interface IUploadCampaignMembersUrlParams {
    /**
     * Network of the capital distributor plugin.
     */
    network: Network;
}

export interface IUploadCampaignMembersBody {
    /**
     * Address of the DAO.
     */
    daoAddress: string;
    /**
     * Address of the user uploading the campaign members.
     */
    userAddress: string;
    /**
     * Address of the capital distributor plugin.
     */
    capitalDistributorAddress: string;
    /**
     * JSON file containing the list of members and their reward amounts.
     */
    membersFile: File;
}

export interface IUploadCampaignMembersParams
    extends IRequestUrlBodyParams<
        IUploadCampaignMembersUrlParams,
        IUploadCampaignMembersBody
    > {}

export interface IGetCampaignPrepareStatusUrlParams {
    /**
     * Network of the capital distributor plugin.
     */
    network: Network;
}

export interface IGetCampaignPrepareStatusQueryParams {
    /**
     * Address of the capital distributor plugin.
     */
    capitalDistributorAddress: string;
    /**
     * ID of the campaign to check prepare status for.
     */
    campaignId: string;
}

export interface IGetCampaignPrepareStatusParams
    extends IRequestUrlParams<IGetCampaignPrepareStatusUrlParams> {
    /**
     * Query parameters of the request.
     */
    queryParams: IGetCampaignPrepareStatusQueryParams;
}
