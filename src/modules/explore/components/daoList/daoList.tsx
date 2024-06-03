'use client';

import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { DaoDataListItemStructure, DataListContainer, DataListPagination, DataListRoot } from '@aragon/ods';
import { useDaoList, type IGetDaoListParams } from '../../api/daoExplorerService';

export interface IDaoListProps {
    /**
     * Default parameters to fetch the list of DAOs.
     */
    defaultParams: IGetDaoListParams;
}

export const DaoList: React.FC<IDaoListProps> = (props) => {
    const { defaultParams } = props;

    const { data: daoListData, isLoading, fetchNextPage } = useDaoList(defaultParams);

    const daoList = daoListData?.pages.flatMap((page) => page.data);

    return (
        <DataListRoot
            entityLabel="DAO"
            onLoadMore={fetchNextPage}
            state={isLoading ? 'fetchingNextPage' : 'idle'}
            pageSize={daoListData?.pages[0].limit}
            itemsCount={daoListData?.pages[0].totRecords}
        >
            <DataListContainer className="grid grid-cols-2">
                {daoList?.map((dao) => (
                    <DaoDataListItemStructure
                        key={dao.permalink}
                        href={`/dao/${dao.permalink}/dashboard`}
                        ens={dao.ens ?? undefined}
                        address={dao.daoAddress}
                        name={dao.name}
                        description={dao.description}
                        logoSrc={ipfsUtils.cidToSrc(dao.avatar)}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
