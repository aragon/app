import { renderHook } from '@testing-library/react';
import { zeroAddress } from 'viem';
import * as wagmi from 'wagmi';
import { VoteOption } from '@/plugins/tokenPlugin/types';
import { Network } from '@/shared/api/daoService';
import { AlchemixOverrideErrReason } from '../../types';
import { useAlchemixOverrideStatus } from './useAlchemixOverrideStatus';

describe('useAlchemixOverrideStatus', () => {
    const useReadContractsSpy = jest.spyOn(wagmi, 'useReadContracts');

    afterEach(() => {
        useReadContractsSpy.mockReset();
    });

    const userAddress = '0x1111111111111111111111111111111111111111';
    const delegatee = '0x2222222222222222222222222222222222222222';

    const defaultParams = {
        proposalIndex: '1',
        pluginAddress: '0x3333333333333333333333333333333333333333',
        network: Network.ETHEREUM_SEPOLIA,
        userAddress,
    };

    const buildVoteRecord = (
        record?: Partial<{
            voteOption: number;
            votingPower: bigint;
            reduction: bigint;
            hasOverridden: boolean;
            votedWithDelegatedVp: boolean;
        }>,
    ) => ({
        voteOption: 0,
        votingPower: BigInt(0),
        reduction: BigInt(0),
        hasOverridden: false,
        votedWithDelegatedVp: false,
        ...record,
    });

    const buildAccountSnapshot = (
        snapshot?: Partial<{
            delegatee: string;
            isOverride: boolean;
            votingPower: bigint;
            delegatedVp: bigint;
            reduction: bigint;
            effectiveVp: bigint;
        }>,
    ) => ({
        delegatee,
        isOverride: true,
        votingPower: BigInt(100),
        delegatedVp: BigInt(100),
        reduction: BigInt(0),
        effectiveVp: BigInt(100),
        ...snapshot,
    });

    const mockContractReads = (values?: {
        accountSnapshot?: ReturnType<typeof buildAccountSnapshot>;
        userVoteRecord?: ReturnType<typeof buildVoteRecord>;
        canOverride?: [boolean, number];
        canVote?: boolean;
        delegateeVoteRecord?: ReturnType<typeof buildVoteRecord>;
    }) => {
        const userDataRefetch = jest.fn();
        const delegateeDataRefetch = jest.fn();

        useReadContractsSpy.mockImplementation((args) => {
            const contracts = args?.contracts as
                | { functionName: string }[]
                | undefined;
            const isUserBatch =
                contracts?.[0]?.functionName === 'getAccountSnapshot';

            const data = isUserBatch
                ? [
                      { result: values?.accountSnapshot, status: 'success' },
                      { result: values?.userVoteRecord, status: 'success' },
                      { result: values?.canOverride, status: 'success' },
                      { result: values?.canVote, status: 'success' },
                  ]
                : [
                      {
                          result: values?.delegateeVoteRecord,
                          status: 'success',
                      },
                  ];

            return {
                data,
                isLoading: false,
                isError: false,
                refetch: isUserBatch ? userDataRefetch : delegateeDataRefetch,
            } as unknown as wagmi.UseReadContractsReturnType;
        });

        return { userDataRefetch, delegateeDataRefetch };
    };

    it('returns the eligible status with the parsed user and delegatee vote records', () => {
        mockContractReads({
            accountSnapshot: buildAccountSnapshot({
                delegatedVp: BigInt(500),
            }),
            userVoteRecord: buildVoteRecord({ hasOverridden: false }),
            canOverride: [true, AlchemixOverrideErrReason.NONE],
            canVote: false,
            delegateeVoteRecord: buildVoteRecord({
                voteOption: VoteOption.YES,
                votingPower: BigInt(1500),
            }),
        });

        const { result } = renderHook(() =>
            useAlchemixOverrideStatus(defaultParams),
        );

        expect(result.current.isEligible).toBe(true);
        expect(result.current.delegatee).toEqual(delegatee);
        expect(result.current.delegatedVotingPower).toEqual(BigInt(500));
        expect(result.current.canOverride).toBe(true);
        expect(result.current.canVote).toBe(false);
        expect(result.current.delegateeVoteRecord?.voteOption).toEqual(
            VoteOption.YES,
        );
        expect(result.current.delegateeVoteRecord?.votingPower).toEqual(
            BigInt(1500),
        );
    });

    it('parses the none vote option as undefined', () => {
        mockContractReads({
            accountSnapshot: buildAccountSnapshot(),
            userVoteRecord: buildVoteRecord({ voteOption: 0 }),
            delegateeVoteRecord: buildVoteRecord({ voteOption: 0 }),
        });

        const { result } = renderHook(() =>
            useAlchemixOverrideStatus(defaultParams),
        );

        expect(result.current.userVoteRecord?.voteOption).toBeUndefined();
        expect(result.current.delegateeVoteRecord?.voteOption).toBeUndefined();
    });

    it.each([
        {
            label: 'the delegatee is the zero address',
            snapshot: { delegatee: zeroAddress },
        },
        {
            label: 'the user delegates to themselves',
            snapshot: { delegatee: userAddress },
        },
        {
            label: 'the user has no delegated voting power',
            snapshot: { delegatedVp: BigInt(0) },
        },
    ])('marks the user as not eligible when $label', ({ snapshot }) => {
        mockContractReads({
            accountSnapshot: buildAccountSnapshot(snapshot),
        });

        const { result } = renderHook(() =>
            useAlchemixOverrideStatus(defaultParams),
        );

        expect(result.current.isEligible).toBe(false);
    });

    it('exposes the reason the user cannot override', () => {
        mockContractReads({
            accountSnapshot: buildAccountSnapshot(),
            canOverride: [false, AlchemixOverrideErrReason.PROPOSAL_NOT_OPEN],
        });

        const { result } = renderHook(() =>
            useAlchemixOverrideStatus(defaultParams),
        );

        expect(result.current.canOverride).toBe(false);
        expect(result.current.canOverrideErrReason).toEqual(
            AlchemixOverrideErrReason.PROPOSAL_NOT_OPEN,
        );
    });

    it('disables the queries when the user is not connected', () => {
        mockContractReads();

        renderHook(() =>
            useAlchemixOverrideStatus({
                ...defaultParams,
                userAddress: undefined,
            }),
        );

        expect(useReadContractsSpy).toHaveBeenCalledWith(
            expect.objectContaining({ query: { enabled: false } }),
        );
    });

    it('refetches both contract batches on refetch', () => {
        const { userDataRefetch, delegateeDataRefetch } = mockContractReads({
            accountSnapshot: buildAccountSnapshot(),
        });

        const { result } = renderHook(() =>
            useAlchemixOverrideStatus(defaultParams),
        );
        result.current.refetch();

        expect(userDataRefetch).toHaveBeenCalled();
        expect(delegateeDataRefetch).toHaveBeenCalled();
    });
});
