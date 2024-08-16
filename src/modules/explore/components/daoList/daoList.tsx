'use client';

import { IGetDaoListByMemberAddressParams } from '@/shared/api/daoService';
import { useDaoListByMemberAddress } from '@/shared/api/daoService/queries/useDaoListByMemberAddress';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { DaoDataListItem, DataListContainer, DataListPagination, DataListRoot } from '@aragon/ods';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useDaoList, type IGetDaoListParams } from '../../api/daoExplorerService';

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
     * DAO id to filter against current view.
     */
    daoId?: string;
}

export const DaoList: React.FC<IDaoListProps> = (props) => {
    const { initialParams, daoListByMemberParams, daoId } = props;
    const { t } = useTranslations();

    const {
        data: daoListData,
        fetchNextPage: fetchNextPageExplore,
        status: statusExplore,
        fetchStatus: fetchStatusExplore,
        isFetchingNextPage: isFetchingNextPageExplore,
    } = useDaoList(initialParams ?? { queryParams: {} }, {
        enabled: !!initialParams,
    });

    const daoListExplore = daoListData?.pages.flatMap((page) => page.data) ?? [];

    const {
        data: daoListByMemberData,
        fetchNextPage: fetchNextPageListByMember,
        status: statusListByMember,
        fetchStatus: fetchStatusListByMember,
        isFetchingNextPage: isFetchingNextPageListByMember,
    } = useDaoListByMemberAddress(daoListByMemberParams ?? { urlParams: { address: '' }, queryParams: {} }, {
        enabled: !!daoListByMemberParams && !initialParams,
    });

    const daoListByMember = daoListByMemberData?.pages.flatMap((page) => page.data) ?? [];

    // Filter out the DAO by the provided `daoId`
    const otherDaosOfMember = useMemo(() => {
        return daoListByMember.filter((memberDao) => memberDao.id !== daoId);
    }, [daoListByMember, daoId]);

    // Determine which DAO list to display
    const processedDaoList = initialParams ? daoListExplore : otherDaosOfMember;
    const fetchNextPage = initialParams ? fetchNextPageExplore : fetchNextPageListByMember;

    // Handle loading state and pagination data
    const state = dataListUtils.queryToDataListState({
        status: initialParams ? statusExplore : statusListByMember,
        fetchStatus: initialParams ? fetchStatusExplore : fetchStatusListByMember,
        isFetchingNextPage: initialParams ? isFetchingNextPageExplore : isFetchingNextPageListByMember,
    });

    const pageSize =
        initialParams?.queryParams.pageSize ??
        daoListData?.pages[0]?.metadata.pageSize ??
        daoListByMemberParams?.queryParams.pageSize ??
        daoListByMemberData?.pages[0]?.metadata.pageSize;
    const itemsCount =
        daoListData?.pages[0]?.metadata.totalRecords ?? daoListByMemberData?.pages[0]?.metadata.totalRecords;

    const daoListClassNames = classNames({ 'grid grid-cols-1 lg:grid-cols-2': initialParams != null });

    return (
        <DataListRoot
            entityLabel={t('app.explore.daoList.entity')}
            onLoadMore={fetchNextPage}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <DataListContainer className={daoListClassNames} SkeletonElement={DaoDataListItem.Skeleton}>
                {processedDaoList.map((dao) => (
                    <DaoDataListItem.Structure
                        key={dao.id}
                        href={`/dao/${dao.id}/dashboard`}
                        ens={daoUtils.getDaoEns(dao)}
                        address={dao.address}
                        name={dao.name}
                        description={dao.description}
                        network={networkDefinitions[dao.network]?.name}
                        logoSrc={ipfsUtils.cidToSrc(dao.avatar)}
                        plugin={dao.plugins.map((plugin) => plugin.subdomain).join(',')}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
