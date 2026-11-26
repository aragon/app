import { WalletKit, type WalletKitTypes } from '@reown/walletkit';
import { Core } from '@walletconnect/core';
import {
    buildApprovedNamespaces,
    getSdkError,
    parseUri,
} from '@walletconnect/utils';
import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { walletConnectDefinitions } from '@/shared/constants/walletConnectDefinitions';
import type { ISession, ISessionEvent, ISessionProposal } from './domain';
import type {
    IApproveSessionParams,
    IConnectAppParams,
    IDisconnectAppParams,
    IPendingConnection,
    ISetClientListenerParams,
} from './walletConnectService.api';
import { WalletConnectUnsupportedNetworkError } from './walletConnectUnsupportedNetworkError';
import { WalletConnectUsedUriError } from './walletConnectUsedUriError';

export class WalletConnectService {
    private core = new Core({ projectId: walletConnectDefinitions.projectId });

    private client: InstanceType<typeof WalletKit> | undefined;

    // Disable request queue on signer client as otherwise the WalletConnect controller would not emit events if the
    // web UI does not respond to the initial session request.
    // See https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/sign-client/src/controllers/engine.ts#L2138
    private signConfig: WalletKitTypes.Options['signConfig'] = {
        disableRequestQueue: true,
    };

    // Specify all methods and events to always establish a connection with dApps even if some of the methods (e.g. sign)
    // are not supported (see https://docs.reown.com/walletkit/web/usage#evm-methods--events)
    private supportedMethods = [
        'eth_accounts',
        'eth_requestAccounts',
        'eth_sendRawTransaction',
        'eth_sign',
        'eth_signTransaction',
        'eth_signTypedData',
        'eth_signTypedData_v3',
        'eth_signTypedData_v4',
        'eth_sendTransaction',
        'personal_sign',
        'wallet_switchEthereumChain',
        'wallet_addEthereumChain',
        'wallet_getPermissions',
        'wallet_requestPermissions',
        'wallet_registerOnboarding',
        'wallet_watchAsset',
        'wallet_scanQRCode',
        'wallet_sendCalls',
        'wallet_getCallsStatus',
        'wallet_showCallsStatus',
        'wallet_getCapabilities',
    ];

    private supportedEvents = [
        'chainChanged',
        'accountsChanged',
        'message',
        'disconnect',
        'connect',
    ];

    constructor() {
        void this.initialize();
    }

    // Connection waiting for the session proposal of its dApp, only one connection can be pending at a time.
    private pendingConnection: IPendingConnection | undefined;

    private initialize = async (): Promise<void> => {
        const { metadata } = walletConnectDefinitions;
        this.client = await WalletKit.init({
            core: this.core,
            metadata,
            signConfig: this.signConfig,
        });
        // Registered once for the lifetime of the client, proposals are matched to the pending connection.
        this.client.on('session_proposal', this.handleSessionProposal);
    };

    connectApp = (params: IConnectAppParams): Promise<ISession> => {
        const { uri, address, network } = params;
        const { topic: pairingTopic } = parseUri(uri);

        this.cancelConnectApp();

        // The proposal of a known pairing was already answered, pairing it again would wait for a proposal that never comes.
        const isUsedUri = this.core.pairing
            .getPairings()
            .some((pairing) => pairing.topic === pairingTopic);

        if (isUsedUri) {
            return Promise.reject(new WalletConnectUsedUriError());
        }

        return new Promise((resolve, reject) => {
            const connection: IPendingConnection = {
                pairingTopic,
                address,
                network,
                onSuccess: resolve,
                onError: reject,
            };
            this.pendingConnection = connection;

            this.client?.pair({ uri }).catch((error: unknown) => {
                if (this.pendingConnection === connection) {
                    this.pendingConnection = undefined;
                }
                reject(this.parseError(error));
            });
        });
    };

