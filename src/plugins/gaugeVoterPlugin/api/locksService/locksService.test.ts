import { Network } from '@/shared/api/daoService';
import { generateGaugeVoterLock } from '../../testUtils/generators/memberLock';
import { locksService } from '../locksService';

describe('locks service', () => {
    const requestSpy = jest.spyOn(locksService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getMemberLocks fetches the locks of the specified members', async () => {
        const locks = [generateGaugeVoterLock()];
        const params = {
            urlParams: { address: '0x123' },
            queryParams: {
                network: Network.ETHEREUM_SEPOLIA,
                escrowAddress: '0x456',
            },
        };

        requestSpy.mockResolvedValue(locks);
        const result = await locksService.getMemberLocks(params);

        expect(requestSpy).toHaveBeenCalledWith(
            locksService['urls'].memberLocks,
            params,
        );
        expect(result).toEqual(locks);
    });
});
