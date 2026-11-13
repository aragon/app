import { addressUtils } from '@aragon/gov-ui-kit';
import type Safe from '@safe-global/protocol-kit';
import { getAddress } from 'viem';
import { getConnection, getPublicClient } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';

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
 * One call the Safe makes.
 */
export interface ISafeTransactionCall {
    /**
     * Target of the call, in any casing.
     */
    to: string;
    /**
     * Native value sent with the call, in wei.
     */
    value: bigint | string;
    /**
     * Calldata of the call.
     */
    data: string;
}

export interface IBuildTransactionParams {
    /**
     * Protocol kit bound to the Safe; reading is enough.
     */
    protocolKit: SafeProtocolKit;
    /**
     * Calls the Safe makes, in order. More than one is batched into one delegate call to MultiSendCallOnly.
     */
    calls: ISafeTransactionCall[];
    /**
     * Nonce the transaction takes.
     */
    nonce: number;
    /**
     * Threshold of the Safe, the confirmations the transaction requires.
     */
    threshold: number;
    /**
     * Owner proposing the transaction, when it is already known.
     */
    proposer?: string;
}

export interface IBuildRejectionTransactionParams
    extends Pick<IBuildTransactionParams, 'protocolKit' | 'threshold'> {
    /**
     * Nonce to reject: the one of the queued transaction the rejection replaces.
     */
    nonce: number;
}

/**
 * Transaction as the protocol kit builds it.
 */
type SafeTransaction = Awaited<ReturnType<Safe['createTransaction']>>;

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

    /**
     * Builds an unsigned Safe transaction from calls at the given nonce, in the shape the Safe transaction service
     * returns, so it can be reviewed, hashed and proposed like a queued one.
     *
     * Every target is checksummed: a single call is the transaction itself, so its target reaches the service verbatim,
     * and the service refuses an address that is not checksummed (e.g. one imported from a JSON file) after the owner
     * has signed. Casing does not change the Safe transaction hash.
     */
    buildTransaction = async (
        params: IBuildTransactionParams,
    ): Promise<ISafeMultisigTransaction> => {
        const { protocolKit, calls, nonce, threshold, proposer } = params;

        // Several calls become one delegate call to MultiSendCallOnly, which cannot delegate any further.
        const safeTransaction = await protocolKit.createTransaction({
            transactions: calls.map(({ to, value, data }) => ({
                to: getAddress(to),
                value: value.toString(),
                data,
            })),
            onlyCalls: true,
            options: { nonce },
        });

        return this.toQueuedTransaction(
            protocolKit,
            safeTransaction,
            threshold,
            proposer,
        );
    };

    /**
     * Builds the unsigned rejection of a nonce, in the same shape as `buildTransaction`: an empty transaction from the
     * Safe to itself that uses up the nonce once executed, so nothing else queued on that nonce can execute. The
     * protocol kit builds it, so it is the transaction, hash included, that the Safe app creates for the same nonce.
     */
    buildRejectionTransaction = async (
        params: IBuildRejectionTransactionParams,
    ): Promise<ISafeMultisigTransaction> => {
        const { protocolKit, nonce, threshold } = params;

        const safeTransaction =
            await protocolKit.createRejectionTransaction(nonce);

        return this.toQueuedTransaction(
            protocolKit,
            safeTransaction,
            threshold,
        );
    };

    private toQueuedTransaction = async (
        protocolKit: SafeProtocolKit,
        safeTransaction: SafeTransaction,
        threshold: number,
        proposer?: string,
    ): Promise<ISafeMultisigTransaction> => {
        const safeTxHash =
            await protocolKit.getTransactionHash(safeTransaction);

        return {
            ...safeTransaction.data,
            operation: safeTransaction.data.operation === 1 ? 1 : 0,
            nonce: String(safeTransaction.data.nonce),
            safeTxHash,
            from: proposer ?? null,
            confirmations: [],
            confirmationsRequired: threshold,
            signatures: null,
            isExecuted: false,
            isSuccessful: null,
            submissionDate: new Date().toISOString(),
        };
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
