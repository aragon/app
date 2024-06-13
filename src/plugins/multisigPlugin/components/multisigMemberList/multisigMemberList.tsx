import { DataListContainer, DataListPagination, DataListRoot, MemberDataListItem } from '@aragon/ods';
import { useParams } from 'next/navigation';
import { useMultisigMemberList } from '../../api/tokenPluginService';

export interface IMultisigMemberListProps {
    /**
     * Plugin address to display the members for.
     */
    pluginAddress: string;
}

export const MultisigMemberList: React.FC<IMultisigMemberListProps> = (props) => {
    const { pluginAddress } = props;

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
            pageSize={tokenMemberListData?.pages[0].metadata.limit}
            itemsCount={tokenMemberListData?.pages[0].metadata.totRecords}
        >
            <DataListContainer SkeletonElement={MemberDataListItem.Skeleton} className="grid grid-cols-3">
                {tokenMemberList?.map((member) => (
                    <MemberDataListItem.Structure
                        key={member.address}
                        address={member.address}
                        ensName={member.ens ?? undefined}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
