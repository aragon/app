'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dateUtils } from '@/shared/utils/dateUtils';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';
import type { IGaugeVoterPlugin } from '../../types';

export interface IGaugeVoterLockOnboardingLockTimeInfoDialogParams {
    plugin: IGaugeVoterPlugin;
    daoId: string;
}

export interface IGaugeVoterLockOnboardingLockTimeInfoDialogProps
    extends IDialogComponentProps<IGaugeVoterLockOnboardingLockTimeInfoDialogParams> {}

export const GaugeVoterLockOnboardingLockTimeInfoDialog: React.FC<
    IGaugeVoterLockOnboardingLockTimeInfoDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'GaugeVoterLockOnboardingLockTimeInfoDialog: required parameters must be set.',
    );

    const { plugin, daoId } = location.params;
    const { token, votingEscrow } = plugin.settings;

    const { symbol: tokenSymbol } = token;

    const minLockDays = dateUtils.secondsToDuration(
        votingEscrow.minLockTime,
    ).days;
    const cooldownDays = dateUtils.secondsToDuration(
        votingEscrow.cooldown,
    ).days;
    const totalDays = minLockDays + cooldownDays;

    const { close, open } = useDialogContext();
    const { t } = useTranslations();

    const handleLock = () => {
        open(GaugeVoterPluginDialogId.LOCK_ONBOARDING_FORM, {
            params: { plugin, daoId },
        });
    };

    const handleCancel = () => {
        close(GaugeVoterPluginDialogId.LOCK_ONBOARDING_LOCK_TIME_INFO);
    };

    return (
        <>
            <Dialog.Header
                title={t(
                    'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.lockTimeInfo.title',
                    { tokenSymbol },
                )}
            />
            <Dialog.Content className="flex flex-col gap-4 pb-3">
                <p className="text-neutral-500">
                    {t(
                        'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.lockTimeInfo.description',
                        { tokenSymbol },
                    )}
                </p>
                <div className="flex flex-col gap-3 rounded-xl border border-neutral-100 p-6">
                    <div className="flex items-baseline justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="text-neutral-800">
                                {t(
                                    'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.lockTimeInfo.minLocktime',
                                )}
                            </span>
                            <div className="size-2 rounded-full bg-neutral-300" />
                        </div>
                        <span className="text-neutral-500">
                            {t(
                                'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.lockTimeInfo.days',
                                { count: minLockDays },
                            )}
                        </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="text-info-800">
                                {t(
                                    'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.lockTimeInfo.cooldown',
                                )}
                            </span>
                            <div className="size-2 rounded-full bg-info-400" />
                        </div>
                        <span className="text-neutral-500">
                            {t(
                                'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.lockTimeInfo.days',
                                { count: cooldownDays },
                            )}
                        </span>
                    </div>
                    <div className="h-px w-full bg-neutral-100" />
                    <div className="flex items-baseline justify-between">
                        <span className="text-neutral-800">
                            {t(
                                'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.lockTimeInfo.total',
                            )}
                        </span>
                        <span className="text-neutral-800">
                            {t(
                                'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.lockTimeInfo.days',
                                { count: totalDays },
                            )}
                        </span>
                    </div>
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.lockTimeInfo.cta',
                    ),
                    onClick: handleLock,
                }}
                secondaryAction={{
                    label: t(
                        'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.lockTimeInfo.cancel',
                    ),
                    onClick: handleCancel,
                }}
            />
        </>
    );
};