    /**
     * Cancels the pending connection, if any. A proposal its dApp sends afterwards is rejected.
     */
    cancelConnectApp = () => {
        const connection = this.pendingConnection;
        this.pendingConnection = undefined;
        connection?.onError(new Error('Connection cancelled'));
    };

    disconnectApp = async (params: IDisconnectAppParams): Promise<void> => {
        const { session } = params;
        await this.client?.disconnectSession({
            topic: session.topic,
            reason: getSdkError('USER_DISCONNECTED'),
        });
    };

    attachListener = <TEvent extends ISessionEvent>(
        params: ISetClientListenerParams<TEvent>,
    ) => {
        const { event, callback } = params;
        this.client?.on(event, callback);
    };

    removeListener = <TEvent extends ISessionEvent>(
        params: ISetClientListenerParams<TEvent>,
    ) => {
        const { event, callback } = params;
        // WalletKit's off() also stops forwarding the event for every other listener, only remove this callback.
        this.client?.events.off(event, callback);
    };

    private handleSessionProposal = async (
        sessionProposal: ISessionProposal,
    ) => {
        const connection = this.pendingConnection;

        // Reject proposals of cancelled or unknown connections, so that no session is created for them.
        if (connection?.pairingTopic !== sessionProposal.params.pairingTopic) {
            await this.rejectSessionProposal(sessionProposal, 'USER_REJECTED');
            return;
        }

        this.pendingConnection = undefined;
        const { address, network, onSuccess, onError } = connection;

        try {
            const session = await this.approveSession({
                sessionProposal,
                address,
                network,
            });
            onSuccess(session);
        } catch (error: unknown) {
            onError(this.parseError(error));
        }
    };

    private approveSession = async (
        params: IApproveSessionParams,
    ): Promise<ISession> => {
        const { address, network, sessionProposal } = params;

        const namespaces = this.buildApprovedNamespaces({
            sessionProposal,
            address,
            network,
        });

        if (namespaces == null) {
            await this.rejectSessionProposal(
                sessionProposal,
                'UNSUPPORTED_CHAINS',
            );
            throw new WalletConnectUnsupportedNetworkError();
        }

        const session = await this.client!.approveSession({
            id: sessionProposal.id,
            namespaces,
        });

        return session;
    };

    // Returns undefined when the proposal cannot be served with the account on its network.
    private buildApprovedNamespaces = (params: IApproveSessionParams) => {
        const { address, network, sessionProposal } = params;

        try {
            const namespaces = buildApprovedNamespaces({
                proposal: sessionProposal.params,
                supportedNamespaces: this.getSupportedNamespaces(
                    address,
                    network,
                ),
            });

            return namespaces.eip155?.accounts.length ? namespaces : undefined;
        } catch {
            return undefined;
        }
    };

    private rejectSessionProposal = async (
        sessionProposal: ISessionProposal,
        reason: 'USER_REJECTED' | 'UNSUPPORTED_CHAINS',
    ) => {
        try {
            await this.client?.rejectSession({
                id: sessionProposal.id,
                reason: getSdkError(reason),
            });
        } catch {
            // Proposal already expired or answered, nothing left to reject.
        }
    };

    /**
     * Returns the CAIP-2 chain id (e.g. `eip155:1`) used by WalletConnect for the given network.
     */
    getChainNamespace = (network: Network): string =>
        `eip155:${networkDefinitions[network].id.toString()}`;

    // Only offer the account's own chain, so that the dApp cannot build requests for a different chain.
    private getSupportedNamespaces = (account: string, network: Network) => {
        const chainNamespace = this.getChainNamespace(network);

        return {
            eip155: {
                chains: [chainNamespace],
                methods: this.supportedMethods,
                events: this.supportedEvents,
                accounts: [`${chainNamespace}:${account}`],
            },
        };
    };

    private parseError = (error: unknown): Error =>
        error instanceof Error
            ? error
            : typeof error === 'string'
              ? new Error(error)
              : new Error('unknown error');
}

export const walletConnectService = new WalletConnectService();
