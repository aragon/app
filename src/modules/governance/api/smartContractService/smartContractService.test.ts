import { Network } from '@/shared/api/daoService';
import { generateSmartContractAbi } from '../../testUtils';
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
});
