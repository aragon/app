import { useMemberList } from '@/modules/governance/api/governanceService';
import type { IDaoMemberListProps } from '@/modules/governance/components/daoMemberList';
import { DataListContainer, DataListPagination, DataListRoot, MemberDataListItem } from '@aragon/ods';

export interface IMultisigMemberListProps extends IDaoMemberListProps {}

export const MultisigMemberList: React.FC<IMultisigMemberListProps> = (props) => {
    const { daoId, hidePagination, children } = props;

    const memberListQueryParams = { daoId };
    const { data: memberListData, isLoading, fetchNextPage } = useMemberList({ queryParams: memberListQueryParams });

    const memberList = memberListData?.pages.flatMap((page) => page.data);

    return (
        <DataListRoot
            entityLabel="Members"
            onLoadMore={fetchNextPage}
            state={isLoading ? 'fetchingNextPage' : 'idle'}
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
