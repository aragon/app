import { mainnet } from 'viem/chains';
import { getEnsAddress, getEnsName } from 'wagmi/actions';
import { logEnsError } from '@/modules/ens/utils/logEnsError';
import { createAddressResolver } from './resolveAddress';

jest.mock('wagmi/actions', () => ({
    getEnsName: jest.fn(),
    getEnsAddress: jest.fn(),
}));
jest.mock('@/modules/ens/utils/logEnsError', () => ({
    logEnsError: jest.fn(),
}));

describe('createAddressResolver', () => {
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const other = '0x1111111111111111111111111111111111111111';
    const config = {} as Parameters<typeof createAddressResolver>[0];
    const resolve = createAddressResolver(config);
    const getEnsNameMock = jest.mocked(getEnsName);
    const getEnsAddressMock = jest.mocked(getEnsAddress);

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('returns the reverse name when its forward record points back to the address (inv. 31)', async () => {
        getEnsNameMock.mockResolvedValue('vitalik.eth');
        getEnsAddressMock.mockResolvedValue(address);

        await expect(resolve(address.toLowerCase())).resolves.toEqual({
            label: 'vitalik.eth',
            source: 'ens',
        });
        expect(getEnsNameMock).toHaveBeenCalledWith(config, {
            address,
            chainId: mainnet.id,
        });
        expect(getEnsAddressMock).toHaveBeenCalledWith(config, {
            name: 'vitalik.eth',
            chainId: mainnet.id,
        });
    });

    it('does not use a reverse name without a matching forward record (inv. 31)', async () => {
        getEnsNameMock.mockResolvedValue('vitalik.eth');

        getEnsAddressMock.mockResolvedValue(other);
        await expect(resolve(address)).resolves.toBeNull();

        getEnsAddressMock.mockResolvedValue(null);
        await expect(resolve(address)).resolves.toBeNull();
    });

    it('does not use a name that is not in normalized form', async () => {
        getEnsAddressMock.mockResolvedValue(address);

        for (const name of ['Vitalik.eth', 'vitalik​.eth', 'a..eth']) {
            getEnsNameMock.mockResolvedValue(name);
            await expect(resolve(address)).resolves.toBeNull();
        }
        expect(getEnsAddressMock).not.toHaveBeenCalled();
    });

    it('returns null without a forward lookup when there is no name', async () => {
        getEnsNameMock.mockResolvedValue(null);

        await expect(resolve(address)).resolves.toBeNull();
        expect(getEnsAddressMock).not.toHaveBeenCalled();
    });

    it('returns null and reports an RPC failure', async () => {
        const error = new Error('rpc down');
        getEnsNameMock.mockRejectedValue(error);

        await expect(resolve(address)).resolves.toBeNull();
        expect(logEnsError).toHaveBeenCalledWith(
            error,
            expect.objectContaining({ hook: 'resolveAddress', address }),
        );
    });

    it('logs a failing RPC once for a whole page, and again after the window', async () => {
        jest.useFakeTimers();
        const failing = createAddressResolver(config);
        getEnsNameMock.mockRejectedValue(new Error('rpc down'));
        const addresses = Array.from(
            { length: 300 },
            (_, i) => `0x${(i + 1).toString(16).padStart(40, '0')}`,
        );

        await Promise.all(addresses.map(failing));
        expect(logEnsError).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(30_000);
        await failing(address);
        expect(logEnsError).toHaveBeenCalledTimes(2);
        jest.useRealTimers();
    });

    it('asks mainnet only, for a page of 300 addresses: one reverse lookup each, a forward one only for named ones', async () => {
        const addresses = Array.from(
            { length: 300 },
            (_, i) => `0x${(i + 1).toString(16).padStart(40, '0')}`,
        );
        getEnsNameMock.mockImplementation(async (_config, { address: a }) =>
            Number.parseInt(a.slice(2), 16) % 10 === 0 ? 'x.eth' : null,
        );
        getEnsAddressMock.mockImplementation(async () => null);

        await Promise.all(addresses.map(resolve));

        expect(getEnsNameMock).toHaveBeenCalledTimes(300);
        expect(getEnsAddressMock).toHaveBeenCalledTimes(30);
        for (const [, params] of [
            ...getEnsNameMock.mock.calls,
            ...getEnsAddressMock.mock.calls,
        ]) {
            expect(params.chainId).toBe(mainnet.id);
        }
    });
});
