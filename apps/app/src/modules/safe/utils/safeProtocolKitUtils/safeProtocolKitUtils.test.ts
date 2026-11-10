import * as WagmiActions from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import {
    SafeProtocolKitError,
    safeProtocolKitUtils,
} from './safeProtocolKitUtils';

// Named ESM exports of these modules cannot be spied on, so they are the only module mocks of this suite.
jest.mock('wagmi/actions', () => ({
    ...jest.requireActual('wagmi/actions'),
    getConnection: jest.fn(),
    getPublicClient: jest.fn(),
}));

jest.mock('@safe-global/protocol-kit', () => ({
    __esModule: true,
    default: { init: jest.fn() },
}));

describe('safeProtocolKit utils', () => {
    const owner = '0x0000000000000000000000000000000000000011';
    const safeAddress = '0x0000000000000000000000000000000000000001';
    const chainId = 11_155_111;

    const getConnectionMock = jest.mocked(WagmiActions.getConnection);
    const getPublicClientMock = jest.mocked(WagmiActions.getPublicClient);
    const protocolKitModule = jest.requireMock('@safe-global/protocol-kit') as {
        default: { init: jest.Mock };
    };

    const mockConnection = (
        connection?: Partial<{
            status: string;
            address: string;
            chainId: number;
            provider: unknown;
        }>,
    ) => {
        const {
            status = 'connected',
            address = owner,
            chainId: connectedChainId = chainId,
            provider = { request: jest.fn() },
        } = connection ?? {};

        getConnectionMock.mockReturnValue({
            status,
            address,
            chainId: connectedChainId,
            connector: { getProvider: jest.fn().mockResolvedValue(provider) },
        } as never);
    };

    beforeEach(() => {
        protocolKitModule.default.init.mockResolvedValue('protocol-kit');
    });

    afterEach(() => {
        getConnectionMock.mockReset();
        getPublicClientMock.mockReset();
        protocolKitModule.default.init.mockReset();
    });

    describe('getOwnerConnection', () => {
        it('returns the connection of the owner on the chain', () => {
            mockConnection({
                address: owner.toUpperCase().replace('0X', '0x'),
            });

            expect(
                safeProtocolKitUtils.getOwnerConnection(owner, chainId),
            ).toBeDefined();
        });

        it.each([
            { label: 'another account', connection: { address: safeAddress } },
            { label: 'another chain', connection: { chainId: 1 } },
            { label: 'no connection', connection: { status: 'disconnected' } },
        ])('returns undefined for $label', ({ connection }) => {
            mockConnection(connection);

            expect(
                safeProtocolKitUtils.getOwnerConnection(owner, chainId),
            ).toBeUndefined();
        });
    });

    describe('initForOwner', () => {
        it('builds the protocol kit signing as the owner through the wallet provider', async () => {
            const request = jest.fn().mockResolvedValue('0x1');
            mockConnection({ provider: { request } });

            const protocolKit = await safeProtocolKitUtils.initForOwner({
                owner,
                chainId,
                safeAddress,
            });

            expect(protocolKit).toEqual('protocol-kit');
            const [config] = protocolKitModule.default.init.mock.calls[0] as [
                {
                    signer: string;
                    safeAddress: string;
                    provider: { request: (args: unknown) => Promise<unknown> };
                },
            ];
            expect(config).toEqual(
                expect.objectContaining({ signer: owner, safeAddress }),
            );
            await config.provider.request({ method: 'eth_chainId' });
            expect(request).toHaveBeenCalledWith({ method: 'eth_chainId' });
        });

        it('refuses a wallet that is not the owner on the chain', async () => {
            mockConnection({ chainId: 1 });

            await expect(
                safeProtocolKitUtils.initForOwner({
                    owner,
                    chainId,
                    safeAddress,
                }),
            ).rejects.toEqual(new SafeProtocolKitError('walletRequired'));
            expect(protocolKitModule.default.init).not.toHaveBeenCalled();
        });

        it('refuses a wallet provider it cannot send requests through', async () => {
            mockConnection({ provider: {} });

            await expect(
                safeProtocolKitUtils.initForOwner({
                    owner,
                    chainId,
                    safeAddress,
                }),
            ).rejects.toHaveProperty('reason', 'providerUnavailable');
        });
    });

    describe('initReadOnly', () => {
        it('builds a protocol kit without a signer through the app client of the chain', async () => {
            getPublicClientMock.mockReturnValue({
                request: jest.fn(),
            } as never);

            await safeProtocolKitUtils.initReadOnly({ chainId, safeAddress });

            expect(getPublicClientMock).toHaveBeenCalledWith(wagmiConfig, {
                chainId,
            });
            expect(protocolKitModule.default.init).toHaveBeenCalledWith(
                expect.objectContaining({ signer: undefined, safeAddress }),
            );
        });

        it('refuses a chain the app has no client for', async () => {
            getPublicClientMock.mockReturnValue(undefined as never);

            await expect(
                safeProtocolKitUtils.initReadOnly({ chainId, safeAddress }),
            ).rejects.toHaveProperty('reason', 'providerUnavailable');
        });
    });
});
