'use client';

import { useConnection } from 'wagmi';
import type { IDaoMemberListDefaultProps } from '@/modules/governance/components/daoMemberList';
import { TokenMemberListLockCardEmptyState } from '@/plugins/tokenPlugin/components/tokenMemberList/components/tokenMemberListLockCardEmptyState';
import { TokenMemberListBase } from '@/plugins/tokenPlugin/components/tokenMemberList/tokenMemberListBase';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useLockToVoteLockOnboardingCheck } from '../../hooks/useLockToVoteLockOnboardingCheck';
import type { ILockToVotePlugin, ILockToVotePluginSettings } from '../../types';

export interface ILockToVoteMemberListProps
    extends IDaoMemberListDefaultProps<ILockToVotePluginSettings> {
    plugin: ILockToVotePlugin;
}

export const LockToVoteMemberList: React.FC<ILockToVoteMemberListProps> = (
    props,
) => {
    const { initialParams, plugin } = props;
    const { token } = plugin.settings;
    const { daoId } = initialParams.queryParams;

    const { address: userAddress } = useConnection();

    const { shouldTrigger: showLockCard } = useLockToVoteLockOnboardingCheck({
        lockManagerAddress: plugin.lockManagerAddress,
        tokenAddress: token.address,
        userAddress,
        network: token.network,
        enabled: userAddress != null,
    });

    const tokenPlugin = plugin as unknown as IDaoPlugin<ITokenPluginSettings>;

    return (
        <TokenMemberListBase
            {...props}
            onboardingCard={
                showLockCard && (
                    <TokenMemberListLockCardEmptyState
                        daoId={daoId}
                        plugin={tokenPlugin}
                    />
                )
            }
            plugin={tokenPlugin}
        />
    );
};
