import { encodeFunctionData } from 'viem';
import { namehash, normalize } from 'viem/ens';
import * as wagmiActions from 'wagmi/actions';
import { ensChainId } from '../constants/ensConfig';
import { ensPublicResolverAbi } from './ensPublicResolverAbi';
import { ensTransactionUtils } from './ensTransactionUtils';

const MOCK_RESOLVER = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63' as const;
const ENS_NAME = 'vitalik.eth';

const node = namehash(normalize(ENS_NAME)) as `0x${string}`;

describe('EnsTransactionUtils', () => {
    describe('buildUpdateRecordsTransaction', () => {
        const getEnsResolverSpy = jest.spyOn(wagmiActions, 'getEnsResolver');

        beforeEach(() => {
            getEnsResolverSpy.mockResolvedValue(MOCK_RESOLVER);
        });

        afterEach(() => {
            getEnsResolverSpy.mockReset();
        });

        it('returns a setText transaction for a single update', async () => {
            const result =
                await ensTransactionUtils.buildUpdateRecordsTransaction({
                    ensName: ENS_NAME,
                    updates: { description: 'Hello world' },
                });

            const expectedData = encodeFunctionData({
                abi: ensPublicResolverAbi,
                functionName: 'setText',
                args: [node, 'description', 'Hello world'],
            });

            expect(result).toEqual({
                to: MOCK_RESOLVER,
                data: expectedData,
                value: BigInt(0),
            });
        });

        it('returns a multicall transaction for multiple updates', async () => {
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
                    abi: ensPublicResolverAbi,
                    functionName: 'setText',
                    args: [node, 'description', 'Hello'],
                }),
                encodeFunctionData({
                    abi: ensPublicResolverAbi,
                    functionName: 'setText',
                    args: [node, 'com.twitter', '@vitalik'],
                }),
            ];
            const expectedData = encodeFunctionData({
                abi: ensPublicResolverAbi,
                functionName: 'multicall',
                args: [setTextCalls],
            });

            expect(result).toEqual({
                to: MOCK_RESOLVER,
                data: expectedData,
                value: BigInt(0),
            });
        });

        it('always resolves the ENS resolver on mainnet', async () => {
            await ensTransactionUtils.buildUpdateRecordsTransaction({
                ensName: ENS_NAME,
                updates: { description: 'test' },
            });

            expect(getEnsResolverSpy.mock.calls[0][1]).toMatchObject({
                chainId: ensChainId,
            });
        });

        it('passes an empty string value when clearing a record', async () => {
            const result =
                await ensTransactionUtils.buildUpdateRecordsTransaction({
                    ensName: ENS_NAME,
                    updates: { 'com.twitter': '' },
                });

            const expectedData = encodeFunctionData({
                abi: ensPublicResolverAbi,
                functionName: 'setText',
                args: [node, 'com.twitter', ''],
            });

            expect(result.data).toBe(expectedData);
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
