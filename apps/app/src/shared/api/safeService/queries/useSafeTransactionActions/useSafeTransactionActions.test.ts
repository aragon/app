import { renderHook, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import type { ISafeTransactionActions } from '../../domain';
import { safeService } from '../../safeService';
import { useSafeTransactionActions } from './useSafeTransactionActions';

describe('useSafeTransactionActions query', () => {
    const getSafeTransactionActionsSpy = jest.spyOn(
        safeService,
        'getSafeTransactionActions',
    );

    afterEach(() => {
        getSafeTransactionActionsSpy.mockReset();
    });

    it('fetches the decoded actions of the specified Safe transaction', async () => {
        const urlParams = {
            network: Network.ETHEREUM_SEPOLIA,
            address: '0xeB88A1D01306Bd9d8442673ee78770f2665B008F',
            safeTxHash: '0xff54',
        };
        const actions: ISafeTransactionActions = {
            decoding: false,
            actions: [],
            rawActions: [],
        };
        getSafeTransactionActionsSpy.mockResolvedValue(actions);

        const { result } = renderHook(
            () => useSafeTransactionActions({ urlParams }),
            { wrapper: ReactQueryWrapper },
        );

        await waitFor(() => expect(result.current.data).toEqual(actions));
        expect(getSafeTransactionActionsSpy).toHaveBeenCalledWith({
            urlParams,
        });
    });
});
