import { generateSafeMultisigTransaction } from '@/plugins/safeMultisigPlugin/testUtils';
import { Network } from '@/shared/api/daoService';
import { safeService } from '@/shared/api/safeService';
import { generateSafeQueueResponse } from '@/shared/testUtils/generators/safeResponse';
import { safeTransactionLookupUtils } from './safeTransactionLookupUtils';

describe('safeTransactionLookup utils', () => {
    const getQueueSpy = jest.spyOn(safeService, 'getSafePendingTransactions');
    const getHistorySpy = jest.spyOn(safeService, 'getSafeTransactionHistory');

    const params = {
        network: Network.ETHEREUM_SEPOLIA,
        address: '0x5F2c8A1b9D3e7C4a6B0d2E8f1A3c5B7d9E0f2A4c',
        safeTxHash: '0xABC',
    };

    afterEach(() => {
        getQueueSpy.mockReset();
        getHistorySpy.mockReset();
    });

    it('returns the queued transaction matching the hash, whatever its casing, without reading the history', async () => {
        const transaction = generateSafeMultisigTransaction({
            safeTxHash: '0xabc',
        });
        getQueueSpy.mockResolvedValue(
            generateSafeQueueResponse({ results: [transaction] }),
        );

        await expect(
            safeTransactionLookupUtils.findTransaction(params),
        ).resolves.toEqual(transaction);
        expect(getHistorySpy).not.toHaveBeenCalled();
    });

    it('pages through the queue and then the history', async () => {
        const executed = generateSafeMultisigTransaction({
            safeTxHash: '0xabc',
            isExecuted: true,
        });
        getQueueSpy
            .mockResolvedValueOnce(
                generateSafeQueueResponse({
                    results: [
                        generateSafeMultisigTransaction({ safeTxHash: '0x1' }),
                    ],
                    next: 'next',
                }),
            )
            .mockResolvedValueOnce(generateSafeQueueResponse());
        getHistorySpy.mockResolvedValue(
            generateSafeQueueResponse({ results: [executed] }),
        );

        await expect(
            safeTransactionLookupUtils.findTransaction(params),
        ).resolves.toEqual(executed);
        expect(getQueueSpy).toHaveBeenNthCalledWith(2, {
            urlParams: { network: params.network, address: params.address },
            queryParams: { limit: expect.any(Number), offset: 1 },
        });
    });

    it('returns undefined when no transaction matches the hash', async () => {
        getQueueSpy.mockResolvedValue(generateSafeQueueResponse());
        getHistorySpy.mockResolvedValue(generateSafeQueueResponse());

        await expect(
            safeTransactionLookupUtils.findTransaction(params),
        ).resolves.toBeUndefined();
    });
});
