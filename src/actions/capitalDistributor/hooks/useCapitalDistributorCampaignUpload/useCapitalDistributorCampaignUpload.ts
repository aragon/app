import { useCallback } from 'react';
import { PluginInterfaceType, useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { CapitalDistributorDialogId } from '../../constants/capitalDistributorDialogId';
import type { ICapitalDistributorCampaignUploadDialogParams } from '../../dialogs/capitalDistributorCampaignUploadDialog';

export interface IUseCapitalDistributorCampaignUploadParams {
    /**
     * DAO ID to resolve network, addresses, and plugin addresses.
     */
    daoId: string;
    /**
     * Callback to be called when the upload is complete.
     */
    onComplete: (info: {
        merkleRoot: string;
        totalMembers: number;
        fileName: string;
    }) => void;
}

export const useCapitalDistributorCampaignUpload = (
    params: IUseCapitalDistributorCampaignUploadParams,
) => {
    const { daoId, onComplete } = params;

    const { open } = useDialogContext();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const capitalDistributorPlugins = useDaoPlugins({
        daoId,
        interfaceType: PluginInterfaceType.CAPITAL_DISTRIBUTOR,
    });
    const capitalDistributorAddress =
        capitalDistributorPlugins?.[0]?.meta.address;

    const upload = useCallback(
        (file: File) => {
            if (dao == null || capitalDistributorAddress == null) {
                return;
            }

            const dialogParams: ICapitalDistributorCampaignUploadDialogParams =
                {
                    file,
                    network: dao.network,
                    daoAddress: dao.address,
                    capitalDistributorAddress,
                    onComplete,
                };

            open(CapitalDistributorDialogId.CAMPAIGN_UPLOAD_STATUS, {
                params: dialogParams,
                disableOutsideClick: true,
            });
        },
        [dao, capitalDistributorAddress, onComplete, open],
    );

    return { upload };
};
