import 'server-only';
import {
    type Address,
    BaseError,
    createPublicClient,
    type Hex,
    http,
    type PublicClient,
} from 'viem';
import { sepolia } from 'viem/chains';
import { MpcApiError } from './mpcApiError';

/**
 * Chain access of the POC co-signer. Only Sepolia (11155111) is operational: systems may declare more chains but
 * balance, simulation, preparation and broadcast are Sepolia only.
 */

export const MPC_SUPPORTED_CHAIN_ID = sepolia.id;
const DEFAULT_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

export interface IMpcFeeEstimate {
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
}

// Prefer the concise viem messages (e.g. "insufficient funds ...") over the full RPC dump.
const toChainError = (error: unknown): MpcApiError => {
    const message =
        error instanceof BaseError
            ? error.details.length > 0
                ? error.details
                : error.shortMessage
            : error instanceof Error
              ? error.message
              : 'Unknown RPC error.';

    return new MpcApiError('chain_error', message.slice(0, 500));
};

class MpcChain {
    private client: PublicClient | undefined;

    getRpcUrl = (): string => {
        const envUrl = process.env.MPC_POC_RPC_URL?.trim();

        return envUrl != null && envUrl.length > 0 ? envUrl : DEFAULT_RPC_URL;
    };

    getClient = (): PublicClient => {
        this.client ??= createPublicClient({
            chain: sepolia,
            transport: http(this.getRpcUrl(), { timeout: 15_000 }),
        });

        return this.client;
    };

    assertSupportedChain = (chainId: number): void => {
        if (chainId !== MPC_SUPPORTED_CHAIN_ID) {
            throw new MpcApiError(
                'chain_error',
                `Only Sepolia (${MPC_SUPPORTED_CHAIN_ID.toString()}) is supported in the POC.`,
                400,
            );
        }
    };

    getBalance = async (address: Address): Promise<bigint> => {
        try {
            return await this.getClient().getBalance({ address });
        } catch (error) {
            throw toChainError(error);
        }
    };

    getTransactionCount = async (address: Address): Promise<number> => {
        try {
            return await this.getClient().getTransactionCount({
                address,
                blockTag: 'pending',
            });
        } catch (error) {
            throw toChainError(error);
        }
    };

    estimateGas = async (params: {
        from: Address;
        to: Address;
        value: bigint;
        data?: Hex;
    }): Promise<bigint> => {
        try {
            return await this.getClient().estimateGas({
                account: params.from,
                to: params.to,
                value: params.value,
                data: params.data,
            });
        } catch (error) {
            throw toChainError(error);
        }
    };

    estimateFeesPerGas = async (): Promise<IMpcFeeEstimate> => {
        try {
            const fees = await this.getClient().estimateFeesPerGas();

            return {
                maxFeePerGas: fees.maxFeePerGas,
                maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
            };
        } catch (error) {
            throw toChainError(error);
        }
    };

    sendRawTransaction = async (serializedTransaction: Hex): Promise<Hex> => {
        try {
            return await this.getClient().sendRawTransaction({
                serializedTransaction,
            });
        } catch (error) {
            throw toChainError(error);
        }
    };

    /**
     * Simulates a transaction (eth_estimateGas, which reverts like eth_call). Returns ok=false with the error message
     * instead of throwing when the simulation fails.
     */
    simulate = async (params: {
        from: Address;
        to: Address;
        value: bigint;
        data?: Hex;
    }): Promise<{ ok: boolean; gas?: string; error?: string }> => {
        try {
            const gas = await this.estimateGas(params);

            return { ok: true, gas: gas.toString() };
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Simulation failed.';

            return { ok: false, error: message.slice(0, 500) };
        }
    };
}

export const mpcChain = new MpcChain();
