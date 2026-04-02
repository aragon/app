import { renderHook } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { useDao } from '@/shared/api/daoService';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import type { FeatureFlagSnapshot } from '@/shared/featureFlags';
import { useAdvancedGovernanceAvailability } from './useAdvancedGovernanceAvailability';

jest.mock('@/shared/api/daoService', () => ({ useDao: jest.fn() }));

const useDaoMock = useDao as jest.Mock;

const createFeatureFlagSnapshot = (
    gateAdvancedGovernance: boolean,
): FeatureFlagSnapshot[] => [
    {
        key: 'gateAdvancedGovernance',
        name: 'Gate advanced governance',
        description:
            'Gates advanced governance setup behind a DAO creation cutoff timestamp',
        enabled: gateAdvancedGovernance,
    },
];

const createFeatureFlagsWrapper =
    (gateAdvancedGovernance: boolean) =>
    ({ children }: PropsWithChildren) =>
        createElement(
            FeatureFlagsProvider,
            {
                initialSnapshot: createFeatureFlagSnapshot(
                    gateAdvancedGovernance,
                ),
            },
            children,
        );

describe('useAdvancedGovernanceAvailability', () => {
    afterEach(() => {
        useDaoMock.mockReset();
    });

    it('returns available when advanced governance gating is disabled', () => {
        useDaoMock.mockReturnValue({ data: undefined, isLoading: false });

        const { result } = renderHook(
            () => useAdvancedGovernanceAvailability({ daoId: 'dao-1' }),
            {
                wrapper: createFeatureFlagsWrapper(false),
            },
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

    it('returns loading while DAO data is being fetched when gating is enabled', () => {
        useDaoMock.mockReturnValue({ data: undefined, isLoading: true });

        const { result } = renderHook(
            () => useAdvancedGovernanceAvailability({ daoId: 'dao-1' }),
            {
                wrapper: createFeatureFlagsWrapper(true),
            },
        );

        expect(result.current).toEqual({
            isAvailable: false,
            isLoading: true,
        });
    });

    it('returns available when gating is enabled and DAO was created before cutoff', () => {
        useDaoMock.mockReturnValue({
            data: { blockTimestamp: 1_700_000_000 },
            isLoading: false,
        });

        const original =
            process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP;
        process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP =
            '1800000000';

        const { result } = renderHook(
            () => useAdvancedGovernanceAvailability({ daoId: 'dao-1' }),
            {
                wrapper: createFeatureFlagsWrapper(true),
            },
        );

        expect(result.current).toEqual({
            isAvailable: true,
            isLoading: false,
        });

        process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP = original;
    });

    it('returns unavailable when gating is enabled and DAO was created after cutoff', () => {
        useDaoMock.mockReturnValue({
            data: { blockTimestamp: 1_900_000_000 },
            isLoading: false,
        });

        const original =
            process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP;
        process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP =
            '1800000000';

        const { result } = renderHook(
            () => useAdvancedGovernanceAvailability({ daoId: 'dao-1' }),
            {
                wrapper: createFeatureFlagsWrapper(true),
            },
        );

        expect(result.current).toEqual({
            isAvailable: false,
            isLoading: false,
        });

        process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP = original;
    });

    it('returns unavailable when gating is enabled and DAO data is missing', () => {
        useDaoMock.mockReturnValue({
            data: undefined,
            isLoading: false,
        });

        const original =
            process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP;
        process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP =
            '1800000000';

        const { result } = renderHook(
            () => useAdvancedGovernanceAvailability({ daoId: 'dao-1' }),
            {
                wrapper: createFeatureFlagsWrapper(true),
            },
        );

        expect(result.current).toEqual({
            isAvailable: false,
            isLoading: false,
        });

        process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP = original;
    });

    it('fetches DAO data when the gating feature flag is enabled', () => {
        useDaoMock.mockReturnValue({
            data: { blockTimestamp: 1_900_000_000 },
            isLoading: false,
        });

        const original =
            process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP;
        process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP =
            '1800000000';

        const { result } = renderHook(
            () => useAdvancedGovernanceAvailability({ daoId: 'dao-1' }),
            {
                wrapper: createFeatureFlagsWrapper(true),
            },
        );

        expect(result.current).toEqual({
            isAvailable: false,
            isLoading: false,
        });
        expect(useDaoMock).toHaveBeenCalledWith(
            { urlParams: { id: 'dao-1' } },
            { enabled: true },
        );

        process.env.NEXT_PUBLIC_GOVERNANCE_ADVANCED_CUTOFF_TIMESTAMP = original;
    });
});
