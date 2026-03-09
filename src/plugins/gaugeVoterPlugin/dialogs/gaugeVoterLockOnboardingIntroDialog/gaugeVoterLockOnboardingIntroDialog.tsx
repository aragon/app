'use client';

import { Dialog, EmptyState, invariant } from '@aragon/gov-ui-kit';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';

export interface IGaugeVoterLockOnboardingIntroDialogParams {
    tokenAddress: string;
    tokenSymbol: string;
    daoId: string;
}

export interface IGaugeVoterLockOnboardingIntroDialogProps
    extends IDialogComponentProps<IGaugeVoterLockOnboardingIntroDialogParams> {}

export const GaugeVoterLockOnboardingIntroDialog: React.FC<
    IGaugeVoterLockOnboardingIntroDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'GaugeVoterLockOnboardingIntroDialog: required parameters must be set.',
    );

    const { tokenSymbol } = location.params;

    const { close } = useDialogContext();
    const { t } = useTranslations();

    const handleLockTokens = () => {
        // TODO: open lock tokens dialog
    };

    const handleCancel = () => {
        close(GaugeVoterPluginDialogId.LOCK_ONBOARDING_INTRO);
    };

    return (
        <Dialog.Content className="flex flex-col items-center gap-4">
            <EmptyState
                description={t(
                    'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.intro.description',
                )}
                heading={t(
                    'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.intro.title',
                    { tokenSymbol },
                )}
                objectIllustration={{ object: 'WALLET' }}
                primaryButton={{
                    label: t(
                        'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.intro.cta',
                    ),
                    onClick: handleLockTokens,
                    className: 'sm:w-max',
                }}
                secondaryButton={{
                    label: t(
                        'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.intro.cancel',
                    ),
                    onClick: handleCancel,
                }}
            />
        </Dialog.Content>
    );
};
