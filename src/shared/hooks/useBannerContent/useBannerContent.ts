import { useMember } from '@/modules/governance/api/governanceService';
import { useMemberOf } from '@/modules/governance/api/governanceService/queries/useMemberOf';
import type { IBannerProps } from '@/shared/components/banner';
import { BannerContent } from '@/shared/constants/bannerContent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { BannerType } from '@/shared/types/enum/bannerType';
import { type Route } from 'next';
import { useAccount } from 'wagmi';

export function useBannerContent({ id }: IBannerProps) {
    const { address } = useAccount();
    const isConnected = address != null;

    // 'admin' subdomain is not currently set up
    const adminPlugin = useDaoPlugins({
        daoId: id,
        subdomain: 'admin',
    });
    const adminPluginAddress = adminPlugin?.[0]?.meta?.address;

    // this endpoint will change, nullish metrics is just an easy boolean until a proper endpoint is available
    const { data: isMember } = useMember(
        { urlParams: { address: address ?? '' }, queryParams: { daoId: id } },
        { enabled: isConnected && !!adminPluginAddress },
    );
    const isDaoMember = isMember?.metrics != null;

    // Not currently working as expected due to no '.../exists' endpoint
    const { data: isAdminMember } = useMemberOf(
        { urlParams: { address: address ?? '', pluginAddress: adminPluginAddress ?? '' } },
        { enabled: isDaoMember },
    );

    const bannerTypes: BannerType[] = [];
    if (isConnected && isDaoMember) {
        if (isAdminMember) {
            bannerTypes.push(BannerType.IS_ADMIN);
        }
        if (adminPluginAddress != null) {
            bannerTypes.push(BannerType.HAS_ADMIN);
        }
    }

    const bannerContentList = bannerTypes.map((type) => {
        const content = BannerContent[type];
        return {
            priority: content.priority,
            message: content.message,
            buttonLabel: content.buttonLabel,
            buttonHref: content.buttonHref({ id }) as Route<string>,
        };
    });

    const sortedBannerContentList = [...bannerContentList].sort((a, b) => a.priority - b.priority);

    const bannerContent = sortedBannerContentList.length > 0 ? sortedBannerContentList[0] : null;

    return {
        bannerContent,
    };
}
