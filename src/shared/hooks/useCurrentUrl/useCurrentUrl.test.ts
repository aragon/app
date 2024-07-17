import { renderHook } from '@testing-library/react';
import { useCurrentUrl } from './useCurrentUrl';

describe('useCurrentUrl hook', () => {
    const originalLocation = window.location;

    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            enumerable: true,
            value: new URL(window.location.href),
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            enumerable: true,
            value: originalLocation,
        });
    });

    it('returns the current page url removing the https protocol', () => {
        window.location.href = 'https://app.aragon.org';
        const { result } = renderHook(() => useCurrentUrl());
        expect(result.current).toEqual('app.aragon.org/');
    });

    it('returns the current page url removing the http protocol', () => {
        window.location.href = 'http://test-page.com';
        const { result } = renderHook(() => useCurrentUrl());
        expect(result.current).toEqual('test-page.com/');
    });
});
