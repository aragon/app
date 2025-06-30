'use server';

import { wagmiConfig } from '@/modules/application/constants/wagmi';
import type { IDaoPluginPageProps } from '@/modules/application/types';
import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { QueryClient } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { cookieToInitialState } from 'wagmi';
import { campaignListOptions, campaignStatsOptions, CampaignStatus } from '../../api/capitalDistributorService';
import { CapitalDistributorRewardsPageClient } from './capitalDistributorRewardsPageClient';

export interface ICapitalDistributorRewardsPageProps extends IDaoPluginPageProps {}

const getConnectedAccount = (wagmiState: ReturnType<typeof cookieToInitialState>): string | undefined => {
    const { connections, current } = wagmiState ?? {};
    if (connections instanceof Map && current) {
        return connections.get(current)?.accounts[0];
    }
    return undefined;
};

const campaignsPerPage = 5;

export const CapitalDistributorRewardsPage: React.FC<ICapitalDistributorRewardsPageProps> = async (props) => {
    const { dao } = props;

    const cookieHeader = (await headers()).get('cookie');
    const wagmiInitialState = cookieToInitialState(wagmiConfig, cookieHeader);

    const userAddress = getConnectedAccount(wagmiInitialState);

    const initialParams = userAddress
        ? {
              queryParams: {
                  pageSize: campaignsPerPage,
                  page: 1,
                  memberAddress: userAddress,
                  status: CampaignStatus.CLAIMABLE,
              },
          }
        : undefined;

    const queryClient = new QueryClient();

    queryClient.setQueryData(daoOptions({ urlParams: { id: dao.id } }).queryKey, dao);

    if (userAddress) {
        await queryClient.prefetchInfiniteQuery(campaignListOptions(initialParams!));
        await queryClient.fetchQuery(campaignStatsOptions({ urlParams: { memberAddress: userAddress } }));
    }

    return (
        <Page.Container queryClient={queryClient}>
            <CapitalDistributorRewardsPageClient dao={dao} initialParams={initialParams} />
        </Page.Container>
    );
};
