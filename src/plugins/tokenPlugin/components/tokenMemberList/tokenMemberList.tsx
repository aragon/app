'use client';

import type { IDaoMemberListDefaultProps } from '@/modules/governance/components/daoMemberList';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, MemberDataListItem } from '@aragon/gov-ui-kit';
import type { ITokenMember, ITokenPluginSettings } from '../../types';
import { TokenMemberListItem } from './components/tokenMemberListItem';

export interface ITokenMemberListProps extends IDaoMemberListDefaultProps<ITokenPluginSettings> {}

export const TokenMemberList: React.FC<ITokenMemberListProps> = (props) => {
    const { initialParams, hidePagination, plugin, children } = props;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, memberList } =
        useMemberListData<ITokenMember>(initialParams);
    const { daoId } = initialParams.queryParams;

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
                layoutClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            >
                {memberList?.map((member) => (
                    <TokenMemberListItem key={member.address} member={member} daoId={daoId} plugin={plugin} />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
