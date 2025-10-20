'use server';

import { wagmiConfig } from '@/modules/application/constants/wagmi';
import type { IDaoPluginPageProps } from '@/modules/application/types';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { daoUtils } from '@/shared/utils/daoUtils';
import { QueryClient } from '@tanstack/react-query';
import { headers as nextHeaders } from 'next/headers';
import { cookieToInitialState } from 'wagmi';
import type { IGaugeVoterPlugin } from '../../types';
import { GaugeVoterGaugesPageClient } from './gaugeVoterGaugesPageClient';

export interface IGaugeVoterGaugesPageProps extends IDaoPluginPageProps {}

// TODO: Move this to a shared utils file
const getConnectedAccount = (cookieHeader: string | null): string | undefined => {
    const wagmiState = cookieToInitialState(wagmiConfig, cookieHeader);
    const { connections, current } = wagmiState ?? {};

    if (connections instanceof Map && current) {
        return connections.get(current)?.accounts[0];
    }

    return undefined;
};

const gaugesPerPage = 5;

export const GaugeVoterGaugesPage: React.FC<IGaugeVoterGaugesPageProps> = async (props) => {
    const { dao } = props;

    const queryClient = new QueryClient();
    const headers = await nextHeaders();

    const interfaceType = PluginInterfaceType.GAUGE_VOTER;
    const plugin: IGaugeVoterPlugin = daoUtils.getDaoPlugins(dao, { interfaceType })![0];

    const cookieHeader = headers.get('cookie');
    const userAddress = getConnectedAccount(cookieHeader);

    const defaultQueryParams = {
        pluginAddress: plugin.address,
        network: dao.network,
        pageSize: gaugesPerPage,
        page: 1,
        userAddress: userAddress ?? '',
    };
    const initialParams = {
        urlParams: {
            userAddress: userAddress ?? '',
        },
        queryParams: defaultQueryParams,
    };

    // const initialParams = {
    //     urlParams: {
    //         userAddress: userAddress ?? '',
    //     },
    //     queryParams: {
    //         pluginAddress: plugin.address,
    //         network: dao.network,
    //     },
    // };

    return (
        <Page.Container queryClient={queryClient}>
            <GaugeVoterGaugesPageClient dao={dao} initialParams={initialParams} />
        </Page.Container>
    );
};
