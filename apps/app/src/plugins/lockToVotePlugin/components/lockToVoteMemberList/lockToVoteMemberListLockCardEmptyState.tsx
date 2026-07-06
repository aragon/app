'use client';

import { CardEmptyState } from '@aragon/gov-ui-kit';
import { LockToVotePluginDialogId } from '@/plugins/lockToVotePlugin/constants/lockToVotePluginDialogId';
import type { ILockToVoteLockOnboardingFormDialogParams } from '@/plugins/lockToVotePlugin/dialogs/lockToVoteLockOnboardingFormDialog/lockToVoteLockOnboardingFormDialog.api';
import type { ILockToVotePlugin } from '@/plugins/lockToVotePlugin/types';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface ILockToVoteMemberListLockCardEmptyStateProps {
    /**
     * The lock-to-vote plugin instance.
     */
    plugin: ILockToVotePlugin;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const LockToVoteMemberListLockCardEmptyState: React.FC<
    ILockToVoteMemberListLockCardEmptyStateProps
> = (props) => {
    const { plugin, daoId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { token } = plugin.settings;

    const handleLockTokens = () => {
        const params: ILockToVoteLockOnboardingFormDialogParams = {
            plugin,
            daoId,
        };
        open(LockToVotePluginDialogId.LOCK_ONBOARDING_FORM_L2V, { params });
    };

    return (
        <CardEmptyState
            description={t(
                'app.plugins.lockToVote.lockToVoteMemberList.lockOnboardingCard.description',
            )}
            heading={t(
                'app.plugins.lockToVote.lockToVoteMemberList.lockOnboardingCard.heading',
                { symbol: token.symbol },
            )}
            isStacked={false}
            objectIllustration={{ object: 'WALLET' }}
            primaryButton={{
                label: t(
                    'app.plugins.lockToVote.lockToVoteMemberList.lockOnboardingCard.action',
                ),
                onClick: handleLockTokens,
            }}
        />
    );
};
