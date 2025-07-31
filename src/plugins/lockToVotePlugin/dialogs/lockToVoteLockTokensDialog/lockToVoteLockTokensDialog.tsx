'use client';

import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { invariant } from '@aragon/gov-ui-kit';
import { LockToVoteLockForm } from '../../components/lockToVoteMemberPanel/lockToVoteLockForm';
import type { ILockToVotePlugin } from '../../types';

export interface ILockToVoteLockTokensDialogParams {
    /**
     * Lock to vote plugin.
     */
    plugin: ILockToVotePlugin;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface ILockToVoteLockTokensDialogProps extends IDialogComponentProps<ILockToVoteLockTokensDialogParams> {}

export const LockToVoteLockTokensDialog: React.FC<ILockToVoteLockTokensDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'LockToVoteLockTokensDialog: required parameters must be set.');

    const { plugin, daoId } = location.params;

    return <LockToVoteLockForm plugin={plugin} daoId={daoId} />;
};
