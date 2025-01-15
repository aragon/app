import type { Network } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { invariant } from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useState } from 'react';
import type { IProposalAction } from '../../api/governanceService';
import { useDecodeTransaction } from '../../api/smartContractService';
import {
    useConnectApp,
    useDisconnectApp,
    walletConnectService,
    type ISessionRequest,
} from '../../api/walletConnectService';
import {
    WalletConnectActionDialogConnect,
    type IWalletConnectActionFormData,
} from './walletConnectActionDialogConnect';
import { WalletConnectActionDialogListener } from './walletConnectActionDialogListener';
import { walletConnectActionDialogUtils } from './walletConnectActionDialogUtils';

export interface IWalletConnectActionDialogParams {
    /**
     * Address of the DAO used for wallet-connect connection.
     */
    daoAddress: string;
    /**
     * Network of the DAO.
     */
    daoNetwork: Network;
    /**
     * Callback called when user clicks on add actions button.
     */
    onAddActionsClick: (actions: IProposalAction[]) => void;
}

export interface IWalletConnectActionDialog extends IDialogComponentProps<IWalletConnectActionDialogParams> {}

export const WalletConnectActionDialog: React.FC<IWalletConnectActionDialog> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'WalletConnectActionDialog: params must be defined');
    const { daoAddress, daoNetwork, onAddActionsClick } = location.params;

    const { close } = useDialogContext();
    const [actions, setActions] = useState<IProposalAction[]>([]);

    const { data: appSession, mutate: connectApp, status: connectionStatus, reset: resetAppSession } = useConnectApp();
    const { mutate: disconnectApp } = useDisconnectApp();
    const { mutateAsync: decodeTransactionAsync } = useDecodeTransaction();

    const handleSessionRequest = useCallback(
        async (sessionRequest: ISessionRequest) => {
            const proposalAction = await walletConnectActionDialogUtils.sessionRequestToAction({
                sessionRequest,
                daoAddress,
                daoNetwork,
                decodeTransactionAsync,
            });

            if (proposalAction) {
                setActions((current) => [...current, proposalAction]);
            }
        },
        [decodeTransactionAsync, daoAddress, daoNetwork],
    );

    const handleCloseDialog = useCallback(() => {
        if (appSession) {
            disconnectApp({ session: appSession });
        }

        resetAppSession();
        close();
    }, [appSession, resetAppSession, disconnectApp, close]);

    const handleAddActions = () => {
        onAddActionsClick(actions);
        handleCloseDialog();
    };

    useEffect(() => {
        if (appSession) {
            walletConnectService.attachListener({ event: 'session_request', callback: handleSessionRequest });
            walletConnectService.attachListener({ event: 'session_delete', callback: resetAppSession });
        }

        return () => {
            walletConnectService.removeListener({ event: 'session_request', callback: handleSessionRequest });
            walletConnectService.removeListener({ event: 'session_delete', callback: resetAppSession });
        };
    }, [appSession, handleSessionRequest, resetAppSession]);

    const handleFormSubmit = ({ uri }: IWalletConnectActionFormData) => {
        // Reset previous errors in case of retry
        resetAppSession();
        connectApp({ uri, address: daoAddress });
    };

    if (appSession == null) {
        return <WalletConnectActionDialogConnect onFormSubmit={handleFormSubmit} status={connectionStatus} />;
    }

    return (
        <WalletConnectActionDialogListener
            appMetadata={appSession.peer.metadata}
            actions={actions}
            onAddActionsClick={handleAddActions}
            onClose={handleCloseDialog}
        />
    );
};
