import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog } from '@aragon/gov-ui-kit';

export interface ISppInvalidAddressConnectedDialogParams {}

export interface ISppInvalidAddressConnectedDialogProps
    extends IDialogComponentProps<ISppInvalidAddressConnectedDialogParams> {}

export const SppInvalidAddressConnectedDialog: React.FC<ISppInvalidAddressConnectedDialogProps> = () => {
    const { t } = useTranslations();
    const { close } = useDialogContext();

    return (
        <>
            <Dialog.Header title={t('app.plugins.spp.sppInvalidAddressConnectedDialog.title')} />
            <Dialog.Content
                description={t('app.plugins.spp.sppInvalidAddressConnectedDialog.description')}
                className="pb-4 md:pb-6"
            />
            <Dialog.Footer
                primaryAction={{
                    label: t('app.plugins.spp.sppInvalidAddressConnectedDialog.action'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
