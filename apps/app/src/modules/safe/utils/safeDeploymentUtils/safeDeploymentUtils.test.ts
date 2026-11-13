import type { TransactionReceipt } from 'viem';
import * as WagmiActions from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { safeDeploymentUtils } from './safeDeploymentUtils';

jest.mock('wagmi/actions', () => ({ getPublicClient: jest.fn() }));

jest.mock('@safe-global/protocol-kit', () => ({
    ...jest.requireActual('@safe-global/protocol-kit'),
    __esModule: true,
    default: { init: jest.fn() },
}));

describe('safeDeployment utils', () => {
    const getPublicClientMock = WagmiActions.getPublicClient as jest.Mock;
    const safeInitMock = jest.requireMock<{ default: { init: jest.Mock } }>(
        '@safe-global/protocol-kit',
    ).default.init;

    afterEach(() => {
        getPublicClientMock.mockReset();
        safeInitMock.mockReset();
    });

    describe('buildDeployment', () => {
        const owners = [
            '0x0000000000000000000000000000000000000011',
            '0x0000000000000000000000000000000000000012',
        ];
        const predictedAddress = '0x0000000000000000000000000000000000000001';
        const proxyFactory = '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67';
        const params = {
            network: Network.ETHEREUM_SEPOLIA,
            owners,
            threshold: 2,
            saltNonce: '1731500000000',
        };

        const mockProtocolKit = () => {
            const request = jest.fn();
            getPublicClientMock.mockReturnValue({ request });
            safeInitMock.mockResolvedValue({
                getAddress: jest.fn().mockResolvedValue(predictedAddress),
                createSafeDeploymentTransaction: jest.fn().mockResolvedValue({
                    to: proxyFactory,
                    value: '0',
                    data: '0x1688f0b9',
                }),
            });

            return { request };
        };

        it('builds the Safe from the owners, threshold and salt on the chosen network', async () => {
            const { request } = mockProtocolKit();

            await safeDeploymentUtils.buildDeployment(params);

            expect(getPublicClientMock).toHaveBeenCalledWith(wagmiConfig, {
                chainId: networkDefinitions[Network.ETHEREUM_SEPOLIA].id,
            });
            expect(safeInitMock).toHaveBeenCalledWith({
                provider: { request },
                predictedSafe: {
                    safeAccountConfig: { owners, threshold: 2 },
                    safeDeploymentConfig: {
                        saltNonce: '1731500000000',
                        safeVersion: '1.4.1',
                    },
                },
                onchainAnalytics: { project: 'aragon-app' },
            });
        });

        it('returns the predicted address with the transaction that deploys it', async () => {
            mockProtocolKit();

            const deployment =
                await safeDeploymentUtils.buildDeployment(params);

            expect(deployment).toEqual({
                address: predictedAddress,
                transaction: {
                    to: proxyFactory,
                    data: '0x1688f0b9',
                    value: BigInt(0),
                },
            });
        });

        it('fails when the app has no client for the network', async () => {
            getPublicClientMock.mockReturnValue(undefined);

            await expect(
                safeDeploymentUtils.buildDeployment(params),
            ).rejects.toThrow(/no client for the network/);
            expect(safeInitMock).not.toHaveBeenCalled();
        });

        it('fails when Safe has no contracts on the network', async () => {
            mockProtocolKit();
            safeInitMock.mockRejectedValue(
                new Error('Invalid SafeProxyFactory contract address'),
            );

            await expect(
                safeDeploymentUtils.buildDeployment(params),
            ).rejects.toThrow('Invalid SafeProxyFactory contract address');
        });
    });

    describe('getSafeAddress', () => {
        // ProxyCreation log of a Safe 1.4.1 deployed on Ethereum Sepolia.
        const proxyCreationLog = {
            address: '0x4e1dcf7ad4e460cfd30791ccc4f9c8a4f820ec67',
            topics: [
                '0x4f51faf6c4561ff95f067657e43439f0f856d97c04d9ec9070a6199ad418e235',
                '0x0000000000000000000000003c66f458e159c671e908e51fabf869556c488a82',
            ],
            data: '0x00000000000000000000000041675c099f32341bf84bfc5382af534df5c7461a',
            blockNumber: BigInt(12_128_026),
            transactionHash:
                '0x64863060f25e929afde65bbcda606ccce5c3c088c3d9ec397022cf7305622fe5',
            transactionIndex: 33,
            blockHash:
                '0x7fd6a64e8620f509f1c154708ed84043543c0a8be9bdd400f4240d175dffe320',
            logIndex: 36,
            removed: false,
        };

        const buildReceipt = (logs: unknown[]) =>
            ({ logs }) as unknown as TransactionReceipt;

        it('reads the address of the deployed Safe from the receipt', async () => {
            const receipt = buildReceipt([proxyCreationLog]);

            await expect(
                safeDeploymentUtils.getSafeAddress(receipt),
            ).resolves.toBe('0x3c66f458e159c671e908E51fABf869556c488a82');
        });

        it('fails when the receipt has no Safe deployment', async () => {
            const receipt = buildReceipt([]);

            await expect(
                safeDeploymentUtils.getSafeAddress(receipt),
            ).rejects.toThrow();
        });
    });
});
