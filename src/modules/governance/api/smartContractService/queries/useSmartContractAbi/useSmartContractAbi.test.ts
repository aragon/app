import { generateSmartContractAbi } from '@/modules/governance/testUtils';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { smartContractService } from '../../smartContractService';
import { useSmartContractAbi } from './useSmartContractAbi';

describe('useSmartContractAbi query', () => {
    const getAbiSpy = jest.spyOn(smartContractService, 'getAbi');

    afterEach(() => {
        getAbiSpy.mockReset();
    });

    it('fetches the abi for the given smart contract and network', async () => {
        const abi = generateSmartContractAbi();
        getAbiSpy.mockResolvedValue(abi);

        const urlParams = { network: Network.ETHEREUM_MAINNET, address: '0x123' };
        const { result } = renderHook(() => useSmartContractAbi({ urlParams }), { wrapper: ReactQueryWrapper });

        await waitFor(() => expect(result.current.data).toEqual(abi));
    });
});
