import { invariant } from '@aragon/gov-ui-kit';
import type { Eip1193Provider } from '@safe-global/protocol-kit';
import type { Hex, TransactionReceipt } from 'viem';
import { getPublicClient } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';

export interface IBuildSafeDeploymentParams {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Addresses of the Safe owners.
     */
    owners: string[];
    /**
     * Number of owner approvals a Safe transaction needs.
     */
    threshold: number;
    /**
     * Salt of the deployment. The same owners, threshold and salt always give the same address.
     */
    saltNonce: string;
}

export interface ISafeDeployment {
    /**
     * Address the Safe gets once the transaction is mined.
     */
    address: string;
    /**
     * Transaction deploying the Safe.
     */
    transaction: ITransactionRequest;
}

/**
 * Safe version the app deploys. Named here rather than taken from the protocol-kit default, so what users deploy
 * only changes by a decision.
 */
export const safeDeploymentVersion = '1.4.1';

class SafeDeploymentUtils {
    /**
     * Predicts the address of a new Safe and builds the transaction deploying it. Both come from the same Safe
     * configuration, so the address always belongs to the returned transaction.
     */
    buildDeployment = async (
        params: IBuildSafeDeploymentParams,
    ): Promise<ISafeDeployment> => {
        const { network, owners, threshold, saltNonce } = params;

        const client = getPublicClient(wagmiConfig, {
            chainId: networkDefinitions[network].id,
        });
        invariant(
            client != null,
            `SafeDeploymentUtils: no client for the network (network=${network}).`,
        );

        const { default: Safe } = await import('@safe-global/protocol-kit');
        const protocolKit = await Safe.init({
            provider: {
                request: client.request as Eip1193Provider['request'],
            },
            predictedSafe: {
                safeAccountConfig: { owners, threshold },
                safeDeploymentConfig: {
                    saltNonce,
                    safeVersion: safeDeploymentVersion,
                },
            },
            onchainAnalytics: { project: 'aragon-app' },
        });

        const address = await protocolKit.getAddress();
        const { to, data, value } =
            await protocolKit.createSafeDeploymentTransaction();

        return {
            address,
            transaction: {
                to: to as Hex,
                data: data as Hex,
                value: BigInt(value),
            },
        };
    };

    /**
     * Reads the address of the deployed Safe from the receipt of its deployment transaction.
     */
    getSafeAddress = async (receipt: TransactionReceipt): Promise<string> => {
        const { getSafeAddressFromDeploymentTx } = await import(
            '@safe-global/protocol-kit'
        );

        return getSafeAddressFromDeploymentTx(receipt, safeDeploymentVersion);
    };
}

export const safeDeploymentUtils = new SafeDeploymentUtils();
