import { generateTokenLock } from './../../testUtils/generators/tokenLock';
import { tokenService } from '../tokenService';

describe('token service', () => {
    const requestSpy = jest.spyOn(tokenService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getMemberLocks fetches the locks of the specified members', async () => {
        const locks = [generateTokenLock()];
        const params = {
            urlParams: { address: '0xmember' },
            queryParams: {  },
        };

        requestSpy.mockResolvedValue(locks);
        const result = await tokenService.getTokenLocks(params);

        expect(requestSpy).toHaveBeenCalledWith(tokenService['urls'].memberLocks, params);
        expect(result).toEqual(locks);
    });
})
