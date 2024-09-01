import type { Network } from '@/shared/api/daoService';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { Dialog, IconType } from '@aragon/ods';
import { useCallback, useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';

export interface IChangeNetworkDialogParams {
    /**
     * Callback triggered on connection success.
     */
    onSuccess?: () => void;
    /**
     * Callback triggered when the dialog is closed and the user is still not connected.
     */
    onError?: () => void;
    /**
     * Required network.
     */
    network: Network;
}

export interface IChangeNetworkDialogProps extends IDialogComponentProps<IChangeNetworkDialogParams> {}

export const ChangeNetworkDialog: React.FC<IChangeNetworkDialogProps> = (props) => {
    const { params, id } = props.location;
    const { onSuccess, onError, network } = params ?? {};

    const { t } = useTranslations();
    const { close, updateOptions } = useDialogContext();
    const { chainId } = useAccount();
    const { switchChain } = useSwitchChain();

    const { chainId: requestedChainId, name: requestedNetworkName } = networkDefinitions[network!];

    const handleSwitchChain = () => switchChain({ chainId: requestedChainId });

    // Custom close callback to trigger onError property when dialog is closed and user did not change the network
    const handleDialogClose = useCallback(() => {
        onError?.();
        close(id);
    }, [onError, close, id]);

    // Automatically close dialog when user is connected
    useEffect(() => {
        if (chainId === requestedChainId) {
            onSuccess?.();
            close(id);
        }
    }, [chainId, requestedChainId, onSuccess, close, id]);

    useEffect(() => {
        updateOptions({ onClose: handleDialogClose });
    }, [handleDialogClose, updateOptions]);

    return (
        <div className="flex flex-col gap-4 pt-10 md:gap-8">
            <Dialog.Content className="flex flex-col gap-6">
                <p>Change network to: {network}</p>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    iconLeft: IconType.BLOCKCHAIN_WALLET,
                    label: `Switch to ${requestedNetworkName}`,
                    onClick: handleSwitchChain,
                }}
                secondaryAction={{
                    label: t('app.application.connectWalletDialog.action.cancel'),
                    onClick: handleDialogClose,
                }}
            />
        </div>
    );
};
