import { renderHook, waitFor } from '@testing-library/react';
import * as NextNavigation from 'next/navigation';
import { useFilterUrlParam } from './useFilterUrlParam';

describe('useFilterUrlParam hook', () => {
    const useSearchParamsSpy = jest.spyOn(NextNavigation, 'useSearchParams');

    const mockSearchParams = (params?: Record<string, string>) =>
        useSearchParamsSpy.mockReturnValue(
            new URLSearchParams(params) as ReturnType<
                typeof NextNavigation.useSearchParams
            >,
        );

    beforeEach(() => {
        mockSearchParams();
    });

    afterEach(() => {
        useSearchParamsSpy.mockReset();
        window.history.replaceState(null, '', '/');
    });

    const currentParam = (name: string) =>
        new URLSearchParams(window.location.search).get(name);

    it('sets the active value on the URL', async () => {
        renderHook(() =>
            useFilterUrlParam({
                name: 'proposals',
                validValues: ['body-a', 'body-b'],
                fallbackValue: 'body-a',
            }),
        );

        await waitFor(() =>
            expect(currentParam('proposals')).toEqual('body-a'),
        );
    });

    it('returns the first valid value when the URL names an unknown one', () => {
        mockSearchParams({ proposals: 'body-of-another-dao' });
        const { result } = renderHook(() =>
            useFilterUrlParam({
                name: 'proposals',
                validValues: ['body-a', 'body-b'],
            }),
        );

        expect(result.current[0]).toEqual('body-a');
    });

    // The filter belongs to the page displaying it: leaving it behind would name a value that means nothing to
    // whatever is rendered next, which is what happens when a workspace switches the account of its proposal list.
    it('removes its parameter from the URL when unmounted', async () => {
        const { unmount } = renderHook(() =>
            useFilterUrlParam({
                name: 'proposals',
                validValues: ['body-a'],
                fallbackValue: 'body-a',
            }),
        );

        await waitFor(() =>
            expect(currentParam('proposals')).toEqual('body-a'),
        );

        unmount();

        expect(currentParam('proposals')).toBeNull();
    });

    it('leaves the parameters of other filters alone', async () => {
        window.history.replaceState(null, '', '/?account=demo-account');
        const { unmount } = renderHook(() =>
            useFilterUrlParam({
                name: 'proposals',
                validValues: ['body-a'],
                fallbackValue: 'body-a',
            }),
        );

        await waitFor(() =>
            expect(currentParam('proposals')).toEqual('body-a'),
        );
        unmount();

        expect(currentParam('account')).toEqual('demo-account');
    });

    it('does not touch the URL when the URL update is disabled', async () => {
        renderHook(() =>
            useFilterUrlParam({
                name: 'proposals',
                validValues: ['body-a'],
                fallbackValue: 'body-a',
                enableUrlUpdate: false,
            }),
        );

        await waitFor(() => expect(currentParam('proposals')).toBeNull());
    });
    // A body belongs to one DAO, so its value means nothing under another one. Leaving it on the URL would name a
    // body that is not the one being displayed, which is what a workspace does when it switches account.
    it('replaces an unknown value on the URL with the one it falls back to', async () => {
        mockSearchParams({ proposals: '0xNotAPluginOfThisDao-ss' });
        window.history.replaceState(
            null,
            '',
            '/?proposals=0xNotAPluginOfThisDao-ss',
        );
        renderHook(() =>
            useFilterUrlParam({
                name: 'proposals',
                validValues: ['body-a', 'body-b'],
            }),
        );

        await waitFor(() =>
            expect(currentParam('proposals')).toEqual('body-a'),
        );
    });

    it('keeps a known value on the URL', async () => {
        mockSearchParams({ proposals: 'body-b' });
        window.history.replaceState(null, '', '/?proposals=body-b');
        renderHook(() =>
            useFilterUrlParam({
                name: 'proposals',
                validValues: ['body-a', 'body-b'],
            }),
        );

        await waitFor(() =>
            expect(currentParam('proposals')).toEqual('body-b'),
        );
    });

    it('writes nothing while the valid values are still unknown', async () => {
        renderHook(() => useFilterUrlParam({ name: 'proposals' }));

        await waitFor(() => expect(currentParam('proposals')).toBeNull());
    });
    it('replaces the value when the valid ones change under it', async () => {
        mockSearchParams({ proposals: 'body-a' });
        window.history.replaceState(null, '', '/?proposals=body-a');

        const { rerender } = renderHook(
            ({ validValues }: { validValues: string[] }) =>
                useFilterUrlParam({ name: 'proposals', validValues }),
            { initialProps: { validValues: ['body-a', 'body-b'] } },
        );

        await waitFor(() =>
            expect(currentParam('proposals')).toEqual('body-a'),
        );

        // The account changed, so the bodies are now those of another DAO.
        rerender({ validValues: ['other-body-a', 'other-body-b'] });

        await waitFor(() =>
            expect(currentParam('proposals')).toEqual('other-body-a'),
        );
    });
    it('removes the value when nothing valid is left to fall back to', async () => {
        mockSearchParams({ proposals: 'body-a' });
        window.history.replaceState(null, '', '/?proposals=body-a');

        const { rerender } = renderHook(
            ({ validValues }: { validValues: string[] }) =>
                useFilterUrlParam({ name: 'proposals', validValues }),
            { initialProps: { validValues: ['body-a', 'body-b'] } },
        );

        await waitFor(() =>
            expect(currentParam('proposals')).toEqual('body-a'),
        );

        // The account changed to one with no process at all, so there is no body to fall back to.
        rerender({ validValues: [] });

        await waitFor(() => expect(currentParam('proposals')).toBeNull());
    });

    it('keeps the value while the valid ones are still unknown', async () => {
        mockSearchParams({ proposals: 'body-a' });
        window.history.replaceState(null, '', '/?proposals=body-a');

        renderHook(() =>
            useFilterUrlParam({ name: 'proposals', validValues: undefined }),
        );

        await waitFor(() =>
            expect(currentParam('proposals')).toEqual('body-a'),
        );
    });
});
