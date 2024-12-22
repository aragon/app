import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AvatarIcon, Dialog, IconType, Link } from '@aragon/gov-ui-kit';
import { useAppKit, useAppKitState } from '@reown/appkit/react';
import { useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { AragonLogo } from '../../components/aragonLogo';

export interface IConnectWalletDialogParams {
    /**
     * Callback triggered on connection success.
     */
    onSuccess?: () => void;
    /**
     * Callback triggered when the dialog is closed and the user is still not connected.
     */
    onError?: () => void;
}

export interface IConnectWalletDialogProps extends IDialogComponentProps<IConnectWalletDialogParams> {}

export const ConnectWalletDialog: React.FC<IConnectWalletDialogProps> = (props) => {
    const { params, id } = props.location;
    const { onSuccess, onError } = params ?? {};

    const { close, updateOptions } = useDialogContext();
    const { open: openWeb3Modal } = useAppKit();
    const { open: isAppKitModalOpen } = useAppKitState();
    const { isConnected, chainId } = useAccount();
    const { t } = useTranslations();

    const handleConnectClick = () => openWeb3Modal();

    // Custom close callback to trigger onError property when dialog is closed and user is not connected
    const handleDialogClose = useCallback(() => {
        onError?.();
        close(id);
    }, [onError, close, id]);

    useEffect(() => {
        if (isConnected) {
            onSuccess?.();
            close(id);
        }
    }, [isConnected, onSuccess, close, chainId, id]);

    // Disable closing the dialog on outside click when web3Modal is open to keep the connect-wallet dialog open
    // and track the wallet-connection status
    useEffect(() => {
        const disableOutsideClick = isAppKitModalOpen;
        updateOptions({ disableOutsideClick });
    }, [updateOptions, isAppKitModalOpen]);

    useEffect(() => {
        updateOptions({ onClose: handleDialogClose });
    }, [handleDialogClose, updateOptions]);

    if (isAppKitModalOpen) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 pt-10 md:gap-8">
            <Dialog.Content className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 md:gap-4">
                    <AragonLogo />
                    <p className="text-lg font-normal leading-tight text-neutral-500 md:text-xl">
                        <span className="block text-neutral-900">{t('app.application.connectWalletDialog.app')}</span>
                        <span>{t('app.application.connectWalletDialog.connect')}</span>
                    </p>
                </div>
                <div className="flex flex-col gap-4 text-sm font-normal leading-tight text-neutral-500">
                    <div className="flex flex-row items-center gap-3">
                        <AvatarIcon icon={IconType.CHECKMARK} variant="primary" size="sm" />
                        <p>{t('app.application.connectWalletDialog.feature.permissions')}</p>
                    </div>
                    <div className="flex flex-row items-center gap-3">
                        <AvatarIcon icon={IconType.APP_MEMBERS} variant="primary" size="sm" />
                        <p>{t('app.application.connectWalletDialog.feature.stats')}</p>
                    </div>
                    <div className="flex flex-row items-center gap-3">
                        <AvatarIcon icon={IconType.BLOCKCHAIN_SMARTCONTRACT} variant="primary" size="sm" />
                        <Link
                            iconRight={IconType.LINK_EXTERNAL}
                            target="_blank"
                            href={t('app.application.connectWalletDialog.auditLink')}
                        >
                            <span className="text-sm">
                                {t('app.application.connectWalletDialog.feature.smartContracts')}
                            </span>
                        </Link>
                    </div>
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    iconLeft: IconType.BLOCKCHAIN_WALLET,
                    label: t('app.application.connectWalletDialog.action.connect'),
                    onClick: handleConnectClick,
                }}
                secondaryAction={{
                    label: t('app.application.connectWalletDialog.action.cancel'),
                    onClick: handleDialogClose,
                }}
            />
        </div>
    );
};
