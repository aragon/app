import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { ReactNode, useEffect } from 'react';

export interface IWalletConnectGuardProps {
    children: ReactNode;
}

export const WalletConnectGuard: React.FC<IWalletConnectGuardProps> = ({ children }) => {
    const { open, location } = useDialogContext();

    const { check: promptWalletConnection, result: isConnected } = useConnectedWalletGuard({
        onSuccess: () => {
            const { id, ...options } = location ?? {};

            if (!id) {
                return;
            }

            open(id, options);
        },
    });

    useEffect(() => {
        if (!isConnected) {
            promptWalletConnection();
        }
    }, [isConnected, promptWalletConnection]);

    if (!isConnected) {
        return null;
    }

    return <>{children}</>;
};
