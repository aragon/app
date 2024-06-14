import { DataListContainer, DataListPagination, DataListRoot, MemberDataListItem } from '@aragon/ods';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useTokenMemberList } from '../../api/tokenPluginService';
import { TokenMemberListItem } from './tokenMemberListItem';

export interface ITokenMemberListProps {
    /**
     * Plugin address to display the members for.
     */
    pluginAddress: string;
    /**
     * Hides the pagination when set to true.
     */
    hidePagination?: boolean;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const TokenMemberList: React.FC<ITokenMemberListProps> = (props) => {
    const { pluginAddress, hidePagination, children } = props;

    const { slug } = useParams<{ slug: string }>();

    const memberUrlParams = { slug };
    const memberQueryParams = { pluginAddress };
    const {
        data: tokenMemberListData,
        fetchNextPage,
        isLoading,
    } = useTokenMemberList({ urlParams: memberUrlParams, queryParams: memberQueryParams });

    const tokenMemberList = tokenMemberListData?.pages.flatMap((page) => page.data);

    return (
        <DataListRoot
            entityLabel="Members"
            onLoadMore={fetchNextPage}
            state={isLoading ? 'fetchingNextPage' : 'idle'}
            pageSize={10}
            itemsCount={tokenMemberListData?.pages[0].metadata.totalRecords}
        >
            <DataListContainer
                SkeletonElement={MemberDataListItem.Skeleton}
                className="grid grid-cols-1 lg:grid-cols-3"
            >
                {tokenMemberList?.map((member) => <TokenMemberListItem key={member.address} member={member} />)}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
