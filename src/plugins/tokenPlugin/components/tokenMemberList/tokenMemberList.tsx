'use client';

import {
    addressUtils,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    MemberDataListItem,
} from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import type { IDaoMemberListDefaultProps } from '@/modules/governance/components/daoMemberList';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useTokenPinnedMembers } from '../../hooks/useTokenPinnedMembers';
import type { ITokenMember, ITokenPluginSettings } from '../../types';
import { TokenMemberListItem } from './components/tokenMemberListItem';

export interface ITokenMemberListProps
    extends IDaoMemberListDefaultProps<ITokenPluginSettings> {}

export const TokenMemberList: React.FC<ITokenMemberListProps> = (props) => {
    const { initialParams, hidePagination, plugin, children } = props;

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

    const { daoId, pluginAddress } = initialParams.queryParams;
    const { connectedUserMember, delegateMember, hasValidDelegate } =
        useTokenPinnedMembers({
            daoId,
            pluginAddress,
            pluginSettings: plugin.settings,
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

            pinnedAddresses.add(memberAddress);
            merged.push(member);
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
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                layoutClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
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
