// LMM_DEMO_HACK: regression tests for the demo safety guardrails.  These
// exist so a careless change to `LMM_RPC_ALLOWLIST` or `assertForkRpc()`
// can't silently allow demo writes against a production chain.

import type { LmmManifest } from './lmmDemoConfig';
import { assertForkRpc, manifestFingerprintCheck } from './safety';

const FAKE_MANIFEST: LmmManifest = {
    chainId: 1,
    aragon: {
        daoFactory: '0x1111111111111111111111111111111111111111',
        pluginSetupProcessor: '0x2222222222222222222222222222222222222222',
    },
    lmm: {
        dao: '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        dispatcher: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
        strategies: [],
    },
    metadata: { name: 'LMM demo', description: '' },
};

describe('flow/demo/safety', () => {
    describe('assertForkRpc', () => {
        it('accepts localhost RPCs', () => {
            expect(() => assertForkRpc('http://localhost:8545')).not.toThrow();
        });
        it('accepts 127.0.0.1 RPCs', () => {
            expect(() => assertForkRpc('http://127.0.0.1:8545')).not.toThrow();
        });
        it('refuses an arbitrary mainnet RPC', () => {
            expect(() =>
                assertForkRpc('https://mainnet.infura.io/v3/abc'),
            ).toThrow(/refusing to use RPC/);
        });
        it('refuses a similar-looking domain that is not in the allowlist', () => {
            expect(() => assertForkRpc('https://aragon.org')).toThrow(
                /refusing to use RPC/,
            );
        });
    });
    describe('manifestFingerprintCheck', () => {
        it('passes when indexer DAO matches manifest', () => {
            expect(
                manifestFingerprintCheck(
                    FAKE_MANIFEST,
                    FAKE_MANIFEST.lmm.dao.toLowerCase(),
                ),
            ).toBe(true);
        });
        it('fails when indexer DAO differs', () => {
            expect(
                manifestFingerprintCheck(
                    FAKE_MANIFEST,
                    '0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
                ),
            ).toBe(false);
        });
        it('returns true when no indexer DAO is supplied', () => {
            expect(manifestFingerprintCheck(FAKE_MANIFEST, undefined)).toBe(
                true,
            );
        });
    });
});
