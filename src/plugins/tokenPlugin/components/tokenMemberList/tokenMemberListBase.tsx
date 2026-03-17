'use client';

import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    MemberDataListItem,
} from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import type { IDaoMemberListDefaultProps } from '@/modules/governance/components/daoMemberList';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ITokenMember, ITokenPluginSettings } from '../../types';
import { TokenMemberListItem } from './components/tokenMemberListItem';

export interface ITokenMemberListBaseProps
    extends IDaoMemberListDefaultProps<ITokenPluginSettings> {
    /**
     * Onboarding card to display (lock/wrap/delegate).
     */
    onboardingCard?: ReactNode;
}

export const TokenMemberListBase: React.FC<ITokenMemberListBaseProps> = (
    props,
) => {
    const { initialParams, hidePagination, plugin, onboardingCard, children } =
        props;

    const { t } = useTranslations();

    const {
        onLoadMore,
        state,
        pageSize,
        itemsCount,
        errorState,
        emptyState,
        memberList,
    } = useMemberListData<ITokenMember>(initialParams);
    const { daoId } = initialParams.queryParams;

    return (
        <DataListRoot
            entityLabel={t('app.plugins.token.tokenMemberList.entity')}
            itemsCount={itemsCount}
            onLoadMore={onLoadMore}
            pageSize={pageSize}
            state={state}
        >
            {onboardingCard}
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                layoutClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                SkeletonElement={MemberDataListItem.Skeleton}
            >
                {memberList?.map((member) => (
                    <TokenMemberListItem
                        daoId={daoId}
                        key={member.address}
                        member={member}
                        plugin={plugin}
                    />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
