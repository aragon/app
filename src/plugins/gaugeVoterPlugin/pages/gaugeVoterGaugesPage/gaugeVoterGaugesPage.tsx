'use server';

import type { IDaoPluginPageProps } from '@/modules/application/types';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { daoUtils } from '@/shared/utils/daoUtils';
import { QueryClient } from '@tanstack/react-query';
import type { Address } from 'viem';
import { gaugeListOptions } from '../../api/gaugeVoterService/queries';
import type { IGaugeVoterPlugin } from '../../types';
import { GaugeVoterGaugesPageClient } from './gaugeVoterGaugesPageClient';

export interface IGaugeVoterGaugesPageProps extends IDaoPluginPageProps {}

export const GaugeVoterGaugesPage: React.FC<IGaugeVoterGaugesPageProps> = async (props) => {
    const { dao } = props;

    const queryClient = new QueryClient();

    // Backend returns interfaceType: 'gauge', not 'gaugeVoter'
    const interfaceType = PluginInterfaceType.GAUGE;
    const plugins = daoUtils.getDaoPlugins(dao, { interfaceType });
    const plugin: IGaugeVoterPlugin | undefined = plugins?.[0];

    if (!plugin) {
        throw new Error(`Gauge plugin not found for DAO: ${dao.id}`);
    }

    const initialParams = {
        urlParams: {
            pluginAddress: plugin.address as Address,
            network: dao.network,
        },
        queryParams: {},
    };

    await queryClient.prefetchInfiniteQuery(gaugeListOptions(initialParams));

    return (
        <Page.Container queryClient={queryClient}>
            <GaugeVoterGaugesPageClient dao={dao} initialParams={initialParams} />
        </Page.Container>
    );
};
