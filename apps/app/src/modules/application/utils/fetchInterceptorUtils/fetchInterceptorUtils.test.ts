/**
 * @jest-environment node
 */
import { backendApiMocks } from '@/backendApiMocks';
import type { IBackendApiMock } from '@/shared/types';
import { fetchInterceptorUtils } from './fetchInterceptorUtils';

jest.mock('@/backendApiMocks', () => ({ backendApiMocks: [] }));

describe('fetchInterceptorUtils', () => {
    const mocks = backendApiMocks as IBackendApiMock[];
    const originalFetch = global.fetch;

    afterEach(() => {
        mocks.length = 0;
        global.fetch = originalFetch;
    });

    it('does not intercept the requests when mocks are disabled', () => {
        fetchInterceptorUtils.intercept(false);

        expect(global.fetch).toEqual(originalFetch);
    });

    it('answers with the mock matching the request url', async () => {
        mocks.push({
            url: /\/v2\/items(\?|$)/,
            type: 'replace',
            data: { items: ['first'] },
        });
        fetchInterceptorUtils.intercept(true);

        const response = await global.fetch('https://api.test/v2/items?page=1');

        await expect(response.json()).resolves.toEqual({ items: ['first'] });
    });

    it('only uses a method-scoped mock for requests using that method', async () => {
        mocks.push(
            {
                url: /\/v2\/items(\?|$)/,
                method: 'POST',
                type: 'replace',
                data: { created: true },
            },
            {
                url: /\/v2\/items(\?|$)/,
                method: 'GET',
                type: 'replace',
                data: { items: [] },
            },
        );
        fetchInterceptorUtils.intercept(true);

        const created = await global.fetch('https://api.test/v2/items', {
            method: 'POST',
        });
        const listed = await global.fetch('https://api.test/v2/items');

        await expect(created.json()).resolves.toEqual({ created: true });
        await expect(listed.json()).resolves.toEqual({ items: [] });
    });
});
