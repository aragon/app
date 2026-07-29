import * as wagmiActions from 'wagmi/actions';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { fetchTokensTotalSupply } from './fetchTokensTotalSupply';

describe('fetchTokensTotalSupply', () => {
    const readContractsSpy = jest.spyOn(wagmiActions, 'readContracts');

    afterEach(() => {
        readContractsSpy.mockReset();
    });

    afterAll(() => {
        readContractsSpy.mockRestore();
    });

    it('returns an empty map without firing an RPC call when no addresses are provided', async () => {
        const result = await fetchTokensTotalSupply(
            Network.ETHEREUM_MAINNET,
            [],
        );

        expect(result).toEqual({});
        expect(readContractsSpy).not.toHaveBeenCalled();
    });

    it('returns a lowercased-address-keyed map of stringified totalSupplies on the client', async () => {
        const supplies = [BigInt(1000), BigInt(2000)] as unknown as Awaited<
            ReturnType<typeof wagmiActions.readContracts>
        >;
        readContractsSpy.mockResolvedValue(supplies);

        const result = await fetchTokensTotalSupply(Network.ETHEREUM_MAINNET, [
            '0xAaaA',
            '0xBbBB',
        ]);

        expect(result).toEqual({ '0xaaaa': '1000', '0xbbbb': '2000' });
        expect(readContractsSpy).toHaveBeenCalledTimes(1);
        const callArgs = readContractsSpy.mock.calls[0][1] as unknown as {
            allowFailure: boolean;
            contracts: ReadonlyArray<{ chainId: number; functionName: string }>;
        };
        expect(callArgs.allowFailure).toBe(false);
        expect(callArgs.contracts).toHaveLength(2);
        expect(callArgs.contracts[0]).toMatchObject({
            chainId: networkDefinitions[Network.ETHEREUM_MAINNET].id,
            functionName: 'totalSupply',
        });
    });

    it('propagates RPC failures so callers surface Page.Error', async () => {
        readContractsSpy.mockRejectedValue(new Error('rpc unreachable'));

        await expect(
            fetchTokensTotalSupply(Network.ETHEREUM_MAINNET, ['0xAaaA']),
        ).rejects.toThrow('rpc unreachable');
    });
});
