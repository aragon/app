import { Network } from '@/shared/api/daoService';
import { generateTokenLock } from '../../testUtils/generators/memberLock';
import { tokenService } from '../tokenService';

describe('token service', () => {
    const requestSpy = jest.spyOn(tokenService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getMemberLocks fetches the locks of the specified members', async () => {
        const locks = [generateTokenLock()];
        const params = {
            urlParams: { address: '0x123' },
            queryParams: {
                network: Network.ETHEREUM_SEPOLIA,
                escrowAddress: '0x456',
            },
        };

        requestSpy.mockResolvedValue(locks);
        const result = await tokenService.getMemberLocks(params);

        expect(requestSpy).toHaveBeenCalledWith(
            tokenService['urls'].memberLocks,
            params,
        );
        expect(result).toEqual(locks);
    });
});
