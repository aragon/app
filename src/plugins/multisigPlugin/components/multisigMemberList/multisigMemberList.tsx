import type { IDaoMemberListProps } from '@/modules/governance/components/daoMemberList';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, MemberDataListItem } from '@aragon/ods';

export interface IMultisigMemberListProps extends IDaoMemberListProps {}

export const MultisigMemberList: React.FC<IMultisigMemberListProps> = (props) => {
    const { initialParams, hidePagination, children } = props;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, memberList } =
        useMemberListData(initialParams);

    return (
        <DataListRoot
            entityLabel={t('app.plugins.multisig.multisigMemberList.entity')}
            onLoadMore={onLoadMore}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <DataListContainer
                SkeletonElement={MemberDataListItem.Skeleton}
                layoutClassName="grid grid-cols-1 lg:grid-cols-3"
                errorState={errorState}
                emptyState={emptyState}
            >
                {memberList?.map((member) => (
                    <MemberDataListItem.Structure
                        key={member.address}
                        address={member.address}
                        ensName={member.ens ?? undefined}
                        className="min-w-0"
                        href={`/dao/${initialParams.queryParams.daoId}/members/${member.address}`}
                    />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
