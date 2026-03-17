'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { GaugeVoterLockForm } from '@/plugins/gaugeVoterPlugin/components/gaugeVoterLockForm';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';
import type { IGaugeVoterLockOnboardingFormDialogParams } from './gaugeVoterLockOnboardingFormDialog.api';

export interface IGaugeVoterLockOnboardingFormDialogProps
    extends IDialogComponentProps<IGaugeVoterLockOnboardingFormDialogParams> {}

export const GaugeVoterLockOnboardingFormDialog: React.FC<
    IGaugeVoterLockOnboardingFormDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'GaugeVoterLockOnboardingFormDialog: required parameters must be set.',
    );

    const { plugin, daoId } = location.params;

    const { close } = useDialogContext();
    const { t } = useTranslations();

    const handleCancel = () => {
        close(GaugeVoterPluginDialogId.LOCK_ONBOARDING_FORM);
    };

    return (
        <>
            <Dialog.Header
                onClose={handleCancel}
                title={t(
                    'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.form.title',
                )}
            />
            <Dialog.Content className="flex w-full flex-col gap-4 pt-4 pb-6">
                <GaugeVoterLockForm
                    daoId={daoId}
                    mode="dialog"
                    onCancel={handleCancel}
                    plugin={plugin}
                />
            </Dialog.Content>
        </>
    );
};
