import type { ISmokeDao, SmokeDaoFeature } from '../types';

export const SMOKE_DAOS: ISmokeDao[] = [
    {
        name: 'Cryptex',
        network: 'ethereum-mainnet',
        address: '0xf204245b0B05E9A0780761E326552A569c1D6ceb',
        features: ['spp', 'tokenvoting'],
    },
    {
        name: 'Aragon Automated Capital Flow',
        network: 'ethereum-sepolia',
        address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
        features: ['linkedaccounts'],
    },
    {
        name: 'Swiss Shield DAO',
        network: 'ethereum-mainnet',
        address: 'swiss-shield.dao.eth',
        features: ['multisig'],
    },
    {
        name: 'Katana vKAT Management',
        network: 'katana-mainnet',
        address: '0xb72291652f15cF73651357383c0A86FBba29B675',
        features: ['gauges', 'multisig', 'rewards'],
    },
];

export const getDaosWithFeature = (feature: SmokeDaoFeature) =>
    SMOKE_DAOS.filter((dao) => dao.features.includes(feature));
