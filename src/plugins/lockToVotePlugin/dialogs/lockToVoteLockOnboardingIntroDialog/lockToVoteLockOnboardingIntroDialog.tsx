'use client';

import { Dialog, EmptyState, invariant } from '@aragon/gov-ui-kit';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { LockToVotePluginDialogId } from '../../constants/lockToVotePluginDialogId';
import type { ILockToVotePlugin } from '../../types';

export interface ILockToVoteLockOnboardingIntroDialogParams {
    plugin: ILockToVotePlugin;
    daoId: string;
}

export interface ILockToVoteLockOnboardingIntroDialogProps
    extends IDialogComponentProps<ILockToVoteLockOnboardingIntroDialogParams> {}

export const LockToVoteLockOnboardingIntroDialog: React.FC<
    ILockToVoteLockOnboardingIntroDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'LockToVoteLockOnboardingIntroDialog: required parameters must be set.',
    );

    const { plugin, daoId } = location.params;
    const tokenSymbol = plugin.settings.token.symbol;

    const { close, open } = useDialogContext();
    const { t } = useTranslations();

    const handleLockTokens = () => {
        open(LockToVotePluginDialogId.LOCK_ONBOARDING_FORM_L2V, {
            params: { plugin, daoId },
        });
    };

    const handleCancel = () => {
        close(LockToVotePluginDialogId.LOCK_ONBOARDING_INTRO_L2V);
    };

    return (
        <Dialog.Content className="flex flex-col items-center gap-4">
            <EmptyState
                description={t(
                    'app.plugins.lockToVote.lockToVoteLockOnboardingDialog.intro.description',
                )}
                heading={t(
                    'app.plugins.lockToVote.lockToVoteLockOnboardingDialog.intro.title',
                    { tokenSymbol },
                )}
                objectIllustration={{ object: 'WALLET' }}
                primaryButton={{
                    label: t(
                        'app.plugins.lockToVote.lockToVoteLockOnboardingDialog.intro.cta',
                    ),
                    onClick: handleLockTokens,
                    className: 'sm:w-max',
                }}
                secondaryButton={{
                    label: t(
                        'app.plugins.lockToVote.lockToVoteLockOnboardingDialog.intro.cancel',
                    ),
                    onClick: handleCancel,
                }}
            />
        </Dialog.Content>
    );
};
