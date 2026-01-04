'use server';

import { QueryClient } from '@tanstack/react-query';
import { headers as nextHeaders } from 'next/headers';
import { cookieToInitialState } from 'wagmi';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import type { IDaoPluginPageProps } from '@/modules/application/types';
import { daoOptions, PluginInterfaceType } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { daoUtils } from '@/shared/utils/daoUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import {
    CampaignStatus,
    campaignListOptions,
} from '../../api/capitalDistributorService';
import type { ICapitalDistributorPlugin } from '../../types';
import { CapitalDistributorRewardsPageClient } from './capitalDistributorRewardsPageClient';

export interface ICapitalDistributorRewardsPageProps
    extends IDaoPluginPageProps {}

const getConnectedAccount = (
    cookieHeader: string | null,
): string | undefined => {
    const wagmiState = cookieToInitialState(wagmiConfig, cookieHeader);
    const { connections, current } = wagmiState ?? {};

    if (connections instanceof Map && current) {
        return connections.get(current)?.accounts[0];
    }

    return;
};

const campaignsPerPage = 5;

export const CapitalDistributorRewardsPage: React.FC<
    ICapitalDistributorRewardsPageProps
> = async (props) => {
    const { dao } = props;

    const queryClient = new QueryClient();
    const headers = await nextHeaders();

    const countryCode = headers.get('x-vercel-ip-country');
    const cookieHeader = headers.get('cookie');

    const userAddress = getConnectedAccount(cookieHeader);

    const interfaceType = PluginInterfaceType.CAPITAL_DISTRIBUTOR;
    const plugin: ICapitalDistributorPlugin = daoUtils.getDaoPlugins(dao, {
        interfaceType,
    })![0];

    const defaultQueryParams = {
        pluginAddress: plugin.address,
        network: dao.network,
        pageSize: campaignsPerPage,
        page: 1,
        sort: 'campaignId',
        status: CampaignStatus.CLAIMABLE,
    };
    const initialParams = {
        queryParams: {
            ...defaultQueryParams,
            userAddress: userAddress as string,
        },
    };

    queryClient.setQueryData(
        daoOptions({ urlParams: { id: dao.id } }).queryKey,
        dao,
    );

    if (countryCode != null && plugin.blockedCountries?.includes(countryCode)) {
        const context = {
            pluginAddress: plugin.address,
            userAddress,
            country: countryCode,
        };
        const errorNamespace =
            'app.plugins.capitalDistributor.capitalDistributorRewardsPage.error.restricted';
        monitoringUtils.logMessage(
            'Capital Distributor: Claim error (geolocation)',
            { level: 'warning', context },
        );

        return (
            <Page.Error
                descriptionKey={`${errorNamespace}.description`}
                titleKey={`${errorNamespace}.title`}
            />
        );
    }

    if (userAddress) {
        await queryClient.prefetchInfiniteQuery(
            campaignListOptions(initialParams),
        );
    }

    return (
        <Page.Container queryClient={queryClient}>
            <CapitalDistributorRewardsPageClient
                dao={dao}
                initialParams={initialParams}
            />
        </Page.Container>
    );
};
