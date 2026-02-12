import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useAccount } from 'wagmi';
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
     * Form field prefix for setting merkleTreeInfo.
     */
    fieldPrefix: string;
}

export const useCapitalDistributorCampaignUpload = (
    params: IUseCapitalDistributorCampaignUploadParams,
) => {
    const { daoId, fieldPrefix } = params;

    const { setValue } = useFormContext();
    const { open } = useDialogContext();
    const { address: userAddress } = useAccount();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const capitalDistributorPlugins = useDaoPlugins({
        daoId,
        interfaceType: PluginInterfaceType.CAPITAL_DISTRIBUTOR,
    });
    const capitalDistributorAddress =
        capitalDistributorPlugins?.[0]?.meta.address;

    const upload = useCallback(
        (file: File) => {
            if (
                dao == null ||
                userAddress == null ||
                capitalDistributorAddress == null
            ) {
                return;
            }

            const dialogParams: ICapitalDistributorCampaignUploadDialogParams =
                {
                    file,
                    network: dao.network,
                    daoAddress: dao.address,
                    userAddress,
                    capitalDistributorAddress,
                    onComplete: (info) => {
                        setValue(`${fieldPrefix}.merkleTreeInfo`, info, {
                            shouldValidate: true,
                        });
                    },
                };

            open(CapitalDistributorDialogId.CAMPAIGN_UPLOAD_STATUS, {
                params: dialogParams,
                disableOutsideClick: true,
            });
        },
        [
            dao,
            userAddress,
            capitalDistributorAddress,
            fieldPrefix,
            setValue,
            open,
        ],
    );

    const isReady =
        dao != null && userAddress != null && capitalDistributorAddress != null;

    return { upload, isReady };
};
