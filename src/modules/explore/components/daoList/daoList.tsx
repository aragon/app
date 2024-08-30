'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { DaoDataListItem, DataListContainer, DataListPagination, DataListRoot, invariant } from '@aragon/ods';
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

    const enableDaoList = initialParams != null && !daoListByMemberParams;
    const daoListResult = useDaoList(initialParams!, { enabled: enableDaoList });

    const enableDaoListByMember = daoListByMemberParams != null && !initialParams;
    const daoListByMember = useDaoListByMemberAddress(daoListByMemberParams!, { enabled: enableDaoListByMember });

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

    return (
        <DataListRoot
            entityLabel={t('app.explore.daoList.entity')}
            onLoadMore={fetchNextPage}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <DataListContainer
                errorState={errorState}
                emptyState={emptyState}
                className={processedLayoutClassNames}
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
                        plugin={dao.plugins.map((plugin) => plugin.subdomain).join(',')}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
