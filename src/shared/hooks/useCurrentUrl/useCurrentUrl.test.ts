import { renderHook } from '@testing-library/react';
import { useCurrentUrl } from './useCurrentUrl';

describe('useCurrentUrl hook', () => {
    it('returns the current page url', () => {
        const { result } = renderHook(() => useCurrentUrl());
        expect(result.current).toEqual('localhost/');
    });
});
