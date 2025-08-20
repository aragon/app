'use server';

import { wagmiConfig } from '@/modules/application/constants/wagmi';
import type { IDaoPluginPageProps } from '@/modules/application/types';
import { daoOptions, PluginInterfaceType } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { daoUtils } from '@/shared/utils/daoUtils';
import { QueryClient } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { cookieToInitialState } from 'wagmi';
import { campaignListOptions, campaignStatsOptions, CampaignStatus } from '../../api/capitalDistributorService';
import { CapitalDistributorRewardsPageClient } from './capitalDistributorRewardsPageClient';

export interface ICapitalDistributorRewardsPageProps extends IDaoPluginPageProps {}

const getConnectedAccount = (cookieHeader: string | null): string | undefined => {
    const wagmiState = cookieToInitialState(wagmiConfig, cookieHeader);
    const { connections, current } = wagmiState ?? {};

    if (connections instanceof Map && current) {
        return connections.get(current)?.accounts[0];
    }

    return undefined;
};

const campaignsPerPage = 5;

export const CapitalDistributorRewardsPage: React.FC<ICapitalDistributorRewardsPageProps> = async (props) => {
    const { dao } = props;

    const queryClient = new QueryClient();

    const cookieHeader = (await headers()).get('cookie');
    const userAddress = getConnectedAccount(cookieHeader);

    const plugin = daoUtils.getDaoPlugins(dao, { interfaceType: PluginInterfaceType.CAPITAL_DISTRIBUTOR })![0];
    const defaultQueryParams = {
        pluginAddress: plugin.address,
        network: dao.network,
        pageSize: campaignsPerPage,
        page: 1,
        sort: 'campaignId',
        status: CampaignStatus.CLAIMABLE,
    };
    const initialParams = { queryParams: { ...defaultQueryParams, userAddress: userAddress as string } };

    queryClient.setQueryData(daoOptions({ urlParams: { id: dao.id } }).queryKey, dao);

    if (userAddress) {
        await queryClient.prefetchInfiniteQuery(campaignListOptions(initialParams));
        await queryClient.prefetchQuery(campaignStatsOptions({ urlParams: { userAddress: userAddress } }));
    }

    return (
        <Page.Container queryClient={queryClient}>
            <CapitalDistributorRewardsPageClient dao={dao} initialParams={initialParams} />
        </Page.Container>
    );
};
