import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useReadContract } from 'wagmi';

const gaugeRegistrarAbi = [
    {
        type: 'function',
        name: 'getAllRegisteredGaugeDetails',
        inputs: [],
        outputs: [
            {
                components: [
                    { internalType: 'address', name: 'gaugeAddress', type: 'address' },
                    { internalType: 'address', name: 'qiToken', type: 'address' },
                    { internalType: 'enum IGaugeRegistrar.Incentive', name: 'incentive', type: 'uint8' },
                    { internalType: 'address', name: 'rewardController', type: 'address' },
                ],
                internalType: 'struct IGaugeRegistrar.RegisteredGauge[]',
                name: '',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
    },
] as const;

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

export const useGaugeRegistrarGauges = (params: IUseGaugeRegistrarGaugesParams) => {
    const { pluginAddress, gaugeVoterAddress, network } = params;
    const { id: chainId } = networkDefinitions[network];

    const { data, isLoading, error, refetch } = useReadContract({
        address: pluginAddress as `0x${string}`,
        abi: gaugeRegistrarAbi,
        functionName: 'getAllRegisteredGaugeDetails',
        chainId,
    });

    // useGauges to get all gauges for metadata (name, description, avatar)

    return {
        data: [
            {
                gaugeAddress: `0x6818013d7b2d49d7396ba9733b59c539a639f3ed`,
                qiToken: `0x6818013d7b2d49d7396ba9733b59c539a639f3ed`,
                incentive: 0,
                rewardController: `0x6818013d7b2d49d7396ba9733b59c539a639f3ed`,
            },
        ],
        isLoading,
        error,
        refetch,
    };
};
