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

    const safeAddress = '0xd84C233A7D1578021d21E39785439bEdDB165F3D';

    const urlParams = {
        network: Network.ETHEREUM_MAINNET,
        address: safeAddress,
    };

    it('getSafeInfo fetches the specified safe through the chain-id proxy path', async () => {
        const safeInfo = generateSafeInfo();
        requestSpy.mockResolvedValue(safeInfo);

        const result = await safeService.getSafeInfo({ urlParams });

        expect(requestSpy).toHaveBeenCalledWith(
            safeService['basePaths'].safeInfo,
            { urlParams: { chainId: '1', address: safeAddress } },
        );
        expect(result).toEqual(safeInfo);
    });

    it.each([
        { label: 'lowercased', address: safeAddress.toLowerCase() },
        {
            label: 'uppercased',
            address: `0x${safeAddress.slice(2).toUpperCase()}`,
        },
    ])(
        'checksums a $label address before it reaches the transaction service',
        async ({ address }) => {
            // The service answers 422 for any address that is not EIP-55 checksummed, so a caller
            // passing a differently-cased address must not be able to produce a failing request.
            requestSpy.mockResolvedValue(generateSafeInfo());

            await safeService.getSafeInfo({
                urlParams: { network: Network.ETHEREUM_MAINNET, address },
            });

            expect(requestSpy).toHaveBeenCalledWith(
                safeService['basePaths'].safeInfo,
                { urlParams: { chainId: '1', address: safeAddress } },
            );
        },
    );

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
                urlParams: { chainId: '1', address: safeAddress },
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

    const mockNextNonceReads = (
        onchainNonce: string,
        queuedNonces: string[],
    ) => {
        const results = queuedNonces.map((nonce) => {
            const { from, ...upstream } = generateSafeTransaction({ nonce });

            return { ...upstream, proposer: from };
        });

        requestSpy.mockImplementation((url: string) =>
            url === safeService['basePaths'].safeInfo
                ? Promise.resolve(generateSafeInfo({ nonce: onchainNonce }))
                : Promise.resolve({
                      count: results.length,
                      next: null,
                      previous: null,
                      results,
                  }),
        );
    };

    it('getSafeNextNonce resolves the live onchain nonce when nothing is queued', async () => {
        mockNextNonceReads('12', []);

        const result = await safeService.getSafeNextNonce({ urlParams });

        expect(result).toEqual('12');
    });

    it('getSafeNextNonce reads both inputs fresh, bypassing the proxy cache', async () => {
        // The proxy data cache serves stale-while-revalidate. Allocating a nonce from a stale queue
        // recreates the colliding-nonce bug, and from a stale onchain nonce produces a transaction
        // that can never execute — so both reads must opt out of the cache.
        mockNextNonceReads('12', ['19']);

        await safeService.getSafeNextNonce({ urlParams });

        expect(requestSpy).toHaveBeenCalledWith(
            safeService['basePaths'].safeInfo,
            { urlParams: { chainId: '1', address: safeAddress } },
            { headers: { 'x-safe-fresh-read': '1' } },
        );
        expect(requestSpy).toHaveBeenCalledWith(
            safeService['basePaths'].safePendingTransactions,
            {
                urlParams: { chainId: '1', address: safeAddress },
                queryParams: { executed: false, ordering: '-nonce', limit: 1 },
            },
            { headers: { 'x-safe-fresh-read': '1' } },
        );
    });

    it('getSafeNextNonce moves past the highest queued nonce', async () => {
        mockNextNonceReads('12', ['19']);

        const result = await safeService.getSafeNextNonce({ urlParams });

        expect(result).toEqual('20');
    });

    it('getSafeNextNonce never moves backwards onto a consumed nonce', async () => {
        // `executed=false` also matches transactions below the current nonce. Those are permanently
        // dead and must never pull the next nonce backwards onto a nonce the Safe already spent.
        mockNextNonceReads('12', ['3']);

        const result = await safeService.getSafeNextNonce({ urlParams });

        expect(result).toEqual('12');
    });

    it('getSafeNextNonce keeps precision past the safe-integer range', async () => {
        mockNextNonceReads('0', ['9007199254740993']);

        const result = await safeService.getSafeNextNonce({ urlParams });

        expect(result).toEqual('9007199254740994');
    });

    it('getSafeBalances fetches the balances of the specified safe', async () => {
        const balances = [generateSafeBalance()];
        requestSpy.mockResolvedValue(balances);

        const result = await safeService.getSafeBalances({ urlParams });

        expect(requestSpy).toHaveBeenCalledWith(
            safeService['basePaths'].safeBalances,
            { urlParams: { chainId: '1', address: safeAddress } },
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
            urlParams: {
                ...urlParams,
                address: '0x665928FeacC8739116A3f2eF66a9c61936348DC2',
            },
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
