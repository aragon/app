import { renderHook, waitFor } from '@testing-library/react';
import { generateToken } from '@/modules/finance/testUtils';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { financeService } from '../../financeService';
import { useTokenInfo } from './useTokenInfo';

describe('useTokenInfo query', () => {
    const financeServiceSpy = jest.spyOn(financeService, 'getTokenInfo');

    afterEach(() => {
        financeServiceSpy.mockReset();
    });

    it('fetches the token info for the specified network and address', async () => {
        const params = {
            network: Network.ETHEREUM_SEPOLIA,
            address: '0x8115B4F2aC13FC3444Ca88b448a1c8092793b569',
        };
        const token = generateToken({ address: params.address });
        financeServiceSpy.mockResolvedValue(token);
        const { result } = renderHook(
            () => useTokenInfo({ urlParams: params }),
            {
                wrapper: ReactQueryWrapper,
            },
        );
        await waitFor(() => expect(result.current.data).toEqual(token));
    });
});
