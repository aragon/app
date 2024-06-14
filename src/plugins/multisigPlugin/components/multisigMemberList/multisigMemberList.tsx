import { DataListContainer, DataListPagination, DataListRoot, MemberDataListItem } from '@aragon/ods';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useMultisigMemberList } from '../../api/tokenPluginService';

export interface IMultisigMemberListProps {
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

export const MultisigMemberList: React.FC<IMultisigMemberListProps> = (props) => {
    const { pluginAddress, hidePagination, children } = props;

    const { slug } = useParams<{ slug: string }>();

    const memberUrlParams = { slug };
    const memberQueryParams = { pluginAddress };
    const {
        data: tokenMemberListData,
        fetchNextPage,
        isLoading,
    } = useMultisigMemberList({ urlParams: memberUrlParams, queryParams: memberQueryParams });

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
                {tokenMemberList?.map((member) => (
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
