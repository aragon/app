'use client';

import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    MemberDataListItem,
} from '@aragon/gov-ui-kit';
import { match } from 'ts-pattern';
import { useConnection } from 'wagmi';
import type { IDaoMemberListDefaultProps } from '@/modules/governance/components/daoMemberList';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useTokenDelegationOnboardingCheck } from '../../hooks/useTokenDelegationOnboardingCheck';
import { useTokenLockAndWrapOnboardingCheck } from '../../hooks/useTokenLockAndWrapOnboardingCheck';
import type { ITokenMember, ITokenPluginSettings } from '../../types';
import { TokenMemberListDelegationCardEmptyState } from './components/tokenMemberListDelegationCardEmptyState';
import { TokenMemberListItem } from './components/tokenMemberListItem';
import { TokenMemberListLockCardEmptyState } from './components/tokenMemberListLockCardEmptyState';
import { TokenMemberListWrapCardEmptyState } from './components/tokenMemberListWrapCardEmptyState';

export interface ITokenMemberListProps
    extends IDaoMemberListDefaultProps<ITokenPluginSettings> {}

export const TokenMemberList: React.FC<ITokenMemberListProps> = (props) => {
    const { initialParams, hidePagination, plugin, children } = props;
    const { token } = plugin.settings;

    const { t } = useTranslations();
    const { address: userAddress } = useConnection();

    const { shouldTrigger: showLockOrWrapCard } =
        useTokenLockAndWrapOnboardingCheck({
            governanceTokenAddress: token.address,
            underlyingTokenAddress: token.underlying ?? undefined,
            userAddress,
            network: token.network,
            enabled: userAddress != null,
        });

    const { shouldTrigger: showDelegationCard } =
        useTokenDelegationOnboardingCheck({
            tokenAddress: token.address,
            userAddress,
            network: token.network,
            enabled: userAddress != null,
        });

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
            {match({
                showDelegationCard,
                showLockOrWrapCard,
                hasVotingEscrow: plugin.settings.votingEscrow != null,
            })
                .with({ showDelegationCard: true }, () => (
                    <TokenMemberListDelegationCardEmptyState
                        daoId={daoId}
                        token={token}
                    />
                ))
                .with(
                    { showLockOrWrapCard: true, hasVotingEscrow: true },
                    () => (
                        <TokenMemberListLockCardEmptyState
                            daoId={daoId}
                            plugin={plugin}
                        />
                    ),
                )
                .with({ showLockOrWrapCard: true }, () => (
                    <TokenMemberListWrapCardEmptyState
                        daoId={daoId}
                        token={token}
                    />
                ))
                .otherwise(() => null)}
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
