'use client';

import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { DaoDataListItemStructure, DataListContainer, DataListPagination, DataListRoot } from '@aragon/ods';
import { useDaoList, type IGetDaoListParams } from '../../api/daoExplorerService';

export interface IDaoListProps {
    /**
     * Initial parameters to use for fetching the list of DAOs.
     */
    initialParams: IGetDaoListParams;
}

export const DaoList: React.FC<IDaoListProps> = (props) => {
    const { initialParams } = props;

    const { data: daoListData, isLoading, fetchNextPage } = useDaoList(initialParams);

    const daoList = daoListData?.pages.flatMap((page) => page.data);

    return (
        <DataListRoot
            entityLabel="DAO"
            onLoadMore={fetchNextPage}
            state={isLoading ? 'fetchingNextPage' : 'idle'}
            pageSize={daoListData?.pages[0].metadata.pageSize}
            itemsCount={daoListData?.pages[0].metadata.totalRecords}
        >
            <DataListContainer className="grid grid-cols-1 lg:grid-cols-2">
                {daoList?.map((dao) => (
                    <DaoDataListItemStructure
                        key={dao.id}
                        href={`/dao/${dao.id}/dashboard`}
                        ens={dao.ens ?? undefined}
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
