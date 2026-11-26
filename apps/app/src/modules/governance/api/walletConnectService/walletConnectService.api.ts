import type { Network } from '@/shared/api/daoService';
import type {
    ISession,
    ISessionEvent,
    ISessionEventArguments,
    ISessionProposal,
} from './domain';

export interface IConnectAppParams {
    /**
     * Uri to be used for the wallet-connect connection.
     */
    uri: string;
    /**
     * Address of the connecting user.
     */
    address: string;
    /**
     * Network of the connecting user, the only chain offered to the dApp.
     */
    network: Network;
}

export interface IDisconnectAppParams {
    /**
     * Active session to be disconnected.
     */
    session: ISession;
}

export interface IApproveSessionParams {
    /**
     * Address of the connecting user.
     */
    address: string;
    /**
     * Network of the connecting user, the only chain offered to the dApp.
     */
    network: Network;
    /**
     * Proposed connection session to be approved.
     */
    sessionProposal: ISessionProposal;
}

export interface IPendingConnection extends Omit<IConnectAppParams, 'uri'> {
    /**
     * Topic of the pairing created from the connection URI, used to match the dApp's session proposal.
     */
    pairingTopic: string;
    /**
     * Callback called with the initiated session.
     */
    onSuccess: (session: ISession) => void;
    /**
     * Callback called when an error occours when establishing the connection.
     */
    onError: (error: Error) => void;
}

export interface ISetClientListenerParams<TEvent extends ISessionEvent> {
    /**
     * Event to listen to.
     */
    event: TEvent;
    /**
     * Callback called when the event is triggered.
     */
    callback: (args: ISessionEventArguments[TEvent]) => void;
}
