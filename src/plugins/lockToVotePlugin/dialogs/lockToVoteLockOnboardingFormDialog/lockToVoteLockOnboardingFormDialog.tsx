'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { LockToVoteLockForm } from '@/plugins/lockToVotePlugin/components/lockToVoteMemberPanel/lockToVoteLockForm';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { LockToVotePluginDialogId } from '../../constants/lockToVotePluginDialogId';
import type { ILockToVoteLockOnboardingFormDialogParams } from './lockToVoteLockOnboardingFormDialog.api';

export interface ILockToVoteLockOnboardingFormDialogProps
    extends IDialogComponentProps<ILockToVoteLockOnboardingFormDialogParams> {}

export const LockToVoteLockOnboardingFormDialog: React.FC<
    ILockToVoteLockOnboardingFormDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'LockToVoteLockOnboardingFormDialog: required parameters must be set.',
    );

    const { plugin, daoId } = location.params;

    const { close } = useDialogContext();
    const { t } = useTranslations();

    const handleCancel = () => {
        close(LockToVotePluginDialogId.LOCK_ONBOARDING_FORM);
    };

    return (
        <>
            <Dialog.Header
                onClose={handleCancel}
                title={t(
                    'app.plugins.lockToVote.lockToVoteLockOnboardingDialog.form.title',
                )}
            />
            <Dialog.Content className="flex w-full flex-col gap-4 pt-4 pb-6">
                <LockToVoteLockForm
                    daoId={daoId}
                    mode="dialog"
                    onCancel={handleCancel}
                    plugin={plugin}
                />
            </Dialog.Content>
        </>
    );
};
