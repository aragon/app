'use client';

import {
    addressUtils,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    MemberDataListItem,
} from '@aragon/gov-ui-kit';
import { type ReactNode, useMemo } from 'react';
import type { IToken } from '@/modules/finance/api/financeService';
import type { IDaoMemberListDefaultProps } from '@/modules/governance/components/daoMemberList';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import type { IPluginSettings } from '@/shared/api/daoService';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useTokenPinnedMembers } from '../../hooks/useTokenPinnedMembers';
import type { ITokenMember } from '../../types';
import { TokenMemberListItem } from './components/tokenMemberListItem';

/**
 * Lowest common plugin settings for TV and LTV plugins.
 */
export interface ITokenMemberListPluginSettings extends IPluginSettings {
    /**
     * Governance token of the DAO.
     */
    token: IToken;
}

export interface ITokenMemberListBaseProps
    extends Omit<
        IDaoMemberListDefaultProps<ITokenMemberListPluginSettings>,
        'onMemberClick'
    > {
    /**
     * Onboarding card to display (lock/wrap/delegate).
     */
    onboardingCard?: ReactNode;
    /**
     * Enables delegation-specific behavior in the shared member list.
     */
    enableDelegation?: boolean;
}

export const TokenMemberListBase: React.FC<ITokenMemberListBaseProps> = (
    props,
) => {
    const {
        initialParams,
        hidePagination,
        layoutClassNames,
        plugin,
        onboardingCard,
        enableDelegation,
        children,
    } = props;

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

    const { connectedUserMember, delegateMember, hasValidDelegate } =
        useTokenPinnedMembers({
            daoId: apiParams.queryParams.daoId,
            pluginAddress: apiParams.queryParams.pluginAddress,
            token: plugin.settings.token,
            enableDelegation,
        });

    const mergedMemberList = useMemo(() => {
        if (!memberList) {
            return undefined;
        }

        const pinnedAddresses = new Set<string>();
        const merged: ITokenMember[] = [];

        const appendPinnedMember = (member?: ITokenMember) => {
            if (member?.address == null) {
                return;
            }

            const memberAddress = member.address.toLowerCase();
            if (pinnedAddresses.has(memberAddress)) {
                return;
            }

            // Prefer the paginated entry (has full data like votingPower)
            // over the useMember response (may have votingPower: null).
            const paginatedEntry = memberList.find((m) =>
                addressUtils.isAddressEqual(m.address, member.address),
            );

            pinnedAddresses.add(memberAddress);
            merged.push(paginatedEntry ?? member);
        };

        appendPinnedMember(connectedUserMember);
        if (hasValidDelegate) {
            appendPinnedMember(delegateMember);
        }

        for (const member of memberList) {
            const memberAddress = member.address.toLowerCase();
            if (pinnedAddresses.has(memberAddress)) {
                continue;
            }

            merged.push(member);
        }

        return merged.slice(0, memberList.length);
    }, [memberList, connectedUserMember, delegateMember, hasValidDelegate]);

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
                layoutClassName={
                    layoutClassNames ??
                    'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                }
                SkeletonElement={MemberDataListItem.Skeleton}
            >
                {mergedMemberList?.map((member) => (
                    <TokenMemberListItem
                        daoId={daoId}
                        isDelegate={
                            hasValidDelegate &&
                            addressUtils.isAddressEqual(
                                member.address,
                                delegateMember?.address ?? '',
                            )
                        }
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
