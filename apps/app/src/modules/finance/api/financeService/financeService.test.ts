import { Network } from '@/shared/api/daoService';
import {
    generateAsset,
    generateToken,
    generateTransaction,
} from '../../testUtils';
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

        expect(requestSpy).toHaveBeenCalledWith(
            financeService['urls'].assets,
            params,
        );
        expect(result).toEqual(assets);
    });

    it('getTransactionList fetches the transactions of the specified DAO', async () => {
        const transactions = [
            generateTransaction({ transactionHash: '0x123' }),
            generateTransaction({ transactionHash: '0x456' }),
        ];
        const params = { queryParams: { daoId: 'ethereum-sepolia-0x456' } };

        requestSpy.mockResolvedValue(transactions);
        const result = await financeService.getTransactionList(params);

        expect(requestSpy).toHaveBeenCalledWith(
            financeService['urls'].transactions,
            params,
        );
        expect(result).toEqual(transactions);
    });

    it('getTransactionActions fetches the decoded actions of the specified execution transaction', async () => {
        const params = {
            urlParams: {
                network: Network.ETHEREUM_SEPOLIA,
                id: 'execution-id',
            },
        };
        const actions = {
            source: 'router',
            actionCount: 1,
            executedBy: '0x123',
            transactionHash: '0xabc',
            blockTimestamp: 1_700_000_000,
            decoding: false,
            actions: [],
            rawActions: [],
        };

        requestSpy.mockResolvedValue(actions);
        const result = await financeService.getTransactionActions(params);

        expect(requestSpy).toHaveBeenCalledWith(
            financeService['urls'].transactionActions,
            params,
        );
        expect(result).toEqual(actions);
    });
});
