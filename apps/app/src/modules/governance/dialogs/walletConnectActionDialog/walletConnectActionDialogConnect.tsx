import { Dialog, IconType, InputText } from '@aragon/gov-ui-kit';
import { useForm } from 'react-hook-form';
import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    WalletConnectUnsupportedNetworkError,
    WalletConnectUsedUriError,
} from '../../api/walletConnectService';

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
     * Callback called on cancel click, closing the dialog.
     */
    onCancel: () => void;
    /**
     * Status of the app connection.
     */
    status: 'idle' | 'pending' | 'error';
    /**
     * Network of the account the dApp connects to.
     */
    network: Network;
    /**
     * Error of the last connection attempt, explained below the URI field when it is a known WalletConnect error.
     */
    error?: unknown;
}

const formId = 'dappConnectForm';

export const WalletConnectActionDialogConnect: React.FC<
    IWalletConnectActionDialogConnectProps
> = (props) => {
    const { onFormSubmit, onCancel, status, network, error } = props;

    const { t } = useTranslations();

    const { handleSubmit, control } = useForm<IWalletConnectActionFormData>({
        mode: 'onTouched',
    });

    const uriField = useFormField<IWalletConnectActionFormData, 'uri'>('uri', {
        control,
        rules: { required: true, pattern: /wc:[a-f0-9]{64}@2\?.*/ },
        defaultValue: '',
    });

    const primaryActionLabel = status === 'error' ? 'retry' : 'connect';

    const errorMessage =
        error instanceof WalletConnectUnsupportedNetworkError
            ? t(
                  'app.governance.walletConnectActionDialog.connect.unsupportedNetwork',
                  { network: networkDefinitions[network].name },
              )
            : error instanceof WalletConnectUsedUriError
              ? t('app.governance.walletConnectActionDialog.connect.usedUri')
              : undefined;

    const errorAlert =
        errorMessage != null
            ? { message: errorMessage, variant: 'critical' as const }
            : undefined;

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.governance.walletConnectActionDialog.connect.description',
                )}
                title={t(
                    'app.governance.walletConnectActionDialog.connect.title',
                )}
            />
            <Dialog.Content>
                <form
                    className="py-tight--fixed-8"
                    id={formId}
                    onSubmit={handleSubmit(onFormSubmit)}
                >
                    <InputText
                        placeholder={t(
                            'app.governance.walletConnectActionDialog.connect.uriField.placeholder',
                        )}
                        {...uriField}
                        alert={uriField.alert ?? errorAlert}
                    />
                </form>
            </Dialog.Content>
            <Dialog.Footer
                hasError={status === 'error'}
                primaryAction={{
                    label: t(
                        `app.governance.walletConnectActionDialog.connect.action.${primaryActionLabel}`,
                    ),
                    type: 'submit',
                    isLoading: status === 'pending',
                    iconRight: status === 'error' ? IconType.RELOAD : undefined,
                    form: formId,
                }}
                secondaryAction={{
                    label: t(
                        'app.governance.walletConnectActionDialog.connect.action.cancel',
                    ),
                    onClick: onCancel,
                }}
            />
        </>
    );
};
