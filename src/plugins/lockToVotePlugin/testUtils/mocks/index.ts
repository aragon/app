import { useTokenExitQueueFeeDataMock } from '@/plugins/tokenPlugin/testUtils/mocks/tokenExitQueueFeeDataMock';
import {
    MOCK_CONTRACT_ADDRESSES,
    TOKEN_EXIT_QUEUE_TEST_SCENARIOS,
    tokenExitQueuePluginMocks,
} from '@/plugins/tokenPlugin/testUtils/mocks/tokenExitQueueFeeMocks';
import type { IUseLockToVoteFeeDataParams, IUseLockToVoteFeeDataReturn } from '../../hooks/useLockToVoteFeeData';

export const LOCK_TO_VOTE_TEST_SCENARIOS = TOKEN_EXIT_QUEUE_TEST_SCENARIOS;
export const lockToVotePluginMocks = tokenExitQueuePluginMocks;
export { MOCK_CONTRACT_ADDRESSES };

export const useLockToVoteFeeDataMock = (params: IUseLockToVoteFeeDataParams): IUseLockToVoteFeeDataReturn =>
    useTokenExitQueueFeeDataMock(params);
