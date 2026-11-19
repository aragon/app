import { addressUtils } from '@aragon/gov-ui-kit';
import { getAddress } from 'viem';
import { safeTxServiceShortNames } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import { daoExplorerService } from '@/modules/explore/api/daoExplorerService';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IDao, Network } from '@/shared/api/daoService';
import { safeTransactionService } from '@/shared/api/safeService';
import { networkUtils } from '@/shared/utils/networkUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../workspaceService';
import {
    type IWorkspaceAccountSuggestion,
    WorkspaceAccountSuggestionRole,
} from './domain';
import type { IGetWorkspaceAccountSuggestionsParams } from './workspaceQueryService.api';

// Largest page `daos/member` serves; the stand-in reads every page.
const daoPageSize = 50;

/**
 * Stands in for the suggestions endpoint: every page of `daos/member` and the Safes the wallet signs for on each
 * Safe network, ranked and returned as one page.
 */
export const getWorkspaceAccountSuggestions = async (
    params: IGetWorkspaceAccountSuggestionsParams,
): Promise<IPaginatedResponse<IWorkspaceAccountSuggestion>> => {
    const { address } = params.urlParams;

    const [daos, safes] = await Promise.all([
        getMemberDaos(address),
        getSignerSafes(address),
    ]);

    const daoSuggestions = daos.map((dao) => ({
        account: buildAccount(WorkspaceAccountType.DAO, dao),
        dao,
        role:
            dao.creator != null &&
            addressUtils.isAddressEqual(dao.creator.address, address)
                ? WorkspaceAccountSuggestionRole.CREATOR
                : WorkspaceAccountSuggestionRole.MEMBER,
    }));
    // Every signer is an owner to the Safe API, so the wallet's own Safes cannot be told apart yet.
    const safeSuggestions = safes.map((safe) => ({
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
    };
};

// Page 1 gives the page count, so the others are read in parallel.
const getMemberDaos = async (address: string): Promise<IDao[]> => {
    const getPage = (page: number) =>
        daoExplorerService.getDaoListByMemberAddress({
            urlParams: { address },
            queryParams: { page, pageSize: daoPageSize },
        });

    const firstPage = await getPage(1);
    const otherPages = await Promise.all(
        Array.from(
            { length: Math.max(firstPage.metadata.totalPages - 1, 0) },
            (_, index) => getPage(index + 2),
        ),
    );

    return [firstPage, ...otherPages].flatMap((page) => page.data);
};

// A network that fails, e.g. on the shared quota, is left out rather than failing the suggestions.
const getSignerSafes = async (
    address: string,
): Promise<{ network: Network; address: string }[]> => {
    // Only the networks both the app and the Safe transaction service support.
    const safeNetworks = networkUtils
        .getSupportedNetworks()
        .filter((network) => safeTxServiceShortNames[network] != null);

    const results = await Promise.allSettled(
        safeNetworks.map((network) =>
            safeTransactionService.getSafesByOwner({
                urlParams: { network, address },
            }),
        ),
    );

    return results.flatMap((result, index) =>
        result.status === 'fulfilled'
            ? result.value.map((safe) => ({
                  network: safeNetworks[index],
                  address: safe,
              }))
            : [],
    );
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
