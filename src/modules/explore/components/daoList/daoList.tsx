'use client';

import { DaoDataListItemStructure, DataListContainer, DataListPagination, DataListRoot } from '@aragon/ods';
import { useDaoList } from '../../api/daoExplorerService';

export interface IDaoListProps {
    /**
     * Number of DAOs to be rendered per page.
     */
    limit: number;
}

export const DaoList: React.FC<IDaoListProps> = (props) => {
    const { limit } = props;

    const daoListQueryParams = { limit, skip: 0 };
    const { data: daoListData, isLoading, fetchNextPage } = useDaoList({ queryParams: daoListQueryParams });

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
                        logoSrc={dao.avatar ?? undefined}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
