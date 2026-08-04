import { renderHook } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { VoteOption } from '@/plugins/tokenPlugin/types';
import { Network } from '@/shared/api/daoService';
import { useAlchemixObjectionStatus } from './useAlchemixObjectionStatus';

describe('useAlchemixObjectionStatus', () => {
    const useReadContractsSpy = jest.spyOn(wagmi, 'useReadContracts');

    afterEach(() => {
        useReadContractsSpy.mockReset();
    });

    const defaultParams = {
        proposalIndex: '1',
        pluginAddress: '0x3333333333333333333333333333333333333333',
        network: Network.ETHEREUM_SEPOLIA,
        userAddress: '0x1111111111111111111111111111111111111111',
    };

    const mockContractReads = (values?: {
        voteOption?: number;
        votingPower?: bigint;
        canObject?: boolean;
        failedRead?: boolean;
    }) => {
        const refetch = jest.fn();
        const status = values?.failedRead === true ? 'failure' : 'success';

        useReadContractsSpy.mockReturnValue({
            data: [
                { result: values?.voteOption ?? 0, status: 'success' },
                { result: values?.votingPower ?? BigInt(0), status },
                { result: values?.canObject ?? false, status: 'success' },
            ],
            isLoading: false,
            isFetched: true,
            isError: false,
            refetch,
        } as unknown as wagmi.UseReadContractsReturnType);

        return { refetch };
    };

    it('probes the objection permission with the No option as the plugin rejects any other option', () => {
        mockContractReads();
        renderHook(() => useAlchemixObjectionStatus(defaultParams));

        const contracts = useReadContractsSpy.mock.calls[0][0]?.contracts as {
            functionName: string;
            args: unknown[];
        }[];
        const canVoteCall = contracts.find(
            (contract) => contract.functionName === 'canVote',
        );

        expect(canVoteCall?.args[2]).toEqual(VoteOption.NO);
    });

    it('returns the recorded vote option, voting power and objection permission', () => {
        mockContractReads({
            voteOption: VoteOption.YES,
            votingPower: BigInt(100),
            canObject: true,
        });
        const { result } = renderHook(() =>
            useAlchemixObjectionStatus(defaultParams),
        );

        expect(result.current.voteOption).toEqual(VoteOption.YES);
        expect(result.current.votingPower).toEqual(BigInt(100));
        expect(result.current.canObject).toBeTruthy();
    });

    it('returns an undefined vote option when the user voted on neither stage', () => {
        mockContractReads({ voteOption: 0 });
        const { result } = renderHook(() =>
            useAlchemixObjectionStatus(defaultParams),
        );

        expect(result.current.voteOption).toBeUndefined();
    });

    it('flags an error when a single read of the batch fails', () => {
        mockContractReads({ failedRead: true });
        const { result } = renderHook(() =>
            useAlchemixObjectionStatus(defaultParams),
        );

        expect(result.current.isError).toBeTruthy();
    });

    it('disables the reads when no user is connected', () => {
        mockContractReads();
        renderHook(() =>
            useAlchemixObjectionStatus({
                ...defaultParams,
                userAddress: undefined,
            }),
        );

        expect(
            useReadContractsSpy.mock.calls[0][0]?.query?.enabled,
        ).toBeFalsy();
    });
});
