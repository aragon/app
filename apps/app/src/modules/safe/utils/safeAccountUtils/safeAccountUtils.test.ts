import { Network } from '@/shared/api/daoService';
import type { ISafeAccountPageParams } from '../../types';
import { safeAccountUtils } from './safeAccountUtils';

describe('safeAccountUtils', () => {
    const safeAddress = '0x1c8Cae0e29e1a0dc65f0f0E4C74dCE9f9C9F4a2B';

    describe('resolveSafeAccount', () => {
        it('normalises the address of a valid Safe route to its checksum', () => {
            const params = {
                network: Network.ETHEREUM_MAINNET,
                address: safeAddress.toLowerCase(),
            };

            expect(safeAccountUtils.resolveSafeAccount(params)).toEqual({
                network: Network.ETHEREUM_MAINNET,
                address: '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
            });
        });

        it.each([
            {
                name: 'an unknown network',
                params: { network: 'not-a-network', address: safeAddress },
            },
            {
                name: 'a malformed address',
                params: {
                    network: Network.ETHEREUM_MAINNET,
                    address: '0x123',
                },
            },
        ])('returns undefined for $name', ({ params }) => {
            expect(
                safeAccountUtils.resolveSafeAccount(
                    params as ISafeAccountPageParams,
                ),
            ).toBeUndefined();
        });
    });
});
