import { renderHook } from '@testing-library/react';
import { useDao } from '@/shared/api/daoService';
import * as getEnvironmentModule from '@/shared/featureFlags/utils/getEnvironment';
import { useAdvancedGovernanceAvailability } from './useAdvancedGovernanceAvailability';

jest.mock('@/shared/api/daoService', () => ({ useDao: jest.fn() }));

const useDaoMock = useDao as jest.Mock;

describe('useAdvancedGovernanceAvailability', () => {
    const getEnvironmentSpy = jest.spyOn(
        getEnvironmentModule,
        'getEnvironment',
    );

    afterEach(() => {
        getEnvironmentSpy.mockReset();
        useDaoMock.mockReset();
    });

    it('returns available in non-production without fetching DAO', () => {
        getEnvironmentSpy.mockReturnValue('development');
        useDaoMock.mockReturnValue({ data: undefined, isLoading: false });

        const { result } = renderHook(() =>
            useAdvancedGovernanceAvailability({ daoId: 'dao-1' }),
        );

        expect(result.current).toEqual({
            isAvailable: true,
            isLoading: false,
        });
        expect(useDaoMock).toHaveBeenCalledWith(
            { urlParams: { id: 'dao-1' } },
            { enabled: false },
        );
    });

    it('returns loading while DAO data is being fetched in production', () => {
        getEnvironmentSpy.mockReturnValue('production');
        useDaoMock.mockReturnValue({ data: undefined, isLoading: true });

        const { result } = renderHook(() =>
            useAdvancedGovernanceAvailability({ daoId: 'dao-1' }),
        );

        expect(result.current).toEqual({
            isAvailable: false,
            isLoading: true,
        });
    });

    it('returns available in production when DAO was created before cutoff', () => {
        getEnvironmentSpy.mockReturnValue('production');
        useDaoMock.mockReturnValue({
            data: { blockTimestamp: 1_700_000_000 },
            isLoading: false,
        });

        const original =
            process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP;
        process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP =
            '1800000000';

        const { result } = renderHook(() =>
            useAdvancedGovernanceAvailability({ daoId: 'dao-1' }),
        );

        expect(result.current).toEqual({
            isAvailable: true,
            isLoading: false,
        });

        process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP = original;
    });

    it('returns unavailable in production when DAO was created after cutoff', () => {
        getEnvironmentSpy.mockReturnValue('production');
        useDaoMock.mockReturnValue({
            data: { blockTimestamp: 1_900_000_000 },
            isLoading: false,
        });

        const original =
            process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP;
        process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP =
            '1800000000';

        const { result } = renderHook(() =>
            useAdvancedGovernanceAvailability({ daoId: 'dao-1' }),
        );

        expect(result.current).toEqual({
            isAvailable: false,
            isLoading: false,
        });

        process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP = original;
    });

    it('returns unavailable in production when DAO data is missing', () => {
        getEnvironmentSpy.mockReturnValue('production');
        useDaoMock.mockReturnValue({
            data: undefined,
            isLoading: false,
        });

        const original =
            process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP;
        process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP =
            '1800000000';

        const { result } = renderHook(() =>
            useAdvancedGovernanceAvailability({ daoId: 'dao-1' }),
        );

        expect(result.current).toEqual({
            isAvailable: false,
            isLoading: false,
        });

        process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP = original;
    });
});
