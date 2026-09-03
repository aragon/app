import { Network } from '@/shared/api/daoService';
import {
    generateSafeInfo,
    generateSafeMeta,
    generateSafeTransaction,
} from '@/shared/testUtils';
import { safeService } from './safeService';

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

    const meta = generateSafeMeta();

    it('getSafeInfo reads the safe from the backend, not the transaction service', async () => {
        const safeInfo = { ...generateSafeInfo(), meta };
        requestSpy.mockResolvedValue(safeInfo);

        const result = await safeService.getSafeInfo({ urlParams });

        expect(requestSpy).toHaveBeenCalledWith(safeService['urls'].safeInfo, {
            urlParams: {
                network: Network.ETHEREUM_MAINNET,
                address: safeAddress,
            },
        });
        expect(result).toEqual(safeInfo);
    });

    it.each([
        { label: 'lowercased', address: safeAddress.toLowerCase() },
        {
            label: 'uppercased',
            address: `0x${safeAddress.slice(2).toUpperCase()}`,
        },
    ])(
        'checksums a $label address before it reaches the wire',
        async ({ address }) => {
            requestSpy.mockResolvedValue({ ...generateSafeInfo(), meta });

            await safeService.getSafeInfo({
                urlParams: { network: Network.ETHEREUM_MAINNET, address },
            });

            expect(requestSpy).toHaveBeenCalledWith(
                safeService['urls'].safeInfo,
                {
                    urlParams: {
                        network: Network.ETHEREUM_MAINNET,
                        address: safeAddress,
                    },
                },
            );
        },
    );

    it('getSafePendingTransactions does not filter by nonce', async () => {
        // Liveness is derived client-side. A server-side nonce filter would put the current nonce in
        // the cache key on both sides, so every nonce advance would orphan an entry.
        const queue = {
            count: 1,
            next: null,
            previous: null,
            results: [generateSafeTransaction({ nonce: '12' })],
            meta,
        };
        requestSpy.mockResolvedValue(queue);

        const result = await safeService.getSafePendingTransactions({
            urlParams,
            queryParams: { limit: 10 },
        });

        expect(requestSpy).toHaveBeenCalledWith(safeService['urls'].safeQueue, {
            urlParams: {
                network: Network.ETHEREUM_MAINNET,
                address: safeAddress,
            },
            queryParams: { limit: 10 },
        });
        expect(result).toEqual(queue);
    });

    it('getSafeNextNonce takes no caller-supplied nonce and reads one endpoint', async () => {
        // A `currentNonce` parameter would eventually be handed a polled value; the backend reads
        // both the live onchain nonce and the queue itself, uncached.
        const nextNonce = { nextNonce: '7', currentNonce: '6', meta };
        requestSpy.mockResolvedValue(nextNonce);

        const result = await safeService.getSafeNextNonce({ urlParams });

        expect(requestSpy).toHaveBeenCalledTimes(1);
        expect(requestSpy).toHaveBeenCalledWith(
            safeService['urls'].safeNextNonce,
            {
                urlParams: {
                    network: Network.ETHEREUM_MAINNET,
                    address: safeAddress,
                },
            },
        );
        expect(result).toEqual(nextNonce);
    });

    it.each([
        {
            label: 'safe info',
            read: async () => safeService.getSafeInfo({ urlParams }),
        },
        {
            label: 'next nonce',
            read: async () => safeService.getSafeNextNonce({ urlParams }),
        },
    ])(
        'rejects a $label response with no freshness metadata',
        async ({ read }) => {
            // Without `meta` a consumer cannot tell a current payload from one served stale, so the
            // response does not satisfy the contract.
            requestSpy.mockResolvedValue({
                ...generateSafeInfo(),
                nextNonce: '7',
                currentNonce: '6',
            });

            await expect(read()).rejects.toMatchObject({
                code: 'invalid-response',
                status: 502,
            });
        },
    );

    it('rejects a response that does not match the Safe contract', async () => {
        requestSpy.mockResolvedValue({ address: safeAddress, meta });

        await expect(
            safeService.getSafeInfo({ urlParams }),
        ).rejects.toMatchObject({
            code: 'invalid-response',
            status: 502,
        });
    });
});
