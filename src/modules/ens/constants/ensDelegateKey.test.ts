import { Network } from '@/shared/api/daoService';
import {
    buildEnsDelegateKey,
    NETWORK_EIP3770_SHORTNAME,
} from './ensDelegateKey';

describe('NETWORK_EIP3770_SHORTNAME', () => {
    it.each([
        { network: Network.ETHEREUM_MAINNET, expected: 'eth' },
        { network: Network.POLYGON_MAINNET, expected: 'pol' },
        { network: Network.BASE_MAINNET, expected: 'base' },
        { network: Network.ARBITRUM_MAINNET, expected: 'arb1' },
        { network: Network.OPTIMISM_MAINNET, expected: 'oeth' },
        { network: Network.AVAX_MAINNET, expected: 'avax' },
        { network: Network.ZKSYNC_MAINNET, expected: 'zksync' },
        { network: Network.CHILIZ_MAINNET, expected: 'chzmainnet' },
        { network: Network.PEAQ_MAINNET, expected: 'PEAQ' },
        { network: Network.CITREA_MAINNET, expected: 'citrea' },
        { network: Network.HEMI_MAINNET, expected: 'hemi' },
        { network: Network.KATANA_MAINNET, expected: 'katana' },
    ])('maps mainnet $network to canonical EIP-3770 shortname "$expected"', ({
        network,
        expected,
    }) => {
        expect(NETWORK_EIP3770_SHORTNAME[network]).toBe(expected);
    });

    it.each([
        { network: Network.ETHEREUM_SEPOLIA },
    ])('maps testnet $network to the generic "test" namespace', ({
        network,
    }) => {
        expect(NETWORK_EIP3770_SHORTNAME[network]).toBe('test');
    });
});

describe('buildEnsDelegateKey', () => {
    it('formats the key as <shortname>.<lowercase tokenAddress>.delegate on mainnet', () => {
        const key = buildEnsDelegateKey({
            network: Network.ETHEREUM_MAINNET,
            tokenAddress: '0x1234ABCDef1234ABCDef1234ABCDef1234ABCDef',
        });
        expect(key).toBe(
            'eth.0x1234abcdef1234abcdef1234abcdef1234abcdef.delegate',
        );
    });

    it('uses the testnet "test" namespace for Sepolia tokens', () => {
        const key = buildEnsDelegateKey({
            network: Network.ETHEREUM_SEPOLIA,
            tokenAddress: '0x1234ABCDef1234ABCDef1234ABCDef1234ABCDef',
        });
        expect(key).toBe(
            'test.0x1234abcdef1234abcdef1234abcdef1234abcdef.delegate',
        );
    });

    it('lowercases mixed-case token addresses for canonical keys', () => {
        const a = buildEnsDelegateKey({
            network: Network.ETHEREUM_MAINNET,
            tokenAddress: '0xABCDEF1234567890abcdef1234567890ABCDEF12',
        });
        const b = buildEnsDelegateKey({
            network: Network.ETHEREUM_MAINNET,
            tokenAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        });
        expect(a).toBe(b);
    });

    it.each([
        { network: Network.POLYGON_MAINNET, prefix: 'pol' },
        { network: Network.BASE_MAINNET, prefix: 'base' },
        { network: Network.ARBITRUM_MAINNET, prefix: 'arb1' },
        { network: Network.OPTIMISM_MAINNET, prefix: 'oeth' },
        { network: Network.PEAQ_MAINNET, prefix: 'PEAQ' },
    ])('builds the key with the network shortname for $network', ({
        network,
        prefix,
    }) => {
        const key = buildEnsDelegateKey({
            network,
            tokenAddress: '0x0000000000000000000000000000000000000001',
        });
        expect(key).toBe(
            `${prefix}.0x0000000000000000000000000000000000000001.delegate`,
        );
    });
});
