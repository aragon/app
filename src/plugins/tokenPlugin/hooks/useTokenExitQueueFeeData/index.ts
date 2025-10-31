import { useTokenExitQueueFeeDataMock } from '../../testUtils/mocks';
import { useTokenExitQueueFeeData as useTokenExitQueueFeeDataImpl } from './useTokenExitQueueFeeData';

const shouldUseFeeMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

export const useTokenExitQueueFeeData = shouldUseFeeMocks ? useTokenExitQueueFeeDataMock : useTokenExitQueueFeeDataImpl;

export type { IUseTokenExitQueueFeeDataParams, IUseTokenExitQueueFeeDataReturn } from './useTokenExitQueueFeeData.api';
