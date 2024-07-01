import { Network } from '@/shared/api/daoService';
import { generateAsset, generateToken, generateTransaction } from '../../testUtils';
import { financeService } from './financeService';

describe('finance service', () => {
    const requestSpy = jest.spyOn(financeService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getAssetList fetches the assets of the specified address and network', async () => {
        const assets = [
            generateAsset({ amount: '100', token: generateToken({ address: '0x123' }) }),
            generateAsset({ amount: '200', token: generateToken({ address: '0x456' }) }),
        ];
        const params = { queryParams: { address: '0x123', network: Network.ETHEREUM_MAINNET } };

        requestSpy.mockResolvedValue(assets);
        const result = await financeService.getAssetList(params);

        expect(requestSpy).toHaveBeenCalledWith(financeService['urls'].assets, params);
        expect(result).toEqual(assets);
    });

    it('getTransactionList fetches the transactions of the specified address and network', async () => {
        const transactions = [
            generateTransaction({ transactionHash: '0x123' }),
            generateTransaction({ transactionHash: '0x456' }),
        ];
        const params = { queryParams: { address: '0x456', network: Network.ETHEREUM_SEPOLIA } };

        requestSpy.mockResolvedValue(transactions);
        const result = await financeService.getTransactionList(params);

        expect(requestSpy).toHaveBeenCalledWith(financeService['urls'].transactions, params);
        expect(result).toEqual(transactions);
    });
});
