'use client';

import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, invariant } from '@aragon/gov-ui-kit';

export interface IGaugeRegistrarSelectGaugeDialogParams {
    // Add any required parameters here
}

export interface IGaugeRegistrarSelectGaugeDialogProps
    extends IDialogComponentProps<IGaugeRegistrarSelectGaugeDialogParams> {}

export const GaugeRegistrarSelectGaugeDialog: React.FC<IGaugeRegistrarSelectGaugeDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'GaugeRegistrarSelectGaugeDialog: params must be defined');

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const handleSubmit = () => {
        // TODO: Implement gauge selection logic
        close();
    };

    return (
        <>
            <Dialog.Header
                onClose={close}
                title={t('app.plugins.gaugeRegistrar.gaugeRegistrarSelectGaugeDialog.title')}
            />
            <Dialog.Content description={t('app.plugins.gaugeRegistrar.gaugeRegistrarSelectGaugeDialog.description')}>
                <div className="flex w-full flex-col gap-3 pb-6 md:gap-2">
                    {/* Add your dialog content here */}
                    <div className="text-neutral-500">
                        {t('app.plugins.gaugeRegistrar.gaugeRegistrarSelectGaugeDialog.selectGaugePrompt')}
                    </div>
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.plugins.gaugeRegistrar.gaugeRegistrarSelectGaugeDialog.submit'),
                    onClick: handleSubmit,
                }}
                secondaryAction={{
                    label: t('app.plugins.gaugeRegistrar.gaugeRegistrarSelectGaugeDialog.cancel'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
