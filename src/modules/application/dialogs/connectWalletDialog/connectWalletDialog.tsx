import { AvatarIcon, Dialog, IconType, Link } from '@aragon/gov-ui-kit';
import { useAppKit, useAppKitState } from '@reown/appkit/react';
import { useCallback, useEffect } from 'react';
import { useConnection } from 'wagmi';
import { AragonLogo } from '@/shared/components/aragonLogo';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';

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

export interface IConnectWalletDialogProps
    extends IDialogComponentProps<IConnectWalletDialogParams> {}

export const ConnectWalletDialog: React.FC<IConnectWalletDialogProps> = (
    props,
) => {
    const { params, id } = props.location;
    const { onSuccess, onError } = params ?? {};

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const { close, updateOptions } = useDialogContext();
    const { open: openWeb3Modal } = useAppKit();
    const { open: isAppKitModalOpen } = useAppKitState();
    const { isConnected } = useConnection();
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
    }, [isConnected, onSuccess, close, id]);

    // Disable closing the dialog on outside click when web3Modal is open to keep the connect-wallet dialog open
    // and track the wallet-connection status
    useEffect(() => {
        const disableOutsideClick = isAppKitModalOpen;
        updateOptions({ disableOutsideClick });
        // There is a known issue on the radix dialog where elements are not scrollable when the dialog is open.
        // see here: https://github.com/radix-ui/primitives/issues/1159
        const appKitModal = document.querySelector('w3m-modal');
        const handleWheel = (event: Event) => event.stopPropagation();
        const preventTouchScroll = (event: Event) => event.stopPropagation();

        appKitModal?.addEventListener('wheel', handleWheel);
        appKitModal?.addEventListener('touchmove', preventTouchScroll, {
            passive: false,
        });

        return () => {
            appKitModal?.removeEventListener('wheel', handleWheel);
            appKitModal?.removeEventListener('touchmove', preventTouchScroll);
        };
    }, [updateOptions, isAppKitModalOpen]);

    useEffect(() => {
        updateOptions({ onClose: handleDialogClose });
    }, [handleDialogClose, updateOptions]);

    if (isAppKitModalOpen) {
        return null;
    }

    return (
        <>
            <Dialog.Content className="flex flex-col gap-6 p-6 md:p-8">
                <div className="flex flex-col gap-3 md:gap-4">
                    <AragonLogo size="lg" />
                    <p className="font-normal text-lg text-neutral-500 leading-tight md:text-xl">
                        {t('app.application.connectWalletDialog.connect')}
                    </p>
                </div>
                <div className="flex flex-col gap-4 font-normal text-neutral-500 text-sm leading-tight">
                    <div className="flex flex-row items-center gap-3">
                        <AvatarIcon
                            icon={IconType.CHECKMARK}
                            size="sm"
                            variant="primary"
                        />
                        <p>
                            {t(
                                'app.application.connectWalletDialog.feature.permissions',
                            )}
                        </p>
                    </div>
                    <div className="flex flex-row items-center gap-3">
                        <AvatarIcon
                            icon={IconType.APP_MEMBERS}
                            size="sm"
                            variant="primary"
                        />
                        <p>
                            {t(
                                'app.application.connectWalletDialog.feature.stats',
                            )}
                        </p>
                    </div>
                    <div className="flex flex-row items-center gap-3">
                        <AvatarIcon
                            icon={IconType.BLOCKCHAIN_SMARTCONTRACT}
                            size="sm"
                            variant="primary"
                        />
                        <Link
                            href={t(
                                'app.application.connectWalletDialog.auditLink',
                            )}
                            isExternal={true}
                        >
                            <span className="text-sm">
                                {t(
                                    'app.application.connectWalletDialog.feature.smartContracts',
                                )}
                            </span>
                        </Link>
                    </div>
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    iconLeft: IconType.BLOCKCHAIN_WALLET,
                    label: t(
                        'app.application.connectWalletDialog.action.connect',
                    ),
                    onClick: handleConnectClick,
                }}
                secondaryAction={{
                    label: t(
                        'app.application.connectWalletDialog.action.cancel',
                    ),
                    onClick: handleDialogClose,
                }}
            />
        </>
    );
};
