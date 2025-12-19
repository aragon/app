import { useAllGauges } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { addressUtils } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { useReadContract } from 'wagmi';
import { gaugeRegistrarAbi } from '../../constants/gaugeRegistrarAbi';
import type { IRegisteredGauge } from '../../types/gaugeRegistrar';

export interface IUseGaugeRegistrarGaugesParams {
    /**
     * Address of the gauge registrar plugin contract
     */
    pluginAddress: string;
    /**
     * Address of the GaugeVoter plugin, to get gauge details from.
     */
    gaugeVoterAddress: string;
    /**
     * Network to query
     */
    network: Network;
}

/**
 * Returns merged data from GaugeRegistrar contract and GaugeVoter contract (over backend API).
 */
export const useGaugeRegistrarGauges = (params: IUseGaugeRegistrarGaugesParams) => {
    const { pluginAddress, gaugeVoterAddress, network } = params;
    const { id: chainId } = networkDefinitions[network];

    const {
        data: allGauges,
        isLoading: isAllGaugesLoading,
        error: allGaugesError,
        refetch: refetchAllGauges,
    } = useAllGauges({
        gaugeListParams: {
            urlParams: {
                pluginAddress: gaugeVoterAddress as Hex,
                network,
            },
            queryParams: {},
        },
    });

    const {
        data: gaugesFromRegistrar,
        isLoading: isGaugesFromRegistrarLoading,
        error: gaugesFromRegistrarError,
        refetch: refetchGaugesFromRegistrar,
    } = useReadContract({
        address: pluginAddress as `0x${string}`,
        abi: gaugeRegistrarAbi,
        functionName: 'getAllRegisteredGaugeDetails',
        chainId,
    });

    // We need to get metadata from the backend API (name, description, avatar), but we also need registrar specific data.
    const mergedData =
        allGauges.length && gaugesFromRegistrar
            ? gaugesFromRegistrar.map((gaugeFromRegistrar) => {
                  const gauge = allGauges.find((gauge) =>
                      addressUtils.isAddressEqual(gauge.address, gaugeFromRegistrar.gaugeAddress),
                  );
                  return { ...gauge, ...gaugeFromRegistrar };
              })
            : undefined;

    const handleRefetch = () => {
        void refetchGaugesFromRegistrar();
        void refetchAllGauges();
    };

    return {
        data: mergedData as unknown as IRegisteredGauge[] | undefined,
        isLoading: isAllGaugesLoading || isGaugesFromRegistrarLoading,
        error: allGaugesError ?? gaugesFromRegistrarError,
        refetch: handleRefetch,
    };
};
