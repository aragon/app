import { Network } from '@/shared/api/daoService';
import { generateSafeBalance } from '@/shared/testUtils';
import { safeTransactionService } from './safeTransactionService';

describe('safe transaction service', () => {
    const requestSpy = jest.spyOn(safeTransactionService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    const safeAddress = '0xd84C233A7D1578021d21E39785439bEdDB165F3D';

    const urlParams = {
        network: Network.ETHEREUM_MAINNET,
        address: safeAddress,
    };

    it('getSafeBalances still reads the transaction service through the proxy', async () => {
        const balances = [generateSafeBalance()];
        requestSpy.mockResolvedValue(balances);

        const result = await safeTransactionService.getSafeBalances({
            urlParams,
        });

        expect(requestSpy).toHaveBeenCalledWith(
            safeTransactionService['basePaths'].safeBalances,
            { urlParams: { chainId: '1', address: safeAddress } },
        );
        expect(result).toEqual(balances);
    });

    it('proposes a signed transaction in the flattened wire shape', async () => {
        // The transaction service expects the fields flattened with its own names; the nested domain
        // shape is rejected with 422.
        requestSpy.mockResolvedValue(undefined);
        const body = {
            safeTransactionData: {
                to: safeAddress,
                value: '0',
                data: '0xreport',
                operation: 0 as const,
                safeTxGas: '0',
                baseGas: '0',
                gasPrice: '0',
                gasToken: `0x${'0'.repeat(40)}`,
                refundReceiver: `0x${'0'.repeat(40)}`,
                nonce: 7,
            },
            safeTxHash: `0x${'1'.repeat(64)}`,
            senderAddress: safeAddress,
            senderSignature: '0xsignature',
            origin: 'Aragon',
        };

        await safeTransactionService.proposeSafeTransaction({
            urlParams,
            body,
        });

        expect(requestSpy).toHaveBeenCalledWith(
            safeTransactionService['basePaths'].proposeSafeTransaction,
            {
                urlParams: { chainId: '1', address: safeAddress },
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

    it('confirms a transaction by its hash', async () => {
        requestSpy.mockResolvedValue(undefined);
        const safeTxHash = `0x${'2'.repeat(64)}`;

        await safeTransactionService.confirmSafeTransaction({
            urlParams: { network: Network.ETHEREUM_MAINNET, safeTxHash },
            body: { signature: '0xsignature' },
        });

        expect(requestSpy).toHaveBeenCalledWith(
            safeTransactionService['basePaths'].confirmSafeTransaction,
            {
                urlParams: { chainId: '1', safeTxHash },
                body: { signature: '0xsignature' },
            },
            { method: 'POST' },
        );
    });

    it('rejects a balances response that does not match the contract', async () => {
        requestSpy.mockResolvedValue([{ tokenAddress: 1 }]);

        await expect(
            safeTransactionService.getSafeBalances({ urlParams }),
        ).rejects.toMatchObject({ code: 'invalid-response', status: 502 });
    });
});
