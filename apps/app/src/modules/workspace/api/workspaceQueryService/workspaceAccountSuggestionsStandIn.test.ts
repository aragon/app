import { daoExplorerService } from '@/modules/explore/api/daoExplorerService';
import { Network } from '@/shared/api/daoService';
import { safeTransactionService } from '@/shared/api/safeService';
import { generateDao, generatePaginatedResponse } from '@/shared/testUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import { WorkspaceAccountType } from '../workspaceService';
import { WorkspaceAccountSuggestionRole } from './domain';
import { getWorkspaceAccountSuggestions } from './workspaceAccountSuggestionsStandIn';

describe('getWorkspaceAccountSuggestions stand-in', () => {
    const wallet = '0x5dcD623bf6E792bfBDbf8d643f6478153df4A8D2';
    const safeAddress = '0x1F01e6fe406295c9fe42189A2ef999636a04132a';
    const params = {
        urlParams: { address: wallet },
        queryParams: { pageSize: 50 },
    };

    const getDaoListByMemberSpy = jest.spyOn(
        daoExplorerService,
        'getDaoListByMemberAddress',
    );
    const getSafesByOwnerSpy = jest.spyOn(
        safeTransactionService,
        'getSafesByOwner',
    );

    const createdDao = generateDao({
        id: 'ethereum-sepolia-0x23A16064466201bfB2b096B68c5103B70Da78394',
        address: '0x23A16064466201bfB2b096B68c5103B70Da78394',
        network: Network.ETHEREUM_SEPOLIA,
        name: 'Created DAO',
        creator: { address: wallet, ens: null, avatar: null },
    });
    const memberDao = generateDao({
        id: 'ethereum-mainnet-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
        address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
        network: Network.ETHEREUM_MAINNET,
        name: 'Member DAO',
        creator: {
            address: '0x069f5b3F048726CC62D518F8B7D1F8a64B29EFA4',
            ens: null,
            avatar: null,
        },
    });

    beforeEach(() => {
        getDaoListByMemberSpy.mockResolvedValue(
            generatePaginatedResponse({ data: [memberDao, createdDao] }),
        );
        getSafesByOwnerSpy.mockImplementation(({ urlParams }) =>
            Promise.resolve(
                urlParams.network === Network.ETHEREUM_SEPOLIA
                    ? [safeAddress]
                    : [],
            ),
        );
    });

    afterEach(() => {
        getDaoListByMemberSpy.mockReset();
        getSafesByOwnerSpy.mockReset();
    });

    it('reads every page of the DAOs the wallet is a member of', async () => {
        getDaoListByMemberSpy
            .mockResolvedValueOnce(
                generatePaginatedResponse({
                    data: [memberDao],
                    metadata: {
                        page: 1,
                        pageSize: 50,
                        totalPages: 2,
                        totalRecords: 2,
                    },
                }),
            )
            .mockResolvedValueOnce(
                generatePaginatedResponse({
                    data: [createdDao],
                    metadata: {
                        page: 2,
                        pageSize: 50,
                        totalPages: 2,
                        totalRecords: 2,
                    },
                }),
            );

        const { data } = await getWorkspaceAccountSuggestions(params);

        expect(getDaoListByMemberSpy).toHaveBeenCalledTimes(2);
        expect(getDaoListByMemberSpy).toHaveBeenLastCalledWith({
            urlParams: { address: wallet },
            queryParams: { page: 2, pageSize: 50 },
        });
        expect(data.map(({ dao }) => dao?.name)).toEqual(
            expect.arrayContaining(['Member DAO', 'Created DAO']),
        );
    });

    it('suggests the Safes the wallet signs for on every Safe network, as a member', async () => {
        const { data } = await getWorkspaceAccountSuggestions(params);

        expect(data).toContainEqual({
            account: {
                id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
                type: WorkspaceAccountType.SAFE,
                address: safeAddress,
                network: Network.ETHEREUM_SEPOLIA,
            },
            role: WorkspaceAccountSuggestionRole.MEMBER,
        });
        expect(getSafesByOwnerSpy).toHaveBeenCalledWith({
            urlParams: { network: Network.ETHEREUM_MAINNET, address: wallet },
        });
    });

    it('queries Safes only on the networks the app supports', async () => {
        jest.spyOn(networkUtils, 'getSupportedNetworks').mockReturnValueOnce([
            Network.ETHEREUM_SEPOLIA,
            Network.CITREA_MAINNET,
        ]);

        await getWorkspaceAccountSuggestions(params);

        expect(getSafesByOwnerSpy).toHaveBeenCalledTimes(1);
        expect(getSafesByOwnerSpy).toHaveBeenCalledWith({
            urlParams: { network: Network.ETHEREUM_SEPOLIA, address: wallet },
        });
    });

    it('leaves out the Safes of a network that fails and flags the list as incomplete', async () => {
        getSafesByOwnerSpy.mockRejectedValue(new Error('quota'));

        const { data, isIncomplete } =
            await getWorkspaceAccountSuggestions(params);

        expect(
            data.some(
                ({ account }) => account.type === WorkspaceAccountType.SAFE,
            ),
        ).toBe(false);
        expect(isIncomplete).toBe(true);
    });

    it('leaves out a DAO page that fails and flags the list as incomplete', async () => {
        getDaoListByMemberSpy
            .mockResolvedValueOnce(
                generatePaginatedResponse({
                    data: [memberDao],
                    metadata: {
                        page: 1,
                        pageSize: 50,
                        totalPages: 3,
                        totalRecords: 3,
                    },
                }),
            )
            .mockRejectedValueOnce(new Error('timeout'))
            .mockResolvedValueOnce(
                generatePaginatedResponse({ data: [createdDao] }),
            );

        const { data, isIncomplete } =
            await getWorkspaceAccountSuggestions(params);

        expect(data.map(({ account }) => account.address)).toEqual(
            expect.arrayContaining([
                memberDao.address,
                createdDao.address,
                safeAddress,
            ]),
        );
        expect(isIncomplete).toBe(true);
    });

    it('keeps the Safes when the first DAO page fails and flags the list as incomplete', async () => {
        getDaoListByMemberSpy.mockRejectedValue(new Error('timeout'));

        const { data, isIncomplete } =
            await getWorkspaceAccountSuggestions(params);

        expect(data.map(({ account }) => account.type)).toEqual([
            WorkspaceAccountType.SAFE,
        ]);
        expect(isIncomplete).toBe(true);
    });

    it('rejects with the DAO error when nothing can be read', async () => {
        const error = new Error('offline');
        getDaoListByMemberSpy.mockRejectedValue(error);
        getSafesByOwnerSpy.mockRejectedValue(new Error('quota'));

        await expect(getWorkspaceAccountSuggestions(params)).rejects.toBe(
            error,
        );
    });

    it('does not flag a list read in full as incomplete', async () => {
        const { isIncomplete } = await getWorkspaceAccountSuggestions(params);

        expect(isIncomplete).toBe(false);
    });

    it('reads at most three Safe networks at a time', async () => {
        let inFlight = 0;
        let maxInFlight = 0;
        getSafesByOwnerSpy.mockImplementation(async () => {
            inFlight++;
            maxInFlight = Math.max(maxInFlight, inFlight);
            await Promise.resolve();
            inFlight--;
            return [];
        });

        await getWorkspaceAccountSuggestions(params);

        expect(getSafesByOwnerSpy.mock.calls.length).toBeGreaterThan(3);
        expect(maxInFlight).toBe(3);
    });

    it('ranks the DAOs the wallet deployed first, as a single page', async () => {
        const { data, metadata } = await getWorkspaceAccountSuggestions(params);

        expect(data.map(({ role }) => role)).toEqual([
            WorkspaceAccountSuggestionRole.CREATOR,
            WorkspaceAccountSuggestionRole.MEMBER,
            WorkspaceAccountSuggestionRole.MEMBER,
        ]);
        expect(metadata).toEqual({
            page: 1,
            pageSize: 3,
            totalPages: 1,
            totalRecords: 3,
        });
    });
});
