'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { DaoDataListItem, DataListContainer, DataListPagination, DataListRoot } from '@aragon/ods';
import { useDaoList, type IGetDaoListParams } from '../../api/daoExplorerService';

export interface IDaoListProps {
    /**
     * Initial parameters to use for fetching the list of DAOs.
     */
    initialParams: IGetDaoListParams;
}

export const DaoList: React.FC<IDaoListProps> = (props) => {
    const { initialParams } = props;

    const { t } = useTranslations();
    const { data: daoListData, fetchNextPage, status, fetchStatus, isFetchingNextPage } = useDaoList(initialParams);

    const daoList = daoListData?.pages.flatMap((page) => page.data);
    const state = dataListUtils.queryToDataListState({ status, fetchStatus, isFetchingNextPage });

    const pageSize = initialParams.queryParams.pageSize ?? daoListData?.pages[0].metadata.pageSize;
    const itemsCount = daoListData?.pages[0].metadata.totalRecords;

    return (
        <DataListRoot
            entityLabel={t('app.explore.daoList.entity')}
            onLoadMore={fetchNextPage}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <DataListContainer className="grid grid-cols-1 lg:grid-cols-2" SkeletonElement={DaoDataListItem.Skeleton}>
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
                        plugin={dao.plugins.map((plugin) => plugin.subdomain).join(',')}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
