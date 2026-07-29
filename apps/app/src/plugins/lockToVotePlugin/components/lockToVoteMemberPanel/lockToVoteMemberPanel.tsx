'use client';

import { Page } from '@/shared/components/page';
import type { ILockToVotePlugin } from '../../types';
import { LockToVoteLockForm } from './lockToVoteLockForm';

export interface ILockToVoteMemberPanelProps {
    /**
     * lock-to-vote DAO plugin.
     */
    plugin: ILockToVotePlugin;
    /**
     * ID of the DAO with lock-to-vote plugin.
     */
    daoId: string;
}

export const LockToVoteMemberPanel: React.FC<ILockToVoteMemberPanelProps> = (
    props,
) => {
    const { plugin, daoId } = props;

    const { token } = plugin.settings;
    const { symbol, name } = token;

    const cardTitle = `${name} (${symbol})`;

    return (
        <Page.AsideCard title={cardTitle}>
            <LockToVoteLockForm daoId={daoId} plugin={plugin} />
        </Page.AsideCard>
    );
};
