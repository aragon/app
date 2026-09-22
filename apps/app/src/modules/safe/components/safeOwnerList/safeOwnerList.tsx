'use client';

import {
    ChainEntityType,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    MemberDataListItem,
} from '@aragon/gov-ui-kit';
import type { Network } from '@/shared/api/daoService';
import { useSafeInfo } from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { safeDataListUtils } from '../../utils/safeDataListUtils';

const ownersPerPage = 6;

export interface ISafeOwnerListProps {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe.
     */
    address: string;
}

export const SafeOwnerList: React.FC<ISafeOwnerListProps> = (props) => {
    const { network, address } = props;

    const { t } = useTranslations();
    const { buildEntityUrl } = useDaoChain({ network });

    const {
        data: safeInfo,
        isError,
        isLoading,
    } = useSafeInfo({ urlParams: { network, address } });

    const owners = safeInfo?.owners ?? [];
    const state = safeDataListUtils.getDataListState({ isError, isLoading });

    return (
        <DataListRoot
            entityLabel={t('app.safe.safeOwnerList.entity')}
            itemsCount={owners.length}
            pageSize={ownersPerPage}
            state={state}
        >
            <DataListContainer
                emptyState={{
                    heading: t('app.safe.safeOwnerList.empty.heading'),
                    description: t('app.safe.safeOwnerList.empty.description'),
                    objectIllustration: { object: 'USERS' },
                }}
                errorState={{
                    heading: t('app.safe.safeOwnerList.error.heading'),
                    description: t('app.safe.safeOwnerList.error.description'),
                    objectIllustration: { object: 'ERROR' },
                }}
                SkeletonElement={MemberDataListItem.Skeleton}
            >
                {owners.map((owner) => (
                    <MemberDataListItem.Structure
                        address={owner}
                        href={buildEntityUrl({
                            type: ChainEntityType.ADDRESS,
                            id: owner,
                        })}
                        key={owner}
                        rel="noopener"
                        target="_blank"
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
