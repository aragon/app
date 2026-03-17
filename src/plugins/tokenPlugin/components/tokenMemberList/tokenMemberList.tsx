'use client';

import { match } from 'ts-pattern';
import { useConnection } from 'wagmi';
import type { IDaoMemberListDefaultProps } from '@/modules/governance/components/daoMemberList';
import { useTokenDelegationOnboardingCheck } from '../../hooks/useTokenDelegationOnboardingCheck';
import { useTokenLockAndWrapOnboardingCheck } from '../../hooks/useTokenLockAndWrapOnboardingCheck';
import type { ITokenPluginSettings } from '../../types';
import { TokenMemberListDelegationCardEmptyState } from './components/tokenMemberListDelegationCardEmptyState';
import { TokenMemberListLockCardEmptyState } from './components/tokenMemberListLockCardEmptyState';
import { TokenMemberListWrapCardEmptyState } from './components/tokenMemberListWrapCardEmptyState';
import { TokenMemberListBase } from './tokenMemberListBase';

export interface ITokenMemberListProps
    extends IDaoMemberListDefaultProps<ITokenPluginSettings> {}

export const TokenMemberList: React.FC<ITokenMemberListProps> = (props) => {
    const { initialParams, plugin } = props;
    const { token } = plugin.settings;
    const { daoId } = initialParams.queryParams;

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
            enabled: userAddress != null && token.hasDelegate,
        });

    const onboardingCard = match({
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
        .with({ showLockOrWrapCard: true, hasVotingEscrow: true }, () => (
            <TokenMemberListLockCardEmptyState daoId={daoId} plugin={plugin} />
        ))
        .with({ showLockOrWrapCard: true }, () => (
            <TokenMemberListWrapCardEmptyState daoId={daoId} token={token} />
        ))
        .otherwise(() => null);

    return <TokenMemberListBase {...props} onboardingCard={onboardingCard} />;
};
