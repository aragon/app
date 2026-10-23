/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { createFeatureFlags } from '@/shared/featureFlags';
import { proxyUtils } from './proxyUtils';

jest.mock('@/shared/featureFlags', () => ({
    createFeatureFlags: jest.fn(),
}));

describe('proxy utils', () => {
    const createFeatureFlagsMock = jest.mocked(createFeatureFlags);
    const originalEnv = process.env;

    const setHelpCenterFlag = (enabled: boolean) => {
        createFeatureFlagsMock.mockReturnValue({
            isEnabled: jest.fn(() => Promise.resolve(enabled)),
        } as unknown as ReturnType<typeof createFeatureFlags>);
    };

    beforeEach(() => {
        process.env = {
            ...originalEnv,
            NEXT_PUBLIC_ENV: 'local',
            NEXT_PUBLIC_DOCS_URL: 'https://docs.example.org',
        };
    });

    afterEach(() => {
        process.env = originalEnv;
        createFeatureFlagsMock.mockReset();
    });

    it('sets the nonce-based content security policy on app requests', async () => {
        const request = new NextRequest('https://app.example.org/dao/test');
        const response = await proxyUtils.proxy(request);

        expect(response.headers.get('x-middleware-rewrite')).toBeNull();
        expect(response.headers.get('Content-Security-Policy')).toContain(
            "script-src 'self' 'nonce-",
        );
        expect(createFeatureFlagsMock).not.toHaveBeenCalled();
    });

    it('rewrites help center requests to the site deployment when the flag is on', async () => {
        setHelpCenterFlag(true);
        const request = new NextRequest(
            'https://app.example.org/help/accounts/account?tab=1',
            { headers: { cookie: 'aragon.featureFlags.overrides=%7B%7D' } },
        );
        const response = await proxyUtils.proxy(request);

        expect(response.headers.get('x-middleware-rewrite')).toBe(
            'https://docs.example.org/help/accounts/account?tab=1',
        );
        expect(response.headers.get('Content-Security-Policy')).toBeNull();
    });

    it('resolves the flag from the cookies of the request', async () => {
        setHelpCenterFlag(true);
        const cookie =
            'aragon.featureFlags.overrides=%7B%22helpCenter%22%3Atrue%7D';
        const request = new NextRequest('https://app.example.org/help', {
            headers: { cookie },
        });
        await proxyUtils.proxy(request);

        const getCookieSource = createFeatureFlagsMock.mock.calls[0]?.[0];
        expect(getCookieSource?.()).toBe(cookie);
    });

    it('lets help center requests reach the app when the flag is off', async () => {
        setHelpCenterFlag(false);
        const request = new NextRequest('https://app.example.org/help');
        const response = await proxyUtils.proxy(request);

        expect(response.headers.get('x-middleware-rewrite')).toBeNull();
        expect(response.headers.get('Content-Security-Policy')).toContain(
            "default-src 'self'",
        );
    });

    it('lets help center requests reach the app when no site origin is configured', async () => {
        setHelpCenterFlag(true);
        process.env.NEXT_PUBLIC_DOCS_URL = '';
        const request = new NextRequest('https://app.example.org/help');
        const response = await proxyUtils.proxy(request);

        expect(response.headers.get('x-middleware-rewrite')).toBeNull();
        expect(createFeatureFlagsMock).not.toHaveBeenCalled();
    });

    it('does not treat paths that merely start with the help prefix as the help center', async () => {
        setHelpCenterFlag(true);
        const request = new NextRequest('https://app.example.org/helpers');
        const response = await proxyUtils.proxy(request);

        expect(response.headers.get('x-middleware-rewrite')).toBeNull();
        expect(createFeatureFlagsMock).not.toHaveBeenCalled();
    });
});
