import type { ISession, ISessionEvent, ISessionEventArguments, ISessionProposal } from './domain';

export interface IConnectAppParams {
    /**
     * Uri to be used for the wallet-connect connection.
     */
    uri: string;
    /**
     * Address of the connecting user.
     */
    address: string;
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
     * Proposed connection session to be approved.
     */
    sessionProposal: ISessionProposal;
}

export interface IHandleSessionProposalParams extends IApproveSessionParams {
    /**
     * Callback called with the initiated session.
     */
    onSuccess: (session: ISession) => void;
    /**
     * Callback called when an error occours when establishing the connection.
     */
    onError: (error: Error) => void;
}

export interface IAttachClientListenerParams<TEvent extends ISessionEvent> {
    /**
     * Event to listen to.
     */
    event: TEvent;
    /**
     * Callback called when the event is triggered.
     */
    callback: (args: ISessionEventArguments[TEvent]) => void;
}
