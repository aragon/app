/**
 * @jest-environment node
 */

import { Network } from '@/shared/api/daoService';
import { testLogger } from '@/test/utils';
import {
    assertServerSafeConfig,
    resolveServerSafeApiKey,
    resolveServerSafeUrl,
} from './resolveServerSafeUrl';

describe('resolveServerSafeUrl', () => {
    const originalProcessEnv = process.env;

    beforeEach(() => {
        process.env.NEXT_SECRET_SAFE_API_KEY = 'test-safe-key';
        process.env.NEXT_RUNTIME = 'nodejs';
        process.env.CI = 'false';
    });

    afterEach(() => {
        process.env = { ...originalProcessEnv };
    });

    it.each([
        { network: Network.ETHEREUM_MAINNET, shortName: 'eth' },
        { network: Network.ETHEREUM_SEPOLIA, shortName: 'sep' },
        { network: Network.POLYGON_MAINNET, shortName: 'pol' },
        { network: Network.BASE_MAINNET, shortName: 'base' },
        { network: Network.ARBITRUM_MAINNET, shortName: 'arb1' },
        { network: Network.OPTIMISM_MAINNET, shortName: 'oeth' },
        { network: Network.AVAX_MAINNET, shortName: 'avax' },
        { network: Network.ZKSYNC_MAINNET, shortName: 'zksync' },
        { network: Network.HEMI_MAINNET, shortName: 'hemi' },
        { network: Network.KATANA_MAINNET, shortName: 'katana' },
        { network: Network.MONAD_MAINNET, shortName: 'monad' },
    ])('resolves the $shortName endpoint for the $network network', ({
        network,
        shortName,
    }) => {
        expect(resolveServerSafeUrl(network)).toEqual({
            shortName,
            baseUrl: `https://api.safe.global/tx-service/${shortName}/api`,
        });
    });

    it.each([
        { network: Network.CITREA_MAINNET },
        { network: Network.CHILIZ_MAINNET },
    ])('returns undefined for the unserved $network network', ({ network }) => {
        expect(resolveServerSafeUrl(network)).toBeUndefined();
    });

    describe('resolveServerSafeApiKey', () => {
        it('returns the key when running on a node server runtime', () => {
            expect(resolveServerSafeApiKey()).toEqual('test-safe-key');
        });

        it('returns undefined outside a server runtime so the key stays out of client chunks', () => {
            testLogger.suppressErrors();
            delete process.env.NEXT_RUNTIME;
            expect(resolveServerSafeApiKey()).toBeUndefined();
        });
    });

    describe('assertServerSafeConfig', () => {
        it('throws when the key is missing outside CI', () => {
            delete process.env.NEXT_SECRET_SAFE_API_KEY;
            expect(() => assertServerSafeConfig()).toThrow(
                /NEXT_SECRET_SAFE_API_KEY/,
            );
        });

        it('does not throw when the key is missing on CI', () => {
            delete process.env.NEXT_SECRET_SAFE_API_KEY;
            process.env.CI = 'true';
            expect(() => assertServerSafeConfig()).not.toThrow();
        });

        it('does not throw when the key is set', () => {
            expect(() => assertServerSafeConfig()).not.toThrow();
        });
    });
});
