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
        const queryParams = { limit: 10 };

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

    it('builds one safe DAO proposals key regardless of address casing', () => {
        const daoAddress = '0x665928FeacC8739116A3f2eF66a9c61936348DC2';

        expect(
            safeServiceKeys.safeDaoProposals({
                network: Network.ETHEREUM_MAINNET,
                safeAddress: lowercased,
                daoAddress: daoAddress.toLowerCase(),
            }),
        ).toEqual(
            safeServiceKeys.safeDaoProposals({
                network: Network.ETHEREUM_MAINNET,
                safeAddress: checksummed,
                daoAddress,
            }),
        );
    });

    it('keeps DAO proposal feeds separate for different DAOs on one Safe', () => {
        const daoAddress = '0x665928FeacC8739116A3f2eF66a9c61936348DC2';
        const otherDaoAddress = '0x1111111111111111111111111111111111111111';

        expect(
            safeServiceKeys.safeDaoProposals({
                network: Network.ETHEREUM_MAINNET,
                safeAddress: checksummed,
                daoAddress,
            }),
        ).not.toEqual(
            safeServiceKeys.safeDaoProposals({
                network: Network.ETHEREUM_MAINNET,
                safeAddress: checksummed,
                daoAddress: otherDaoAddress,
            }),
        );
    });

    it('canonicalizes Safe transaction action hashes', () => {
        const safeTxHash = `0x${'AB'.repeat(32)}`;

        expect(
            safeServiceKeys.safeTransactionActions({
                urlParams: {
                    network: Network.ETHEREUM_MAINNET,
                    address: lowercased,
                    safeTxHash,
                },
            }),
        ).toEqual(
            safeServiceKeys.safeTransactionActions({
                urlParams: {
                    network: Network.ETHEREUM_MAINNET,
                    address: checksummed,
                    safeTxHash: safeTxHash.toLowerCase(),
                },
            }),
        );
    });

    it('keeps list and detail DAO proposal feeds separate', () => {
        const daoAddress = '0x665928FeacC8739116A3f2eF66a9c61936348DC2';
        const safeTxHash = `0x${'ab'.repeat(32)}`;

        expect(
            safeServiceKeys.safeDaoProposals({
                network: Network.ETHEREUM_MAINNET,
                safeAddress: checksummed,
                daoAddress,
            }),
        ).not.toEqual(
            safeServiceKeys.safeDaoProposal({
                network: Network.ETHEREUM_MAINNET,
                safeAddress: checksummed,
                daoAddress,
                safeTxHash,
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
