import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { walletConnectDefinitions } from '@/shared/constants/walletConnectDefinitions';
import { WalletKit, type WalletKitTypes } from '@reown/walletkit';
import { Core } from '@walletconnect/core';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import type { ISession, ISessionEvent } from './domain';
import type {
    IApproveSessionParams,
    IConnectAppParams,
    IDisconnectAppParams,
    IHandleSessionProposalParams,
    ISetClientListenerParams,
} from './walletConnectService.api';

export class WalletConnectService {
    private core = new Core({ projectId: walletConnectDefinitions.projectId });

    private client: InstanceType<typeof WalletKit> | undefined;

    // Disable request queue on signer client as otherwise the WalletConnect controller would not emit events if the
    // web UI does not respond to the initial session request.
    // See https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/sign-client/src/controllers/engine.ts#L2138
    private signConfig: WalletKitTypes.Options['signConfig'] = { disableRequestQueue: true };

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

    private supportedEvents = ['chainChanged', 'accountsChanged', 'message', 'disconnect', 'connect'];

    constructor() {
        void this.initialize();
    }

    private initialize = async (): Promise<void> => {
        const { metadata } = walletConnectDefinitions;
        this.client = await WalletKit.init({ core: this.core, metadata, signConfig: this.signConfig });
    };

    connectApp = async (params: IConnectAppParams): Promise<ISession> => {
        const { uri, address } = params;

        return new Promise((resolve, reject) => {
            const handlers = { onError: reject, onSuccess: resolve };
            this.attachListener({
                event: 'session_proposal',
                callback: (sessionProposal) => this.handleSessionProposal({ sessionProposal, address, ...handlers }),
            });
            this.client?.pair({ uri }).catch((error: unknown) => reject(this.parseError(error)));
        });
    };

    disconnectApp = async (params: IDisconnectAppParams): Promise<void> => {
        const { session } = params;
        await this.client?.disconnectSession({ topic: session.topic, reason: getSdkError('USER_DISCONNECTED') });
    };

    attachListener = <TEvent extends ISessionEvent>(params: ISetClientListenerParams<TEvent>) => {
        const { event, callback } = params;
        this.client?.on(event, callback);
    };

    removeListener = <TEvent extends ISessionEvent>(params: ISetClientListenerParams<TEvent>) => {
        const { event, callback } = params;
        this.client?.off(event, callback);
    };

    private handleSessionProposal = async (params: IHandleSessionProposalParams) => {
        const { sessionProposal, address, onError, onSuccess } = params;

        try {
            const session = await this.approveSession({ sessionProposal, address });
            onSuccess(session);
        } catch (error: unknown) {
            onError(this.parseError(error));
        }
    };

    private approveSession = async (params: IApproveSessionParams): Promise<ISession> => {
        const { address, sessionProposal } = params;

        const supportedNamespaces = this.getSupportedNamespaces(address);
        const namespaces = buildApprovedNamespaces({ proposal: sessionProposal.params, supportedNamespaces });
        const session = await this.client!.approveSession({ id: sessionProposal.id, namespaces });

        return session;
    };

    private getSupportedNamespaces = (account: string) => {
        const supportedChainIds = Object.values(networkDefinitions).map((definition) => definition.chainId);

        const chainIdNamespaces = supportedChainIds.map((chainId) => `eip155:${chainId.toString()}`);
        const accountNamespaces = chainIdNamespaces.map((namespace) => `${namespace}:${account}`);

        return {
            eip155: {
                chains: chainIdNamespaces,
                methods: this.supportedMethods,
                events: this.supportedEvents,
                accounts: accountNamespaces,
            },
        };
    };

    private parseError = (error: unknown): Error =>
        error instanceof Error ? error : typeof error === 'string' ? new Error(error) : new Error('unknown error');
}

export const walletConnectService = new WalletConnectService();
