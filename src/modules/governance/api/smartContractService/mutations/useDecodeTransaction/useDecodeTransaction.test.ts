import { generateProposalAction } from '@/modules/governance/testUtils';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { smartContractService } from '../../smartContractService';
import { useDecodeTransaction } from './useDecodeTransaction';

describe('useDecodeTransaction mutation', () => {
    const decodeTransactionSpy = jest.spyOn(smartContractService, 'decodeTransaction');

    afterEach(() => {
        decodeTransactionSpy.mockReset();
    });

    it('decodes the given transaction and returns a proposal action', async () => {
        const proposalAction = generateProposalAction();
        const body = { data: '0x', from: '0x123', value: '1000000' };
        const urlParams = { network: Network.ETHEREUM_MAINNET, address: '0x456' };
        decodeTransactionSpy.mockResolvedValue(proposalAction);
        const { result } = renderHook(() => useDecodeTransaction(), { wrapper: ReactQueryWrapper });
        act(() => result.current.mutate({ body, urlParams }));
        await waitFor(() => expect(result.current.data).toEqual(proposalAction));
        expect(decodeTransactionSpy).toHaveBeenCalledWith({ body, urlParams });
    });
});
