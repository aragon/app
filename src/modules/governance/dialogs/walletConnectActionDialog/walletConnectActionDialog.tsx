import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { invariant } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { IProposalAction } from '../../api/governanceService';
import { type ISessionRequest, type ISessionRequestParams, useConnectApp } from '../../api/walletConnectService';
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

    const [actions, setActions] = useState<IProposalAction[]>([]);

    const handleSessionRequest = (sessionRequest: ISessionRequest) => {
        const { request } = sessionRequest.params;

        // Only sendTransaction session requests are currently supported
        if (request.method !== 'eth_sendTransaction') {
            return;
        }

        const { from, to, data, value } = (request.params as ISessionRequestParams[typeof request.method])[0];
        const newAction: IProposalAction = { from, to, data, value, type: 'unknown', inputData: null };

        setActions((current) => [...current, newAction]);
    };

    const handleConnectionSuccess = () =>
        walletConnectService.attachListener({ event: 'session_request', callback: handleSessionRequest });

    const {
        data: appMetadata,
        mutate: connectApp,
        status: connectionStatus,
    } = useConnectApp({ onSuccess: handleConnectionSuccess });

    const handleFormSubmit = ({ uri }: IWalletConnectActionFormData) => connectApp({ uri, address: daoAddress });

    if (appMetadata == null) {
        return <WalletConnectActionDialogConnect onFormSubmit={handleFormSubmit} status={connectionStatus} />;
    } else {
        return (
            <WalletConnectActionDialogListener
                appMetadata={appMetadata}
                actions={actions}
                onAddActionsClick={onAddActionsClick}
            />
        );
    }
};
