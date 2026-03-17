'use client';

import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    MemberDataListItem,
} from '@aragon/gov-ui-kit';
import { type ReactNode, useMemo } from 'react';
import type { IDaoMemberListDefaultProps } from '@/modules/governance/components/daoMemberList';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
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
    const { daoId } = initialParams.queryParams;

    // Always use the parent DAO for the UI context (member URLs, etc.).
    // The parent DAO is server-side prefetched → always a cache hit.
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    // For linked account plugins the API call must target the linked account's own daoId so the
    // backend queries the correct DAO.
    const apiParams = useMemo(() => {
        const resolvedDaoId = daoUtils.resolvePluginDaoId(daoId, plugin, dao);

        if (resolvedDaoId === daoId) {
            return initialParams;
        }

        return {
            ...initialParams,
            queryParams: { ...initialParams.queryParams, daoId: resolvedDaoId },
        };
    }, [initialParams, plugin, dao, daoId]);

    const {
        onLoadMore,
        state,
        pageSize,
        itemsCount,
        errorState,
        emptyState,
        memberList,
    } = useMemberListData<ITokenMember>(apiParams);

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
