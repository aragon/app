import type { IGetMemberListParams } from '@/modules/governance/api/governanceService';
import type { IDaoMemberListProps } from '@/modules/governance/components/daoMemberList';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, MemberDataListItem } from '@aragon/ods';
import type { ITokenMember, ITokenPluginSettings } from '../../types';
import { TokenMemberListItem } from './tokenMemberListItem';

export interface ITokenMemberListProps extends IDaoMemberListProps {
    /**
     * Initial parameters to use for fetching the member list.
     */
    initialParams: IGetMemberListParams;
    /**
     * DAO plugin to display to members for.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

export const TokenMemberList: React.FC<ITokenMemberListProps> = (props) => {
    const { initialParams, hidePagination, plugin, children } = props;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, memberList } =
        useMemberListData<ITokenMember>(initialParams);

    return (
        <DataListRoot
            entityLabel={t('app.plugins.token.tokenMemberList.entity')}
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
                {memberList?.map((member) => (
                    <TokenMemberListItem
                        key={member.address}
                        member={member}
                        daoId={initialParams.queryParams.daoId}
                        plugin={plugin}
                    />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
