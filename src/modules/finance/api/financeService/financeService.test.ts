import { generateAsset, generateToken, generateTransaction } from '../../testUtils';
import { financeService } from './financeService';

describe('finance service', () => {
    const requestSpy = jest.spyOn(financeService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getAssetList fetches the assets of the specified DAO', async () => {
        const assets = [
            generateAsset({
                amount: '100',
                token: generateToken({ address: '0x123' }),
            }),
            generateAsset({
                amount: '200',
                token: generateToken({ address: '0x456' }),
            }),
        ];
        const params = { queryParams: { daoId: 'ethereum-mainnet-0x123' } };

        requestSpy.mockResolvedValue(assets);
        const result = await financeService.getAssetList(params);

        expect(requestSpy).toHaveBeenCalledWith(financeService.urls.assets, params);
        expect(result).toEqual(assets);
    });

    it('getTransactionList fetches the transactions of the specified DAO', async () => {
        const transactions = [generateTransaction({ transactionHash: '0x123' }), generateTransaction({ transactionHash: '0x456' })];
        const params = { queryParams: { daoId: 'ethereum-sepolia-0x456' } };

        requestSpy.mockResolvedValue(transactions);
        const result = await financeService.getTransactionList(params);

        expect(requestSpy).toHaveBeenCalledWith(financeService.urls.transactions, params);
        expect(result).toEqual(transactions);
    });
});
