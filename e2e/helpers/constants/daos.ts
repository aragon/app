import type { ISmokeDao } from '../types';

export const SMOKE_DAOS: ISmokeDao[] = [
    {
        name: 'Ethereum',
        network: 'ethereum-mainnet',
        address: '0xA20FBC97b9F09D19a1ccF31ce3627dB44f6252bB',
    },
    {
        name: 'Polygon',
        network: 'polygon-mainnet',
        address: '0x82B9A5f7283b6FC8668B8a1Fb7f3e4ea1B35E3a7',
    },
    {
        name: 'Base',
        network: 'base-mainnet',
        address: '0x8116711B74748672e7946befC14AD43Cf8F15ec4',
    },
    {
        name: 'Arbitrum',
        network: 'arbitrum-mainnet',
        address: '0x1b5B61f33e2d012A848C7E3c50d3238CA486e10e',
    },
    {
        name: 'zkSync',
        network: 'zksync-mainnet',
        address: '0x4890d3899c3E960B9e64d848FdEf503243F5B470',
    },
];
