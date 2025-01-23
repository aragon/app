import { Network } from '@/shared/api/daoService';
import { generateProposalAction, generateSmartContractAbi } from '../../testUtils';
import { smartContractService } from './smartContractService';

describe('smartContract service', () => {
    const requestSpy = jest.spyOn(smartContractService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getAbi fetches the ABI of the specified smart contract', async () => {
        const abi = generateSmartContractAbi();
        const params = { urlParams: { network: Network.ETHEREUM_SEPOLIA, address: '0x123' } };

        requestSpy.mockResolvedValue(abi);
        const result = await smartContractService.getAbi(params);

        expect(requestSpy).toHaveBeenCalledWith(smartContractService['urls'].abi, params);
        expect(result).toEqual(abi);
    });

    it('decodeTransaction decodes the given raw transaction and returns a proposal action', async () => {
        const proposalAction = generateProposalAction();
        const urlParams = { network: Network.ETHEREUM_MAINNET, address: '0x123' };
        const body = { data: '0x001', value: '10000', from: '0x456' };

        requestSpy.mockResolvedValue(proposalAction);
        const result = await smartContractService.decodeTransaction({ urlParams, body });

        expect(requestSpy).toHaveBeenCalledWith(
            smartContractService['urls'].decodeTransaction,
            { urlParams, body },
            { method: 'POST' },
        );
        expect(result).toEqual(proposalAction);
    });
});
