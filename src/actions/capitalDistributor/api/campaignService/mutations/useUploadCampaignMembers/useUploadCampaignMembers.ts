import { type MutationOptions, useMutation } from '@tanstack/react-query';
import { campaignService } from '../../campaignService';
import type { IUploadCampaignMembersParams } from '../../campaignService.api';
import type { ICampaignUploadResult } from '../../domain';

export const useUploadCampaignMembers = (
    options?: MutationOptions<
        ICampaignUploadResult,
        unknown,
        IUploadCampaignMembersParams
    >,
) =>
    useMutation({
        mutationFn: (params) => campaignService.uploadCampaignMembers(params),
        ...options,
    });
