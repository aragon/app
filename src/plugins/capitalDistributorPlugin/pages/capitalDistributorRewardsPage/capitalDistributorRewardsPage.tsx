'use server';

import { wagmiConfig } from '@/modules/application/constants/wagmi';
import type { IDaoPluginPageProps } from '@/modules/application/types';
import {
    campaignListOptions,
    campaignStatsOptions,
    CampaignStatus,
} from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { QueryClient } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { cookieToInitialState } from 'wagmi';
import { CapitalDistributorRewardsPageClient } from './capitalDistributorRewardsPageClient';

export interface ICapitalDistributorRewardsPageProps extends IDaoPluginPageProps {}

export const CapitalDistributorRewardsPage: React.FC<ICapitalDistributorRewardsPageProps> = async (props) => {
    const { dao } = props;

    const cookieHeader = (await headers()).get('cookie');
    const wagmiInitialState = cookieToInitialState(wagmiConfig, cookieHeader);

    let userAddress: string | undefined = undefined;
    const connections = wagmiInitialState?.connections;
    const currentConnection = wagmiInitialState?.current;

    if (connections instanceof Map && currentConnection) {
        const connection = connections.get(currentConnection);
        userAddress = connection?.accounts[0];
    }

    const queryClient = new QueryClient();

    queryClient.setQueryData(daoOptions({ urlParams: { id: dao.id } }).queryKey, dao);

    if (userAddress) {
        await queryClient.fetchQuery(
            campaignListOptions({ queryParams: { memberAddress: userAddress, status: CampaignStatus.CLAIMABLE } }),
        );
        await queryClient.fetchQuery(campaignStatsOptions({ urlParams: { memberAddress: userAddress } }));
    }

    return (
        <Page.Container queryClient={queryClient}>
            <CapitalDistributorRewardsPageClient dao={dao} />
        </Page.Container>
    );
};
