'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    DaoDataListItem,
    DataListContainer,
    DataListFilter,
    DataListPagination,
    DataListRoot,
    invariant,
    useDebouncedValue,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import {
    useDaoList,
    useDaoListByMemberAddress,
    type IGetDaoListByMemberAddressParams,
    type IGetDaoListParams,
} from '../../api/daoExplorerService';

export interface IDaoListProps {
    /**
     * Initial parameters to use for fetching the list of DAOs.
     */
    initialParams?: IGetDaoListParams;
    /**
     * Member parameters to use for fetching the list of DAOs for a given address.
     */
    daoListByMemberParams?: IGetDaoListByMemberAddressParams;
    /**
     * Overrides the custom layout classes when set.
     */
    layoutClassNames?: string;
}

export const DaoList: React.FC<IDaoListProps> = (props) => {
    const { initialParams, daoListByMemberParams, layoutClassNames } = props;
    const { t } = useTranslations();

    invariant(
        !((!initialParams && !daoListByMemberParams) || (initialParams && daoListByMemberParams)),
        'Either `initialParams` or `daoListByMemberParams` must be provided. You can not provide both.',
    );

    const [searchValue, setSearchValue] = useState<string>();
    const [searchValueDebounced] = useDebouncedValue(searchValue, { delay: 500 });

    const enableDaoList = initialParams != null && !daoListByMemberParams;
    const daoListResult = useDaoList(
        {
            // Add search value to the query params
            ...initialParams,
            queryParams: { ...initialParams?.queryParams, search: searchValueDebounced },
        },
        { enabled: enableDaoList },
    );

    const enableDaoListByMember = daoListByMemberParams != null && !initialParams;
    const daoListByMember = useDaoListByMemberAddress(
        {
            // Add search value to the query params
            ...daoListByMemberParams!,
            queryParams: { ...daoListByMemberParams?.queryParams, search: searchValueDebounced },
        },
        { enabled: enableDaoListByMember },
    );

    const { data, fetchNextPage, status, fetchStatus, isFetchingNextPage } = initialParams
        ? daoListResult
        : daoListByMember;

    const daoList = data?.pages.flatMap((page) => page.data);

    const state = dataListUtils.queryToDataListState({ status, fetchStatus, isFetchingNextPage });

    const pageSize =
        initialParams?.queryParams.pageSize ??
        daoListByMemberParams?.queryParams.pageSize ??
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

    const processedLayoutClassNames = layoutClassNames ?? 'grid grid-cols-1 lg:grid-cols-2';
    const emptyListLayoutClassNames = 'grid grid-cols-1';

    return (
        <DataListRoot
            entityLabel={t('app.explore.daoList.entity')}
            onLoadMore={fetchNextPage}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
            className="!gap-2 md:!gap-6" // TODO: should this be applied to ui-kit?
        >
            <DataListFilter
                onSearchValueChange={setSearchValue}
                searchValue={searchValue}
                placeholder={t('app.explore.daoList.searchPlaceholder')}
            />
            <DataListContainer
                errorState={errorState}
                emptyState={emptyState}
                className={!daoList || daoList.length == 0 ? emptyListLayoutClassNames : processedLayoutClassNames}
                SkeletonElement={DaoDataListItem.Skeleton}
            >
                {daoList?.map((dao) => (
                    <DaoDataListItem.Structure
                        key={dao.id}
                        href={`/dao/${dao.id}/dashboard`}
                        ens={daoUtils.getDaoEns(dao)}
                        address={dao.address}
                        name={dao.name}
                        description={dao.description}
                        network={networkDefinitions[dao.network].name}
                        logoSrc={ipfsUtils.cidToSrc(dao.avatar)}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
