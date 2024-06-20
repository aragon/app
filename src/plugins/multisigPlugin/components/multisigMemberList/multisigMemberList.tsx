import { useMemberList } from '@/modules/governance/api/governanceService';
import type { IDaoMemberListProps } from '@/modules/governance/components/daoMemberList';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { DataListContainer, DataListPagination, DataListRoot, MemberDataListItem } from '@aragon/ods';

export interface IMultisigMemberListProps extends IDaoMemberListProps {}

export const MultisigMemberList: React.FC<IMultisigMemberListProps> = (props) => {
    const { initialParams, hidePagination, children } = props;

    const {
        data: memberListData,
        status,
        fetchStatus,
        isFetchingNextPage,
        fetchNextPage,
    } = useMemberList(initialParams);

    const memberList = memberListData?.pages.flatMap((page) => page.data);
    const dataListState = dataListUtils.queryToDataListState({ status, fetchStatus, isFetchingNextPage });

    return (
        <DataListRoot
            entityLabel="Members"
            onLoadMore={fetchNextPage}
            state={dataListState}
            pageSize={memberListData?.pages[0].metadata.pageSize}
            itemsCount={memberListData?.pages[0].metadata.totalRecords}
        >
            <DataListContainer
                SkeletonElement={MemberDataListItem.Skeleton}
                className="grid grid-cols-1 lg:grid-cols-3"
            >
                {memberList?.map((member) => (
                    <MemberDataListItem.Structure
                        key={member.address}
                        address={member.address}
                        ensName={member.ens ?? undefined}
                        className="min-w-0"
                    />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
