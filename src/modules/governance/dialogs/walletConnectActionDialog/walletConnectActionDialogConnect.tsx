import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Dialog, IconType, InputText } from '@aragon/gov-ui-kit';
import { useForm } from 'react-hook-form';

export interface IWalletConnectActionFormData {
    /**
     * URI to be used for the wallet-connect connection.
     */
    uri: string;
}

export interface IWalletConnectActionDialogConnectProps {
    /**
     * Callback called on form submit.
     */
    onFormSubmit: (values: IWalletConnectActionFormData) => void;
    /**
     * Status of the app connection.
     */
    status: 'idle' | 'pending' | 'error';
}

export const WalletConnectActionDialogConnect: React.FC<IWalletConnectActionDialogConnectProps> = (props) => {
    const { onFormSubmit, status } = props;

    const { close } = useDialogContext();
    const { t } = useTranslations();

    const { handleSubmit, control } = useForm<IWalletConnectActionFormData>({ mode: 'onTouched' });

    const uriField = useFormField<IWalletConnectActionFormData, 'uri'>('uri', {
        control,
        rules: { required: true, pattern: /wc:[a-f0-9]{64}@2\?.*/ },
        defaultValue: '',
    });

    const primaryActionLabel = status === 'error' ? 'retry' : 'connect';
    const alertMessage =
        status === 'error'
            ? ({ message: t('app.governance.walletConnectActionDialog.connect.error'), variant: 'critical' } as const)
            : undefined;

    return (
        <form onSubmit={handleSubmit(onFormSubmit)}>
            <Dialog.Header
                title={t('app.governance.walletConnectActionDialog.connect.title')}
                description={t('app.governance.walletConnectActionDialog.connect.description')}
            />
            <Dialog.Content className="py-4">
                <InputText
                    placeholder={t('app.governance.walletConnectActionDialog.connect.uriField.placeholder')}
                    {...uriField}
                />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(`app.governance.walletConnectActionDialog.connect.action.${primaryActionLabel}`),
                    type: 'submit',
                    isLoading: status === 'pending',
                    iconRight: status === 'error' ? IconType.RELOAD : undefined,
                }}
                secondaryAction={{
                    label: t('app.governance.walletConnectActionDialog.connect.action.cancel'),
                    onClick: () => close(),
                }}
                alert={alertMessage}
            />
        </form>
    );
};
