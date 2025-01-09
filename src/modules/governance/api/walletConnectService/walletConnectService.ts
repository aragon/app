import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { walletConnectDefinitions } from '@/shared/constants/walletConnectDefinitions';
import { type IWalletKit, WalletKit } from '@reown/walletkit';
import { Core } from '@walletconnect/core';
import { buildApprovedNamespaces } from '@walletconnect/utils';
import type { IAppMetadata, ISession, ISessionEvent } from './domain';
import type {
    IApproveSessionParams,
    IAttachClientListenerParams,
    IConnectAppParams,
    IHandleSessionProposalParams,
} from './walletConnectService.api';

class WalletConnectService {
    private core = new Core({ projectId: walletConnectDefinitions.projectId });

    private client: IWalletKit | undefined;

    private getClient = async (): Promise<IWalletKit> => {
        if (this.client == null) {
            const { metadata } = walletConnectDefinitions;
            this.client = await WalletKit.init({ core: this.core, metadata });
        }

        return this.client;
    };

    connectApp = async (params: IConnectAppParams): Promise<IAppMetadata> => {
        const { uri, address } = params;
        const client = await this.getClient();

        return new Promise((resolve, reject) => {
            const handlers = { onError: reject, onSuccess: resolve };
            client.on('session_proposal', (sessionProposal) =>
                this.handleSessionProposal({ sessionProposal, address, ...handlers }),
            );
            client.pair({ uri }).catch((error: unknown) => reject(this.parseError(error)));
        });
    };

    attachListener = async <TEvent extends ISessionEvent>(params: IAttachClientListenerParams<TEvent>) => {
        const { event, callback } = params;
        const client = await this.getClient();
        client.on(event, callback);
    };

    private handleSessionProposal = async (params: IHandleSessionProposalParams) => {
        const { sessionProposal, address, onError, onSuccess } = params;

        try {
            const session = await this.approveSession({ sessionProposal, address });
            onSuccess(session.peer.metadata);
        } catch (error: unknown) {
            onError(this.parseError(error));
        }
    };

    private approveSession = async (params: IApproveSessionParams): Promise<ISession> => {
        const { address, sessionProposal } = params;
        const client = await this.getClient();

        const supportedNamespaces = this.getSupportedNamespaces(address);
        const namespaces = buildApprovedNamespaces({ proposal: sessionProposal.params, supportedNamespaces });
        const session = await client.approveSession({ id: sessionProposal.id, namespaces });

        return session;
    };

    private parseError = (error: unknown): Error =>
        error instanceof Error ? error : typeof error === 'string' ? new Error(error) : new Error('unknown error');

    private getSupportedNamespaces = (account: string) => {
        const supportedChainIds = Object.values(networkDefinitions).map((definition) => definition.chainId);

        const chainIdNamespaces = supportedChainIds.map((chainId) => `eip155:${chainId.toString()}`);
        const accountNamespaces = chainIdNamespaces.map((namespace) => `${namespace}:${account}`);

        return {
            eip155: {
                chains: chainIdNamespaces,
                methods: [
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
                ],
                events: ['chainChanged', 'accountsChanged', 'message', 'disconnect', 'connect'],
                accounts: accountNamespaces,
            },
        };
    };
}

export const walletConnectService = new WalletConnectService();
