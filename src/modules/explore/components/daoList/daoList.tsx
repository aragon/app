'use client';

import {
    addressUtils,
    DaoDataListItem,
    DataListContainer,
    DataListFilter,
    DataListPagination,
    DataListRoot,
    invariant,
    useDebouncedValue,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import {
    type IGetDaoListByMemberAddressParams,
    type IGetDaoListParams,
    useDaoList,
    useDaoListByMemberAddress,
} from '../../api/daoExplorerService';

export interface IDaoListProps {
    /**
     * Initial parameters to use for fetching the list of DAOs.
     */
    initialParams?: IGetDaoListParams;
    /**
     * Parameters to use for fetching the list of DAOs for a given address. Overrides the initialParams when set.
     */
    memberParams?: IGetDaoListByMemberAddressParams;
    /**
     * Overrides the custom layout classes when set.
     */
    layoutClassNames?: string;
    /**
     * Show DAO search input.
     */
    showSearch?: boolean;
}

export const DaoList: React.FC<IDaoListProps> = (props) => {
    const { initialParams, memberParams, layoutClassNames, showSearch } = props;
    const { t } = useTranslations();

    invariant(
        initialParams != null || memberParams != null,
        'DaoList: either initialParams or memberParams must be provided',
    );

    const [searchValue, setSearchValue] = useState<string>();
    const [searchValueDebounced] = useDebouncedValue(searchValue, {
        delay: 500,
    });

    const defaultResult = useDaoList(
        {
            ...initialParams,
            queryParams: {
                ...initialParams?.queryParams,
                networks: networkUtils.getMainnetNetworks(),
                search: searchValueDebounced,
            },
        },
        { enabled: initialParams != null && memberParams == null },
    );

    const memberResult = useDaoListByMemberAddress(
        {
            ...memberParams!,
            queryParams: {
                ...memberParams?.queryParams,
                search: searchValueDebounced,
            },
        },
        { enabled: memberParams != null },
    );

    const { data, fetchNextPage, status, fetchStatus, isFetchingNextPage } =
        memberParams != null ? memberResult : defaultResult;

    const daoList = data?.pages.flatMap((page) => page.data);

    const state = dataListUtils.queryToDataListState({
        status,
        fetchStatus,
        isFetchingNextPage,
    });

    const pageSize =
        initialParams?.queryParams.pageSize ??
        memberParams?.queryParams.pageSize ??
        data?.pages[0]?.metadata?.pageSize;

    const itemsCount = data?.pages[0]?.metadata?.totalRecords;

    const emptyState = {
        heading: t('app.explore.daoList.emptyState.heading'),
        description: t('app.explore.daoList.emptyState.description'),
    };

    const errorState = {
        heading: t('app.explore.daoList.errorState.heading'),
        description: t('app.explore.daoList.errorState.description'),
    };

    return (
        <DataListRoot
            entityLabel={t('app.explore.daoList.entity')}
            itemsCount={itemsCount}
            onLoadMore={fetchNextPage}
            pageSize={pageSize}
            state={state}
        >
            {showSearch && (
                <DataListFilter
                    onSearchValueChange={setSearchValue}
                    placeholder={t('app.explore.daoList.searchPlaceholder')}
                    searchValue={searchValue}
                />
            )}
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                layoutClassName={
                    layoutClassNames ?? 'grid grid-cols-1 lg:grid-cols-2'
                }
                SkeletonElement={DaoDataListItem.Skeleton}
            >
                {daoList?.map((dao) => (
                    <DaoDataListItem.Structure
                        address={dao.address}
                        description={dao.description}
                        ens={daoUtils.getDaoEns(dao)}
                        href={daoUtils.getDaoUrl(dao, 'dashboard')}
                        key={dao.id}
                        logoSrc={ipfsUtils.cidToSrc(dao.avatar)}
                        name={
                            dao.name ||
                            addressUtils.truncateAddress(dao.address)
                        }
                        network={networkDefinitions[dao.network].name}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
