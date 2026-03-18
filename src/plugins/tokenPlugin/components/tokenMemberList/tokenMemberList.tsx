'use client';

import {
    addressUtils,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    MemberDataListItem,
} from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import {
    type IGetMemberParams,
    useMember,
} from '@/modules/governance/api/governanceService';
import type { IDaoMemberListDefaultProps } from '@/modules/governance/components/daoMemberList';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import { type Network, useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useTokenCurrentDelegate } from '../../hooks/useTokenCurrentDelegate';
import type { ITokenMember, ITokenPluginSettings } from '../../types';
import { TokenMemberListItem } from './components/tokenMemberListItem';

export interface ITokenMemberListProps
    extends IDaoMemberListDefaultProps<ITokenPluginSettings> {}

export const TokenMemberList: React.FC<ITokenMemberListProps> = (props) => {
    const { initialParams, hidePagination, plugin, children } = props;

    const { t } = useTranslations();
    const { address: connectedAddress } = useAccount();

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
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { data: delegateAddress } = useTokenCurrentDelegate({
        tokenAddress: plugin.settings.token.address,
        userAddress: connectedAddress,
        network: dao?.network as Network,
        enabled: connectedAddress != null && dao?.network != null,
    });

    const hasValidDelegate =
        delegateAddress != null &&
        delegateAddress !== zeroAddress &&
        !addressUtils.isAddressEqual(delegateAddress, connectedAddress ?? '');

    const pinnedMemberParams: IGetMemberParams = {
        urlParams: { address: connectedAddress ?? '' },
        queryParams: { daoId, pluginAddress },
    };

    const delegateMemberParams: IGetMemberParams = {
        urlParams: { address: delegateAddress ?? '' },
        queryParams: { daoId, pluginAddress },
    };

    const { data: connectedUserMember } = useMember<ITokenMember>(
        pinnedMemberParams,
        { enabled: connectedAddress != null },
    );

    const { data: delegateMember } = useMember<ITokenMember>(
        delegateMemberParams,
        { enabled: hasValidDelegate },
    );

    const mergedMemberList = useMemo(() => {
        if (!memberList) {
            return undefined;
        }

        const pinnedAddresses = new Set<string>();
        const pinned: ITokenMember[] = [];

        if (connectedUserMember?.address) {
            const paginatedEntry = memberList.find((m) =>
                addressUtils.isAddressEqual(
                    m.address,
                    connectedUserMember.address,
                ),
            );
            const entry = paginatedEntry ?? connectedUserMember;
            const hasVotingPower = BigInt(entry.votingPower ?? '0') > BigInt(0);

            if (hasVotingPower) {
                pinned.push(entry);
                pinnedAddresses.add(connectedUserMember.address.toLowerCase());
            }
        }

        if (delegateMember?.address && hasValidDelegate) {
            const delegateAddrLower = delegateMember.address.toLowerCase();
            if (!pinnedAddresses.has(delegateAddrLower)) {
                const paginatedEntry = memberList.find((m) =>
                    addressUtils.isAddressEqual(
                        m.address,
                        delegateMember.address,
                    ),
                );
                pinned.push(paginatedEntry ?? delegateMember);
                pinnedAddresses.add(delegateAddrLower);
            }
        }

        const rest = memberList.filter(
            (m) => !pinnedAddresses.has(m.address.toLowerCase()),
        );

        return [...pinned, ...rest];
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
                                delegateAddress ?? '',
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
