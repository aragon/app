import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { invariant } from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useState } from 'react';
import { fromHex, isHex } from 'viem';
import type { IProposalAction } from '../../api/governanceService';
import {
    useConnectApp,
    useDisconnectApp,
    type ISessionRequest,
    type ISessionRequestParams,
} from '../../api/walletConnectService';
import { walletConnectService } from '../../api/walletConnectService/walletConnectService';
import { WalletConnectActionDialogConnect } from './walletConnectActionDialogConnect';
import { WalletConnectActionDialogListener } from './walletConnectActionDialogListener';

export interface IWalletConnectActionFormData {
    /**
     * URI to be used for the wallet-connect connection.
     */
    uri: string;
}

export interface IWalletConnectActionDialogParams {
    /**
     * Address of the DAO used for wallet-connect connection.
     */
    daoAddress: string;
    /**
     * Callback called when user clicks on add actions button.
     */
    onAddActionsClick: (actions: IProposalAction[]) => void;
}

export interface IWalletConnectActionDialog extends IDialogComponentProps<IWalletConnectActionDialogParams> {}

export const WalletConnectActionDialog: React.FC<IWalletConnectActionDialog> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'WalletConnectActionDialog: params must be defined');
    const { daoAddress, onAddActionsClick } = location.params;

    const { close } = useDialogContext();
    const [actions, setActions] = useState<IProposalAction[]>([]);

    const { data: appSession, mutate: connectApp, status: connectionStatus, reset: resetAppSession } = useConnectApp();
    const { mutate: disconnectApp } = useDisconnectApp();

    const handleSessionRequest = (sessionRequest: ISessionRequest) => {
        const { request } = sessionRequest.params;

        // Only sendTransaction session requests are currently supported
        if (request.method !== 'eth_sendTransaction') {
            return;
        }

        const { from, to, data, value = '0' } = (request.params as ISessionRequestParams[typeof request.method])[0];

        // Parse value from request as it can be set as hex instead of string
        const parsedValue = isHex(value) ? fromHex(value, 'bigint').toString() : value;
        const newAction: IProposalAction = { from, to, data, value: parsedValue, type: 'unknown', inputData: null };

        setActions((current) => [...current, newAction]);
    };

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
    }, [appSession, resetAppSession]);

    const handleFormSubmit = ({ uri }: IWalletConnectActionFormData) => {
        // Reset previous errors in case of retry
        resetAppSession();
        connectApp({ uri, address: daoAddress });
    };

    if (appSession == null) {
        return <WalletConnectActionDialogConnect onFormSubmit={handleFormSubmit} status={connectionStatus} />;
    } else {
        return (
            <WalletConnectActionDialogListener
                appMetadata={appSession.peer.metadata}
                actions={actions}
                onAddActionsClick={handleAddActions}
                onClose={handleCloseDialog}
            />
        );
    }
};
