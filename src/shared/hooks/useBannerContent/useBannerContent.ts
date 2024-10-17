import { useMemberExists } from '@/modules/governance/api/governanceService/queries/useMemberExists';
import { bannerContent } from '@/shared/constants/bannerContent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { BannerType } from '@/shared/types/enum/bannerType';
import { type Route } from 'next';
import { useAccount } from 'wagmi';

export interface IUseBannerContentParams {
    /**
     * ID of the DAO.
     */
    id: string;
}

export function useBannerContent(params: IUseBannerContentParams) {
    const { id } = params;
    const { address: memberAddress } = useAccount();

    const adminPlugin = useDaoPlugins({
        daoId: id,
        subdomain: 'admin',
    });
    const pluginAddress = adminPlugin?.[0]?.meta?.address;

    const urlParams = {
        memberAddress: memberAddress as string,
        pluginAddress: pluginAddress as string,
    };

    const { data: isAdminMember } = useMemberExists(
        { urlParams },
        { enabled: memberAddress != null && pluginAddress != null },
    );

    const bannerTypes: BannerType[] = [];

    if (isAdminMember) {
        bannerTypes.push(BannerType.IS_ADMIN);
    }
    if (pluginAddress != null) {
        bannerTypes.push(BannerType.HAS_ADMIN);
    }

    const bannerContentList = bannerTypes.map((type) => {
        const content = bannerContent[type];
        return {
            priority: content.priority,
            message: content.message,
            buttonLabel: content.buttonLabel,
            buttonHref: content.buttonHref({ id }) as Route<string>,
        };
    });

    const sortedBannerContentList = [...bannerContentList].sort((a, b) => a.priority - b.priority);

    const priorityBannerContent = sortedBannerContentList.length > 0 ? sortedBannerContentList[0] : null;

    return {
        priorityBannerContent,
    };
}
