import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { addressUtils } from '@aragon/gov-ui-kit';
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

    const {
        data: gaugesFromRegistrar,
        isLoading,
        error,
        refetch,
    } = useReadContract({
        address: pluginAddress as `0x${string}`,
        abi: gaugeRegistrarAbi,
        functionName: 'getAllRegisteredGaugeDetails',
        chainId,
    });

    // We need to get metadata from the backend API (name, description, avatar), but we also need registrar specific data.
    const { data: gauges } = useGauges({ network, pluginAddress: gaugeVoterAddress });

    const mergedData =
        gauges && gaugesFromRegistrar
            ? gaugesFromRegistrar.map((gaugeFromRegistrar) => {
                  const gauge = gauges.find((gauge) =>
                      addressUtils.isAddressEqual(gauge.address, gaugeFromRegistrar.gaugeAddress),
                  );
                  return { ...gauge, ...gaugeFromRegistrar };
              })
            : undefined;

    return {
        data: [
            {
                gaugeAddress: `0x1234567890123456789012345678901234567890`,
                qiToken: `0x6818013d7b2d49d7396ba9733b59c539a639f3ed`,
                incentive: 0,
                rewardController: `0x6818013d7b2d49d7396ba9733b59c539a639f3ed`,
                address: '0x1234567890123456789012345678901234567890',
                name: 'Charged Particles',
                description:
                    'Charged Particles is the groundbreaking protocol that lets you put digital assets inside your NFTs. Now, ordinary NFTs (think neutral molecules) can contain a digital "charge" inside — ERC20, ERC721 or ERC1155 — giving you the unprecedented power to create nested NFTs. If you can digitize it, you can deposit it into your NFTs.',
                avatar: 'https://pbs.twimg.com/profile_images/1721880644345622528/G2czctJJ_400x400.jpg',
                totalVotes: 432345,
                userVotes: 16000,
                links: [
                    {
                        name: 'Website',
                        url: 'https://charged.fi',
                    },
                    {
                        name: 'Docs',
                        url: 'https://forum.charged.fi',
                    },
                ],
            },
            {
                gaugeAddress: `0x9834567890123456789012345678901234569834`,
                qiToken: `0x6818013d7b2d49d7396ba9733b59c539a639f3ed`,
                incentive: 0,
                rewardController: `0x6818013d7b2d49d7396ba9733b59c539a639f3ed`,
                address: '0x9834567890123456789012345678901234569834',
                name: 'Ionic',
                description: 'Ionic is a powerful protocol that enables the creation of nested NFTs.',
                avatar: 'https://raw.githubusercontent.com/mode-network/brandkit/refs/heads/main/Assets/Logo/Token.png',
                totalVotes: 287612,
                userVotes: 12000,
                links: [],
            },
        ],
        isLoading,
        error,
        refetch,
    };
};

function useGauges({ pluginAddress, network }: { pluginAddress: string; network: Network }) {
    return [
        {
            address: '0x1234567890123456789012345678901234567890',
            name: 'Charged Particles',
            description:
                'Charged Particles is the groundbreaking protocol that lets you put digital assets inside your NFTs. Now, ordinary NFTs (think neutral molecules) can contain a digital "charge" inside — ERC20, ERC721 or ERC1155 — giving you the unprecedented power to create nested NFTs. If you can digitize it, you can deposit it into your NFTs.',
            logo: 'https://pbs.twimg.com/profile_images/1721880644345622528/G2czctJJ_400x400.jpg',
            totalVotes: 432345,
            userVotes: 16000,
            links: [
                {
                    name: 'Website',
                    url: 'https://charged.fi',
                },
                {
                    name: 'Docs',
                    url: 'https://forum.charged.fi',
                },
            ],
        },
        {
            address: '0x9834567890123456789012345678901234569834',
            name: 'Ionic',
            description: 'Ionic is a powerful protocol that enables the creation of nested NFTs.',
            logo: 'https://raw.githubusercontent.com/mode-network/brandkit/refs/heads/main/Assets/Logo/Token.png',
            totalVotes: 287612,
            userVotes: 12000,
            links: [],
        },
        {
            address: '0x5678901234567890123456789012345678905678',
            name: 'DeFi Forge',
            description:
                'DeFi Forge is a decentralized liquidity protocol where users can earn yield on their crypto assets through optimized farming strategies and automated market making.',
            logo: 'https://aragon-1.mypinata.cloud/ipfs/QmRXNfeMtFVGuuJFLFBj8WuH6ZjMr6kykzNfesinF5mhA7',
            totalVotes: 354891,
            userVotes: 0,
            links: [
                {
                    name: 'Website',
                    url: 'https://defiforge.io',
                },
                {
                    name: 'Twitter',
                    url: 'https://twitter.com/defiforge',
                },
                {
                    name: 'Discord',
                    url: 'https://discord.gg/defiforge',
                },
            ],
        },
    ];
}
