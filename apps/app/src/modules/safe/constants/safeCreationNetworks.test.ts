import Safe from '@safe-global/protocol-kit';
import { encodeAbiParameters } from 'viem';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { safeDeploymentVersion } from '../utils/safeDeploymentUtils';
import { safeCreationNetworks } from './safeCreationNetworks';

describe('safeCreationNetworks constant', () => {
    // Answers the chain reads of protocol-kit, so only its own list of Safe deployments decides the result.
    const initSafe = (chainId: number) =>
        Safe.init({
            provider: {
                request: ({ method }: { method: string }) => {
                    if (method === 'eth_chainId') {
                        return Promise.resolve(`0x${chainId.toString(16)}`);
                    }

                    if (method === 'eth_call') {
                        return Promise.resolve(
                            encodeAbiParameters([{ type: 'bytes' }], ['0x00']),
                        );
                    }

                    return Promise.resolve('0x01');
                },
            },
            predictedSafe: {
                safeAccountConfig: {
                    owners: ['0x0000000000000000000000000000000000000011'],
                    threshold: 1,
                },
                safeDeploymentConfig: { safeVersion: safeDeploymentVersion },
            },
        });

    it.each(safeCreationNetworks)(
        'has the Safe contracts of the version the app deploys on %s',
        async (network) => {
            const protocolKit = await initSafe(networkDefinitions[network].id);

            await expect(protocolKit.getAddress()).resolves.toMatch(
                /^0x[0-9a-fA-F]{40}$/,
            );
        },
    );
});
