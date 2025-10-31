import { useQuery } from '@tanstack/react-query';
import { gaugeVoterService } from '../../gaugeVoterService';
import { gaugeVoterServiceKeys } from '../../gaugeVoterServiceKeys';
import type { IUseGaugePluginParams } from './useGaugePlugin.api';

export const useGaugePlugin = (params: IUseGaugePluginParams) => {
    const { network, daoAddress, enabled = true } = params;

    return useQuery({
        queryKey: gaugeVoterServiceKeys.gaugePlugin({
            urlParams: { network, daoAddress },
            queryParams: { interfaceType: 'gauge' },
        }),
        queryFn: () =>
            gaugeVoterService.getGaugePlugin({
                urlParams: { network, daoAddress },
                queryParams: { interfaceType: 'gauge' },
            }),
        enabled: enabled && !!daoAddress,
    });
};
