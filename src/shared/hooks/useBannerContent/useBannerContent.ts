import { useMember } from '@/modules/governance/api/governanceService';
import type { IBannerProps } from '@/shared/components/banner';
import { BannerContent } from '@/shared/constants/bannerContent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { BannerType } from '@/shared/types/enum/bannerType';
import { type Route } from 'next';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

export function useBannerContent({ id }: IBannerProps) {
    const { address } = useAccount();
    const isConnected = address != null;

    const adminPlugin = useDaoPlugins({
        daoId: id,
        subdomain: 'multisig',
    });
    const adminPluginAddress = useMemo(() => adminPlugin?.[0]?.meta?.address, [adminPlugin]);

    const { data: adminMember } = useMember(
        {
            queryParams: { daoId: id, pluginAddress: adminPluginAddress ?? '' },
            urlParams: { address: address ?? '' },
        },
        { enabled: Boolean(adminPluginAddress) && isConnected },
    );
    const isAdminMember = adminMember != null;

    const bannerTypes = useMemo(() => {
        const types: BannerType[] = [];
        if (isConnected) {
            if (isAdminMember) {
                types.push(BannerType.IS_ADMIN);
            }
            if (adminPluginAddress != null) {
                types.push(BannerType.HAS_ADMIN);
            }
        }
        return types;
    }, [isConnected, isAdminMember, adminPluginAddress]);

    const bannerContentList = useMemo(() => {
        return bannerTypes.map((type) => {
            const content = BannerContent[type];
            return {
                priority: content.priority,
                message: content.message,
                buttonLabel: content.buttonLabel,
                buttonHref: content.buttonHref({ id }) as Route<string>,
            };
        });
    }, [bannerTypes, id]);

    const sortedBannerContentList = useMemo(() => {
        return [...bannerContentList].sort((a, b) => a.priority - b.priority);
    }, [bannerContentList]);

    const bannerContent = useMemo(() => {
        if (sortedBannerContentList.length === 0) {
            return null;
        }
        return sortedBannerContentList[0];
    }, [sortedBannerContentList]);

    return {
        bannerContent,
    };
}
