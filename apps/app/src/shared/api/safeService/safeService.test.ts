import { Network } from '@/shared/api/daoService';
import {
    generateSafeBalance,
    generateSafeInfo,
    generateSafeTransaction,
} from '@/shared/testUtils';
import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
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
        const transaction = generateSafeTransaction({ nonce: '12' });
        const { from, ...upstreamTransaction } = transaction;
        const transactions = {
            count: 1,
            next: null,
            previous: null,
            results: [{ ...upstreamTransaction, proposer: from }],
        };
        requestSpy.mockResolvedValue(transactions);

        const result = await safeService.getSafePendingTransactions({
            urlParams,
            queryParams: { currentNonce: '12', limit: 10 },
        });

        expect(requestSpy).toHaveBeenCalledWith(
            safeService['basePaths'].safePendingTransactions,
            {
                urlParams: { chainId: '1', address: '0xSafeAddress' },
                queryParams: {
                    executed: false,
                    nonce__gte: '12',
                    limit: 10,
                    offset: undefined,
                },
            },
        );
        expect(result).toEqual({ ...transactions, results: [transaction] });
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

    it('proposes a signed transaction through the Safe proxy', async () => {
        const body = {
            safeTransactionData: {
                to: '0xTargetAddress',
                value: '0',
                data: '0x1234',
                operation: 0 as const,
                safeTxGas: '0',
                baseGas: '0',
                gasPrice: '0',
                gasToken: '0xZeroAddress',
                refundReceiver: '0xZeroAddress',
                nonce: 3,
            },
            safeTxHash: '0xSafeTxHash',
            senderAddress: '0xSenderAddress',
            senderSignature: '0xSignature',
            origin: 'Aragon',
        };

        await safeService.proposeSafeTransaction({ urlParams, body });

        expect(requestSpy).toHaveBeenCalledWith(
            safeService['basePaths'].proposeSafeTransaction,
            {
                urlParams: { chainId: '1', address: '0xSafeAddress' },
                body: {
                    ...body.safeTransactionData,
                    contractTransactionHash: body.safeTxHash,
                    sender: body.senderAddress,
                    signature: body.senderSignature,
                    origin: body.origin,
                },
            },
            { method: 'POST' },
        );
    });

    it('confirms a transaction through the Safe proxy', async () => {
        const body = { signature: '0xSignature' };

        await safeService.confirmSafeTransaction({
            urlParams: {
                network: Network.ETHEREUM_MAINNET,
                safeTxHash: '0xSafeTxHash',
            },
            body,
        });

        expect(requestSpy).toHaveBeenCalledWith(
            safeService['basePaths'].confirmSafeTransaction,
            {
                urlParams: {
                    chainId: '1',
                    safeTxHash: '0xSafeTxHash',
                },
                body,
            },
            { method: 'POST' },
        );
    });

    it('rejects a successful response that does not match the Safe contract', async () => {
        requestSpy.mockResolvedValue({ address: '0xSafeAddress' });

        await expect(
            safeService.getSafeInfo({ urlParams }),
        ).rejects.toMatchObject({ code: 'invalid-response', status: 502 });
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
        expect(safeServiceKeys.safeInfo({ urlParams })).toEqual([
            'SAFE_INFO',
            apiVersionUtils.getApiVersion(),
            { urlParams },
        ]);
    });
});
