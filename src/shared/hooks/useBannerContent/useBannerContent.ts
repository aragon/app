import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import { useDao } from '@/shared/api/daoService';
import type { IBannerContent, IBannerProps } from '@/shared/components/banner';
import { BannerContent } from '@/shared/constants/bannerContent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { BannerType } from '@/shared/types/enum/bannerType';
import { type Route } from 'next';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

export function useBannerContent({ id }: IBannerProps) {
    const { address } = useAccount();

    const params = { id };
    const { data: dao } = useDao({ urlParams: params });

    const processedPlugins = useDaoPlugins({ daoId: id });

    const { memberList } = useMemberListData({
        queryParams: { daoId: id, pluginAddress: processedPlugins![0].meta.address },
    });

    const isMember = useMemo(() => {
        if (!dao || !address) {
            return false;
        }

        return memberList?.some((member) => member.address === address) ?? false;
    }, [dao, address, memberList]);

    // const hasAdmin = useMemo(() => {
    //     if (!dao) {
    //         return '';
    //     }

    //     return dao.plugins.find((plugin) => plugin.subdomain === 'admin')?.address;
    // }, [dao]);

    const isAdmin = useMemo(() => {
        if (!dao || !address) {
            return false;
        }

        return dao.creator.address === address; // TODO: Replace with actual admin check when available
    }, [dao, address]);

    const bannerTypes = useMemo<BannerType[]>(() => {
        const types: BannerType[] = [];

        if (!dao || !isMember) {
            return types;
        }

        if (isAdmin) {
            types.push(BannerType.IS_ADMIN);
        } else {
            types.push(BannerType.HAS_ADMIN);
        }

        return types;
    }, [dao, isMember, isAdmin]);

    const bannerContentList = useMemo<Array<IBannerContent<string>>>(() => {
        return bannerTypes.map((type) => {
            const content = BannerContent[type];
            return {
                priority: content.priority,
                message: content.message,
                buttonLabel: content.buttonLabel,
                href: content.href({ id }) as Route<string>,
            };
        });
    }, [bannerTypes, id]);

    const sortedBannerContentList = useMemo<Array<IBannerContent<string>>>(() => {
        return [...bannerContentList].sort((a, b) => a.priority - b.priority);
    }, [bannerContentList]);

    const bannerContent = useMemo<IBannerContent<string> | null>(() => {
        if (sortedBannerContentList.length === 0) {
            return null;
        }
        return sortedBannerContentList[0];
    }, [sortedBannerContentList]);

    return {
        bannerContent,
    };
}
