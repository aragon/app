import { useMemberList } from '@/modules/governance/api/governanceService';
import type { IDaoMemberListProps } from '@/modules/governance/components/daoMemberList';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { DataListContainer, DataListPagination, DataListRoot, MemberDataListItem } from '@aragon/ods';
import type { ITokenMember } from '../../types/tokenMember';
import { TokenMemberListItem } from './tokenMemberListItem';

export interface ITokenMemberListProps extends IDaoMemberListProps {}

export const TokenMemberList: React.FC<ITokenMemberListProps> = (props) => {
    const { initialParams, hidePagination, children } = props;

    const {
        data: memberListData,
        status,
        fetchStatus,
        isFetchingNextPage,
        fetchNextPage,
    } = useMemberList<ITokenMember>(initialParams);

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
                {memberList?.map((member) => <TokenMemberListItem key={member.address} member={member} />)}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
