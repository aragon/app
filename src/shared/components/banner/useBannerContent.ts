import { useMemberExists } from '@/modules/governance/api/governanceService/queries/useMemberExists';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { bannerContentDefinitions, BannerContentType, type IBannerContentDefinition } from './bannerDefinitions';

export interface IUseBannerContentParams {
    /**
     * ID of the DAO.
     */
    id: string;
}

export function useBannerContent(params: IUseBannerContentParams): IBannerContentDefinition | undefined {
    const { id } = params;
    const { address: memberAddress } = useAccount();

    const adminPlugin = useDaoPlugins({ daoId: id, subdomain: 'admin' });
    const pluginAddress = adminPlugin?.[0]?.meta?.address;

    const memberExistsParams = { memberAddress: memberAddress as string, pluginAddress: pluginAddress! };
    const { data: isAdminMember } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: memberAddress != null && pluginAddress != null },
    );

    const bannerContentList = useMemo(() => {
        const banners: IBannerContentDefinition[] = [];

        if (isAdminMember) {
            banners.push(bannerContentDefinitions[BannerContentType.ADMIN_MEMBER]);
        }

        if (pluginAddress != null) {
            banners.push(bannerContentDefinitions[BannerContentType.ADMIN_PLUGIN]);
        }

        return banners;
    }, [isAdminMember, pluginAddress]);

    const bannerContent = [...bannerContentList].sort((a, b) => a.priority - b.priority)[0];

    return bannerContent;
}
