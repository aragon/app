import { useMemberOf } from '@/modules/governance/api/governanceService/queries/useMemberOf';
import type { IBannerProps } from '@/shared/components/banner';
import { BannerContent } from '@/shared/constants/bannerContent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { BannerType } from '@/shared/types/enum/bannerType';
import { type Route } from 'next';
import { useAccount } from 'wagmi';

export function useBannerContent({ id }: IBannerProps) {
    const { address } = useAccount();

    // 'admin' subdomain is not currently set up, no DAO example to test this hook
    const adminPlugin = useDaoPlugins({
        daoId: id,
        subdomain: 'admin',
    });
    const adminPluginAddress = adminPlugin?.[0]?.meta?.address;

    // not currently working as endpoint is under construction by backend team
    const { data: isAdminMember } = useMemberOf(
        { urlParams: { address: address ?? '' }, queryParams: { pluginAddress: adminPluginAddress } },
        { enabled: address != null && adminPluginAddress != null },
    );

    const bannerTypes: BannerType[] = [];

    if (isAdminMember) {
        bannerTypes.push(BannerType.IS_ADMIN);
    }
    if (adminPluginAddress != null) {
        bannerTypes.push(BannerType.HAS_ADMIN);
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
