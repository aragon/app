import { useLockToVoteFeeDataMock } from '../../testUtils/mocks';
import { useLockToVoteFeeData as useLockToVoteFeeDataImpl } from './useLockToVoteFeeData';

/**
 * Hook for fetching fee data from DynamicExitQueue contract.
 *
 * The mock implementation is enabled when NEXT_PUBLIC_USE_MOCKS=true,
 * which mirrors the rest of the mock infrastructure for the app.
 */
const shouldUseFeeMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

export const useLockToVoteFeeData = shouldUseFeeMocks ? useLockToVoteFeeDataMock : useLockToVoteFeeDataImpl;

export type * from './useLockToVoteFeeData.api';
