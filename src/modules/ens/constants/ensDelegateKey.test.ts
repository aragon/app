import { Network } from '@/shared/api/daoService';
import {
    buildEnsDelegateKey,
    NETWORK_EIP3770_SHORTNAME,
} from './ensDelegateKey';

describe('NETWORK_EIP3770_SHORTNAME', () => {
    it('maps Ethereum mainnet to "eth" (verified ENS DAO precedent)', () => {
        expect(NETWORK_EIP3770_SHORTNAME[Network.ETHEREUM_MAINNET]).toBe('eth');
    });

    it.each([
        { network: Network.ETHEREUM_SEPOLIA },
        { network: Network.POLYGON_MAINNET },
        { network: Network.BASE_MAINNET },
        { network: Network.ARBITRUM_MAINNET },
        { network: Network.OPTIMISM_MAINNET },
        { network: Network.AVAX_MAINNET },
        { network: Network.ZKSYNC_MAINNET },
        { network: Network.ZKSYNC_SEPOLIA },
        { network: Network.PEAQ_MAINNET },
        { network: Network.CITREA_MAINNET },
        { network: Network.KATANA_MAINNET },
        { network: Network.CHILIZ_MAINNET },
    ])('omits $network — unmapped until ENS confirms the cross-chain key shape', ({
        network,
    }) => {
        expect(NETWORK_EIP3770_SHORTNAME[network]).toBeUndefined();
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
        { network: Network.POLYGON_MAINNET },
        { network: Network.BASE_MAINNET },
        { network: Network.ARBITRUM_MAINNET },
        { network: Network.OPTIMISM_MAINNET },
        { network: Network.PEAQ_MAINNET },
    ])('throws for unmapped network $network', ({ network }) => {
        expect(() =>
            buildEnsDelegateKey({
                network,
                tokenAddress: '0x0000000000000000000000000000000000000001',
            }),
        ).toThrow(/EIP-3770 shortname/);
    });
});
