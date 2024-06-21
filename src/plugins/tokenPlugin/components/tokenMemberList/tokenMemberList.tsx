import type { IDaoMemberListProps } from '@/modules/governance/components/daoMemberList';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import { DataListContainer, DataListPagination, DataListRoot, MemberDataListItem } from '@aragon/ods';
import type { ITokenMember } from '../../types';
import { TokenMemberListItem } from './tokenMemberListItem';

export interface ITokenMemberListProps extends IDaoMemberListProps {}

export const TokenMemberList: React.FC<ITokenMemberListProps> = (props) => {
    const { initialParams, hidePagination, children } = props;

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, memberList } =
        useMemberListData<ITokenMember>(initialParams);

    return (
        <DataListRoot
            entityLabel="Members"
            onLoadMore={onLoadMore}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <DataListContainer
                SkeletonElement={MemberDataListItem.Skeleton}
                emptyState={emptyState}
                errorState={errorState}
                layoutClassName="grid grid-cols-1 lg:grid-cols-3"
            >
                {memberList?.map((member) => <TokenMemberListItem key={member.address} member={member} />)}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
