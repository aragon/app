'use server';

import { QueryClient } from '@tanstack/react-query';
import type { Address } from 'viem';
import type { IDaoPluginPageProps } from '@/modules/application/types';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { IGetGaugeListParams } from '../../api/gaugeVoterService';
import { gaugeListOptions } from '../../api/gaugeVoterService/queries';
import { GaugeVoterGaugesPageClient } from './gaugeVoterGaugesPageClient';

export interface IGaugeVoterGaugesPageProps extends IDaoPluginPageProps {}

export const GaugeVoterGaugesPage: React.FC<
    IGaugeVoterGaugesPageProps
> = async (props) => {
    const { dao } = props;

    const queryClient = new QueryClient();

    const interfaceType = PluginInterfaceType.GAUGE_VOTER;
    const plugins = daoUtils.getDaoPlugins(dao, { interfaceType });
    const plugin = plugins?.[0];

    if (!plugin) {
        throw new Error(`Gauge plugin not found for DAO: ${dao.id}`);
    }

    const initialParams: IGetGaugeListParams = {
        urlParams: {
            pluginAddress: plugin.address as Address,
            network: dao.network,
        },
        queryParams: {
            status: 'active',
        },
    };

    await queryClient.prefetchInfiniteQuery(gaugeListOptions(initialParams));

    return (
        <Page.Container queryClient={queryClient}>
            <GaugeVoterGaugesPageClient
                dao={dao}
                initialParams={initialParams}
            />
        </Page.Container>
    );
};
