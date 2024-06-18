import { useMemberList } from '@/modules/governance/api/governanceService';
import type { IDaoMemberListProps } from '@/modules/governance/components/daoMemberList';
import { DataListContainer, DataListPagination, DataListRoot, MemberDataListItem } from '@aragon/ods';
import type { ITokenMember } from '../../types/tokenMember';
import { TokenMemberListItem } from './tokenMemberListItem';

export interface ITokenMemberListProps extends IDaoMemberListProps {}

export const TokenMemberList: React.FC<ITokenMemberListProps> = (props) => {
    const { daoId, hidePagination, children } = props;

    const memberListQueryParams = { daoId };
    const {
        data: memberListData,
        isLoading,
        fetchNextPage,
    } = useMemberList<ITokenMember>({ queryParams: memberListQueryParams });

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
                {memberList?.map((member) => <TokenMemberListItem key={member.address} member={member} />)}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
