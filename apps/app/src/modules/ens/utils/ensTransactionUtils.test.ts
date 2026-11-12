import { encodeFunctionData, toHex, zeroAddress } from 'viem';
import { namehash, normalize, packetToBytes } from 'viem/ens';
import * as wagmiActions from 'wagmi/actions';
import { ensRegistryAddress } from '../constants/contracts';
import { ensChainId } from '../constants/ensConfig';
import {
    ensPermissionedResolverAbi,
    ensPublicResolverAbi,
} from './ensResolverAbi';
import { ensTransactionUtils } from './ensTransactionUtils';

const V1_RESOLVER = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63' as const;
const V2_RESOLVER = '0xF4f1007EA430848F2fAd60e405A54Fc100fEc341' as const;
const MIRROR_RESOLVER = '0x394D8EB4a4fDF599384DeAb25F31d111d755c398' as const;
const ENS_NAME = 'vitalik.eth';

const node = namehash(normalize(ENS_NAME));
const dnsName = toHex(packetToBytes(normalize(ENS_NAME)));

describe('EnsTransactionUtils', () => {
    const readContractSpy = jest.spyOn(wagmiActions, 'readContract');
    const getEnsResolverSpy = jest.spyOn(wagmiActions, 'getEnsResolver');

    // Registry `resolver` first, then `supportsInterface` on the Universal
    // Resolver result.
    const mockResolvers = (params: {
        v1: `0x${string}`;
        universal?: `0x${string}`;
        isV2?: boolean;
    }) => {
        readContractSpy.mockResolvedValueOnce(params.v1);
        getEnsResolverSpy.mockResolvedValue(params.universal ?? zeroAddress);
        readContractSpy.mockResolvedValueOnce(params.isV2 ?? false);
    };

    afterEach(() => {
        readContractSpy.mockReset();
        getEnsResolverSpy.mockReset();
    });

    describe('getWritableResolver', () => {
        it('returns the ENSv1 registry resolver and skips the Universal Resolver', async () => {
            mockResolvers({ v1: V1_RESOLVER });

            await expect(
                ensTransactionUtils.getWritableResolver(ENS_NAME),
            ).resolves.toEqual({ address: V1_RESOLVER, isV2: false });
            expect(readContractSpy.mock.calls[0][1]).toMatchObject({
                address: ensRegistryAddress,
                functionName: 'resolver',
                args: [node],
                chainId: ensChainId,
            });
            expect(getEnsResolverSpy).not.toHaveBeenCalled();
        });

        it('returns the ENSv2 resolver of a migrated name', async () => {
            mockResolvers({
                v1: zeroAddress,
                universal: V2_RESOLVER,
                isV2: true,
            });

            await expect(
                ensTransactionUtils.getWritableResolver(ENS_NAME),
            ).resolves.toEqual({ address: V2_RESOLVER, isV2: true });
            expect(readContractSpy.mock.calls[1][1]).toMatchObject({
                address: V2_RESOLVER,
                functionName: 'supportsInterface',
                args: ['0xc7279f88'],
            });
        });

        it('returns null when the Universal Resolver only finds the read-only mirror', async () => {
            mockResolvers({
                v1: zeroAddress,
                universal: MIRROR_RESOLVER,
                isV2: false,
            });

            await expect(
                ensTransactionUtils.getWritableResolver(ENS_NAME),
            ).resolves.toBeNull();
        });

        it('returns null when the name has no resolver', async () => {
            mockResolvers({ v1: zeroAddress });

            await expect(
                ensTransactionUtils.getWritableResolver(ENS_NAME),
            ).resolves.toBeNull();
            expect(readContractSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('buildUpdateRecordsTransaction', () => {
        it('returns a namehash setText transaction for an ENSv1 name', async () => {
            mockResolvers({ v1: V1_RESOLVER });

            const result =
                await ensTransactionUtils.buildUpdateRecordsTransaction({
                    ensName: ENS_NAME,
                    updates: { description: 'Hello world' },
                });

            expect(result).toEqual({
                to: V1_RESOLVER,
                data: encodeFunctionData({
                    abi: ensPublicResolverAbi,
                    functionName: 'setText',
                    args: [node, 'description', 'Hello world'],
                }),
                value: BigInt(0),
            });
        });

        it('returns a DNS-encoded name setText transaction for an ENSv2 name', async () => {
            mockResolvers({
                v1: zeroAddress,
                universal: V2_RESOLVER,
                isV2: true,
            });

            const result =
                await ensTransactionUtils.buildUpdateRecordsTransaction({
                    ensName: ENS_NAME,
                    updates: { 'com.twitter': '' },
                });

            expect(result).toEqual({
                to: V2_RESOLVER,
                data: encodeFunctionData({
                    abi: ensPermissionedResolverAbi,
                    functionName: 'setText',
                    args: [dnsName, 'com.twitter', ''],
                }),
                value: BigInt(0),
            });
        });

        it('wraps multiple updates in the resolver multicall', async () => {
            mockResolvers({
                v1: zeroAddress,
                universal: V2_RESOLVER,
                isV2: true,
            });

            const result =
                await ensTransactionUtils.buildUpdateRecordsTransaction({
                    ensName: ENS_NAME,
                    updates: {
                        description: 'Hello',
                        'com.twitter': '@vitalik',
                    },
                });

            const setTextCalls = [
                encodeFunctionData({
                    abi: ensPermissionedResolverAbi,
                    functionName: 'setText',
                    args: [dnsName, 'description', 'Hello'],
                }),
                encodeFunctionData({
                    abi: ensPermissionedResolverAbi,
                    functionName: 'setText',
                    args: [dnsName, 'com.twitter', '@vitalik'],
                }),
            ];

            expect(result.data).toBe(
                encodeFunctionData({
                    abi: ensPublicResolverAbi,
                    functionName: 'multicall',
                    args: [setTextCalls],
                }),
            );
        });

        it('throws instead of building a transaction when the name has no writable resolver', async () => {
            mockResolvers({
                v1: zeroAddress,
                universal: MIRROR_RESOLVER,
                isV2: false,
            });

            await expect(
                ensTransactionUtils.buildUpdateRecordsTransaction({
                    ensName: ENS_NAME,
                    updates: { description: 'test' },
                }),
            ).rejects.toThrow(/has no writable resolver/);
        });

        it('throws when the ENS name is invalid', async () => {
            await expect(
                ensTransactionUtils.buildUpdateRecordsTransaction({
                    ensName: 'not_a_valid_ens!',
                    updates: { description: 'test' },
                }),
            ).rejects.toThrow();
        });
    });
});
