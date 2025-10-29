import { useLockToVoteFeeDataMock } from '../../testUtils/mocks/lockToVoteFeeDataMock';
import { useLockToVoteFeeData as useLockToVoteFeeDataImpl } from './useLockToVoteFeeData';

/**
 * Hook for fetching fee data from DynamicExitQueue contract.
 *
 * The mock implementation is enabled when either:
 * - NEXT_PUBLIC_MOCK_FEE_DATA=true, or
 * - NEXT_PUBLIC_USE_MOCKS=true and NEXT_PUBLIC_MOCK_FEE_DATA is not explicitly set to "false"
 *
 * This allows testing all fee modes without deployed contracts.
 */
const shouldUseFeeMocks =
    process.env.NEXT_PUBLIC_MOCK_FEE_DATA === 'true' ||
    (process.env.NEXT_PUBLIC_MOCK_FEE_DATA !== 'false' && process.env.NEXT_PUBLIC_USE_MOCKS === 'true');

export const useLockToVoteFeeData = shouldUseFeeMocks ? useLockToVoteFeeDataMock : useLockToVoteFeeDataImpl;

export type * from './useLockToVoteFeeData.api';
