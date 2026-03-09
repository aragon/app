'use client';

import { Dialog, EmptyState, invariant } from '@aragon/gov-ui-kit';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';
import type { IGaugeVoterPlugin } from '../../types/gaugeVoterPlugin';

export interface IGaugeVoterLockOnboardingIntroDialogParams {
    plugin: IGaugeVoterPlugin;
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

    const { plugin, daoId } = location.params;
    const tokenSymbol = plugin.settings.token.symbol;

    const { close, open } = useDialogContext();
    const { t } = useTranslations();

    const handleLockTokens = () => {
        open(GaugeVoterPluginDialogId.LOCK_ONBOARDING_LOCK_TIME_INFO, {
            params: { plugin, daoId },
        });
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
