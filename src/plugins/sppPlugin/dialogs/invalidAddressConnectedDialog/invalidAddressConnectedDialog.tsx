import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog } from '@aragon/gov-ui-kit';

export interface IInvalidAddressConnectedDialogParams {}

export interface IInvalidAddressConnectedDialogProps
    extends IDialogComponentProps<IInvalidAddressConnectedDialogParams> {}

export const InvalidAddressConnectedDialog: React.FC<IInvalidAddressConnectedDialogProps> = () => {
    const { t } = useTranslations();
    const { close } = useDialogContext();

    return (
        <>
            <Dialog.Header title={t('app.plugins.spp.invalidAddressConnectedDialog.title')} />
            <Dialog.Content
                description={t('app.plugins.spp.invalidAddressConnectedDialog.description')}
                className="pb-4 md:pb-6"
            />
            <Dialog.Footer
                primaryAction={{
                    label: t('app.plugins.spp.invalidAddressConnectedDialog.action'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
