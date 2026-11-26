import { addressUtils } from '@aragon/gov-ui-kit';
import { getAddress } from 'viem';
import { safeTxServiceShortNames } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import { daoExplorerService } from '@/modules/explore/api/daoExplorerService';
import type { IDao, Network } from '@/shared/api/daoService';
import { safeTransactionService } from '@/shared/api/safeService';
import { networkUtils } from '@/shared/utils/networkUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../workspaceService';
import {
    type IWorkspaceAccountSuggestion,
    type IWorkspaceAccountSuggestionListResponse,
    WorkspaceAccountSuggestionRole,
} from './domain';
import type { IGetWorkspaceAccountSuggestionsParams } from './workspaceQueryService.api';

// Largest page `daos/member` serves; the stand-in reads every page.
const daoPageSize = 50;

// Reading every Safe network at once gets 429s on the shared Safe API key.
const safeNetworkConcurrency = 3;

interface ISuggestionSource<TItem> {
    /**
     * Items read from the source.
     */
    items: TItem[];
    /**
     * Whether part of the source could not be read, so items may be missing.
     */
    isIncomplete: boolean;
    /**
     * Whether none of the source could be read.
     */
    isFailed: boolean;
    /**
     * Error of a failed source.
     */
    error?: unknown;
}

/**
 * Stands in for the suggestions endpoint: every page of `daos/member` and the Safes the wallet signs for on each
 * Safe network, ranked and returned as one page. What fails to load is left out and the list flagged incomplete; it
 * rejects only when nothing could be read.
 */
export const getWorkspaceAccountSuggestions = async (
    params: IGetWorkspaceAccountSuggestionsParams,
): Promise<IWorkspaceAccountSuggestionListResponse> => {
    const { address } = params.urlParams;

    const [daoSource, safeSource] = await Promise.all([
        getMemberDaos(address),
        getSignerSafes(address),
    ]);

    // An empty list would read as a wallet without accounts, so a total failure stays an error.
    if (daoSource.isFailed && safeSource.isFailed) {
        throw daoSource.error;
    }

    const daoSuggestions = daoSource.items.map((dao) => ({
        account: buildAccount(WorkspaceAccountType.DAO, dao),
        dao,
        role:
            dao.creator != null &&
            addressUtils.isAddressEqual(dao.creator.address, address)
                ? WorkspaceAccountSuggestionRole.CREATOR
                : WorkspaceAccountSuggestionRole.MEMBER,
    }));
    // Every signer is an owner to the Safe API, so the wallet's own Safes cannot be told apart yet.
    const safeSuggestions = safeSource.items.map((safe) => ({
        account: buildAccount(WorkspaceAccountType.SAFE, safe),
        role: WorkspaceAccountSuggestionRole.MEMBER,
    }));

    // The DAOs the wallet deployed first, as the endpoint will rank them.
    const data = [...daoSuggestions, ...safeSuggestions].sort(
        (a, b) => Number(isCreator(b)) - Number(isCreator(a)),
    );

    return {
        data,
        metadata: {
            page: 1,
            pageSize: data.length,
            totalPages: 1,
            totalRecords: data.length,
        },
        isIncomplete: daoSource.isIncomplete || safeSource.isIncomplete,
    };
};

// Page 1 gives the page count, so the others are read in parallel. A failed page is left out and the list flagged
// incomplete; without page 1 nothing is read.
const getMemberDaos = async (
    address: string,
): Promise<ISuggestionSource<IDao>> => {
    const getPage = (page: number) =>
        daoExplorerService.getDaoListByMemberAddress({
            urlParams: { address },
            queryParams: { page, pageSize: daoPageSize },
        });

    let firstPage: Awaited<ReturnType<typeof getPage>>;

    try {
        firstPage = await getPage(1);
    } catch (error: unknown) {
        return { items: [], isIncomplete: true, isFailed: true, error };
    }

    const otherResults = await Promise.allSettled(
        Array.from(
            { length: Math.max(firstPage.metadata.totalPages - 1, 0) },
            (_, index) => getPage(index + 2),
        ),
    );
    const otherPages = otherResults.flatMap((result) =>
        result.status === 'fulfilled' ? [result.value] : [],
    );

    return {
        items: [firstPage, ...otherPages].flatMap((page) => page.data),
        isIncomplete: otherPages.length < otherResults.length,
        isFailed: false,
    };
};

// A failed network is left out and the list flagged incomplete.
const getSignerSafes = async (
    address: string,
): Promise<ISuggestionSource<{ network: Network; address: string }>> => {
    // Only the networks both the app and the Safe transaction service support.
    const safeNetworks = networkUtils
        .getSupportedNetworks()
        .filter((network) => safeTxServiceShortNames[network] != null);

    const results: PromiseSettledResult<string[]>[] = [];

    for (
        let index = 0;
        index < safeNetworks.length;
        index += safeNetworkConcurrency
    ) {
        const batch = safeNetworks.slice(index, index + safeNetworkConcurrency);
        const batchResults = await Promise.allSettled(
            batch.map((network) =>
                safeTransactionService.getSafesByOwner({
                    urlParams: { network, address },
                }),
            ),
        );
        results.push(...batchResults);
    }

    const safes = results.flatMap((result, index) =>
        result.status === 'fulfilled'
            ? result.value.map((safe) => ({
                  network: safeNetworks[index],
                  address: safe,
              }))
            : [],
    );
    const failedCount = results.filter(
        ({ status }) => status === 'rejected',
    ).length;

    return {
        items: safes,
        isIncomplete: failedCount > 0,
        isFailed: failedCount > 0 && failedCount === results.length,
    };
};

const isCreator = ({ role }: IWorkspaceAccountSuggestion) =>
    role === WorkspaceAccountSuggestionRole.CREATOR;

// Built inline, not with `workspaceUtils.buildAccountId`, which imports this service.
const buildAccount = (
    type: WorkspaceAccountType,
    { network, address }: { network: Network; address: string },
): IWorkspaceAccount => ({
    id: `${network}-${getAddress(address)}`,
    type,
    address,
    network,
});
