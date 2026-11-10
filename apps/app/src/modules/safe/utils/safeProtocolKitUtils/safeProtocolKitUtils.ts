import { addressUtils } from '@aragon/gov-ui-kit';
import type Safe from '@safe-global/protocol-kit';
import { getConnection, getPublicClient } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';

/**
 * Protocol kit bound to one Safe.
 */
export type SafeProtocolKit = Safe;

/**
 * Why no protocol kit could be built for an owner: the wallet is not that owner on the chain, or its provider cannot
 * be used. The values double as translation keys of the dialogs that report them.
 */
export type SafeProtocolKitErrorReason =
    | 'walletRequired'
    | 'providerUnavailable';

export class SafeProtocolKitError extends Error {
    /**
     * Why the protocol kit could not be built.
     */
    readonly reason: SafeProtocolKitErrorReason;

    constructor(reason: SafeProtocolKitErrorReason) {
        super(reason);

        this.reason = reason;
    }
}

export interface IInitForOwnerParams {
    /**
     * Owner the protocol kit signs as.
     */
    owner: string;
    /**
     * Chain the Safe is deployed on.
     */
    chainId: number;
    /**
     * Address of the Safe.
     */
    safeAddress: string;
}

export interface IInitReadOnlyParams {
    /**
     * Chain the Safe is deployed on.
     */
    chainId: number;
    /**
     * Address of the Safe.
     */
    safeAddress: string;
}

/**
 * Minimal EIP-1193 provider, the only shape the protocol kit needs.
 */
interface IRequestProvider {
    request: (args: never) => Promise<unknown>;
}

const isRequestProvider = (provider: unknown): provider is IRequestProvider =>
    provider != null &&
    typeof provider === 'object' &&
    'request' in provider &&
    typeof provider.request === 'function';

class SafeProtocolKitUtils {
    /**
     * Returns the wallet connection when it is the given owner on the given chain, undefined otherwise.
     */
    getOwnerConnection = (owner: string, chainId: number) => {
        const connection = getConnection(wagmiConfig);

        return connection.status === 'connected' &&
            addressUtils.isAddressEqual(connection.address, owner) &&
            connection.chainId === chainId
            ? connection
            : undefined;
    };

    /**
     * Builds a protocol kit that signs as the given owner, through the provider of the connected wallet.
     * @throws {SafeProtocolKitError} When the wallet is not the owner on the chain, or its provider cannot be used.
     */
    initForOwner = async (
        params: IInitForOwnerParams,
    ): Promise<SafeProtocolKit> => {
        const { owner, chainId, safeAddress } = params;

        const connection = this.getOwnerConnection(owner, chainId);

        if (typeof connection?.connector.getProvider !== 'function') {
            throw new SafeProtocolKitError('walletRequired');
        }

        const provider = await connection.connector.getProvider({ chainId });

        if (!isRequestProvider(provider)) {
            throw new SafeProtocolKitError('providerUnavailable');
        }

        return this.init(provider, safeAddress, owner);
    };

    /**
     * Builds a protocol kit that only reads, through the app's RPC: it needs no wallet, so a transaction can be built
     * and reviewed before an owner connects.
     * @throws {SafeProtocolKitError} When the app has no client for the chain.
     */
    initReadOnly = (params: IInitReadOnlyParams): Promise<SafeProtocolKit> => {
        const { chainId, safeAddress } = params;

        const client = getPublicClient(wagmiConfig, { chainId });

        if (client == null) {
            return Promise.reject(
                new SafeProtocolKitError('providerUnavailable'),
            );
        }

        return this.init(client, safeAddress);
    };

    private init = async (
        provider: IRequestProvider,
        safeAddress: string,
        signer?: string,
    ): Promise<SafeProtocolKit> => {
        const { default: Safe } = await import('@safe-global/protocol-kit');
        const { request } = provider;

        return Safe.init({
            provider: {
                request: async (args) =>
                    await request.call(provider, args as never),
            },
            signer,
            safeAddress,
        });
    };
}

export const safeProtocolKitUtils = new SafeProtocolKitUtils();
