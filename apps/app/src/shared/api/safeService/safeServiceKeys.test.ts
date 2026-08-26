import { Network } from '@/shared/api/daoService';
import { safeServiceKeys } from './safeServiceKeys';

describe('safe service keys', () => {
    const checksummed = '0xd84C233A7D1578021d21E39785439bEdDB165F3D';
    const lowercased = checksummed.toLowerCase();

    // The address is the cache identity. Two callers naming the same Safe with different casing
    // must land on one entry, otherwise the app fetches the same Safe twice and spends twice the
    // Safe transaction service rate budget.
    it('builds one safeInfo key regardless of the casing the caller used', () => {
        expect(
            safeServiceKeys.safeInfo({
                urlParams: {
                    network: Network.ETHEREUM_MAINNET,
                    address: lowercased,
                },
            }),
        ).toEqual(
            safeServiceKeys.safeInfo({
                urlParams: {
                    network: Network.ETHEREUM_MAINNET,
                    address: checksummed,
                },
            }),
        );
    });

    it('builds one safeBalances key regardless of the casing the caller used', () => {
        expect(
            safeServiceKeys.safeBalances({
                urlParams: {
                    network: Network.ETHEREUM_MAINNET,
                    address: lowercased,
                },
            }),
        ).toEqual(
            safeServiceKeys.safeBalances({
                urlParams: {
                    network: Network.ETHEREUM_MAINNET,
                    address: checksummed,
                },
            }),
        );
    });

    it('builds one safePendingTransactions key regardless of the casing the caller used', () => {
        const queryParams = { currentNonce: '6' };

        expect(
            safeServiceKeys.safePendingTransactions({
                urlParams: {
                    network: Network.ETHEREUM_MAINNET,
                    address: lowercased,
                },
                queryParams,
            }),
        ).toEqual(
            safeServiceKeys.safePendingTransactions({
                urlParams: {
                    network: Network.ETHEREUM_MAINNET,
                    address: checksummed,
                },
                queryParams,
            }),
        );
    });

    it('keeps distinct Safes on distinct keys', () => {
        const other = '0x665928FeacC8739116A3f2eF66a9c61936348DC2';

        expect(
            safeServiceKeys.safeInfo({
                urlParams: {
                    network: Network.ETHEREUM_MAINNET,
                    address: checksummed,
                },
            }),
        ).not.toEqual(
            safeServiceKeys.safeInfo({
                urlParams: {
                    network: Network.ETHEREUM_MAINNET,
                    address: other,
                },
            }),
        );
    });
});
