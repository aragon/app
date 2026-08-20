import { Network } from '@/shared/api/daoService';
import {
    generateSafeBalance,
    generateSafeInfo,
    generateSafeTransaction,
} from '@/shared/testUtils';
import { safeService } from './safeService';
import { safeServiceKeys } from './safeServiceKeys';

describe('safe service', () => {
    const requestSpy = jest.spyOn(safeService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    const urlParams = {
        network: Network.ETHEREUM_MAINNET,
        address: '0xSafeAddress',
    };

    it('getSafeInfo fetches the specified safe through the chain-id proxy path', async () => {
        const safeInfo = generateSafeInfo();
        requestSpy.mockResolvedValue(safeInfo);

        const result = await safeService.getSafeInfo({ urlParams });

        expect(requestSpy).toHaveBeenCalledWith(
            safeService['basePaths'].safeInfo,
            { urlParams: { chainId: '1', address: '0xSafeAddress' } },
        );
        expect(result).toEqual(safeInfo);
    });

    it('getSafePendingTransactions filters out transactions that can never execute', async () => {
        const transactions = {
            count: 1,
            next: null,
            previous: null,
            results: [generateSafeTransaction({ nonce: 12 })],
        };
        requestSpy.mockResolvedValue(transactions);

        const result = await safeService.getSafePendingTransactions({
            urlParams,
            queryParams: { currentNonce: 12, limit: 10 },
        });

        expect(requestSpy).toHaveBeenCalledWith(
            safeService['basePaths'].safePendingTransactions,
            {
                urlParams: { chainId: '1', address: '0xSafeAddress' },
                queryParams: {
                    executed: false,
                    nonce__gte: 12,
                    limit: 10,
                    offset: undefined,
                },
            },
        );
        expect(result).toEqual(transactions);
    });

    it('getSafeBalances fetches the balances of the specified safe', async () => {
        const balances = [generateSafeBalance()];
        requestSpy.mockResolvedValue(balances);

        const result = await safeService.getSafeBalances({ urlParams });

        expect(requestSpy).toHaveBeenCalledWith(
            safeService['basePaths'].safeBalances,
            { urlParams: { chainId: '1', address: '0xSafeAddress' } },
        );
        expect(result).toEqual(balances);
    });

    it('builds query keys that are unique per safe', () => {
        const otherParams = {
            urlParams: { ...urlParams, address: '0xOtherAddress' },
        };

        expect(safeServiceKeys.safeInfo({ urlParams })).not.toEqual(
            safeServiceKeys.safeInfo(otherParams),
        );
        expect(safeServiceKeys.safeInfo({ urlParams })).not.toEqual(
            safeServiceKeys.safeBalances({ urlParams }),
        );
    });
});
