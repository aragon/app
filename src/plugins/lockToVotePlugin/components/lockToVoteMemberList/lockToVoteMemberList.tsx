'use client';

import { useConnection } from 'wagmi';
import type { IDaoMemberListDefaultProps } from '@/modules/governance/components/daoMemberList';
import { TokenMemberListBase } from '@/plugins/tokenPlugin/components/tokenMemberList/tokenMemberListBase';
import { useLockToVoteLockOnboardingCheck } from '../../hooks/useLockToVoteLockOnboardingCheck';
import type { ILockToVotePlugin, ILockToVotePluginSettings } from '../../types';
import { LockToVoteMemberListLockCardEmptyState } from './lockToVoteMemberListLockCardEmptyState';

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

    return (
        <TokenMemberListBase
            {...props}
            onboardingCard={
                showLockCard && (
                    <LockToVoteMemberListLockCardEmptyState
                        daoId={daoId}
                        plugin={plugin}
                    />
                )
            }
            plugin={plugin}
        />
    );
};
