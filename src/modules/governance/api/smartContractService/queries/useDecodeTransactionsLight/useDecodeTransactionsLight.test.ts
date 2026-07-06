import { renderHook, waitFor } from '@testing-library/react';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { smartContractService } from '../../smartContractService';
import { useDecodeTransactionsLight } from './useDecodeTransactionsLight';

describe('useDecodeTransactionsLight query', () => {
    const decodeTransactionsLightSpy = jest.spyOn(
        smartContractService,
        'decodeTransactionsLight',
    );

    afterEach(() => {
        decodeTransactionsLightSpy.mockReset();
    });

    it('decodes the given actions through the smart contract service', async () => {
        const decodedActions = [
            {
                type: 'Unknown',
                from: '0x0',
                to: '0x1',
                data: '0x',
                value: '0',
                inputData: null,
            },
        ] as IProposalAction[];
        const params = {
            urlParams: {
                network: Network.ETHEREUM_MAINNET,
                address: '0xdao',
            },
            body: [{ to: '0x1', value: '0', data: '0x' }],
        };
        decodeTransactionsLightSpy.mockResolvedValue(decodedActions);

        const { result } = renderHook(
            () => useDecodeTransactionsLight(params),
            { wrapper: ReactQueryWrapper },
        );

        await waitFor(() => expect(result.current.data).toEqual(decodedActions));
        expect(decodeTransactionsLightSpy).toHaveBeenCalledWith(params);
    });
});
