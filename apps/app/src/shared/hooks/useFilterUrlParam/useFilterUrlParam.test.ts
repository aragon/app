import { renderHook } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation-original';
import { useFilterUrlParam } from './useFilterUrlParam';

jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(),
}));

describe('useFilterUrlParam', () => {
    const useSearchParamsMock = jest.mocked(useSearchParams);

    beforeEach(() => {
        window.history.replaceState(
            null,
            '',
            '/daos/ethereum-sepolia-0xdao/members?members=safe-source&keep=1',
        );
        useSearchParamsMock.mockImplementation(
            () =>
                new URLSearchParams(
                    window.location.search,
                ) as ReadonlyURLSearchParams,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('preserves a selected source when the member detail route replaces the list route', () => {
        const memberFilter = renderHook(() =>
            useFilterUrlParam({
                name: 'members',
                validValues: ['safe-source'],
            }),
        );

        window.history.replaceState(
            null,
            '',
            '/daos/ethereum-sepolia-0xdao/members/0xowner?members=safe-source&keep=1',
        );
        memberFilter.unmount();

        renderHook(() =>
            useFilterUrlParam({
                name: 'vote',
                fallbackValue: 'tokenvoting',
                validValues: ['tokenvoting'],
            }),
        );

        const searchParams = new URLSearchParams(window.location.search);
        expect(searchParams.get('members')).toBe('safe-source');
        expect(searchParams.get('vote')).toBe('tokenvoting');
        expect(searchParams.get('keep')).toBe('1');
    });

    it('removes its filter on same-route unmount without removing other filters', () => {
        const memberFilter = renderHook(() =>
            useFilterUrlParam({
                name: 'members',
                validValues: ['safe-source'],
            }),
        );

        memberFilter.unmount();

        const searchParams = new URLSearchParams(window.location.search);
        expect(searchParams.has('members')).toBe(false);
        expect(searchParams.get('keep')).toBe('1');
    });
});
