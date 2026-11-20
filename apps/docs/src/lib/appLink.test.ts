import { resolveAppOrigin, toAppRelativeLink } from './appLink';

describe('resolveAppOrigin', () => {
    const appOrigins = ['https://app.aragon.org', 'https://new.app.aragon.org'];

    it('stays on the current host when it is one of the apps', () => {
        expect(resolveAppOrigin('https://app.aragon.org', appOrigins)).toBe('');
        expect(resolveAppOrigin('https://new.app.aragon.org', appOrigins)).toBe(
            '',
        );
    });

    it('leads to the first app when the site is opened on another host', () => {
        expect(
            resolveAppOrigin('https://docs-abc.vercel.app', appOrigins),
        ).toBe('https://app.aragon.org');
    });

    it('stays on the current host without app origins', () => {
        expect(resolveAppOrigin('https://docs-abc.vercel.app', [])).toBe('');
    });

    it('stays on the current host when it is unknown', () => {
        expect(resolveAppOrigin(undefined, appOrigins)).toBe('');
    });
});

describe('toAppRelativeLink', () => {
    it('makes a link to the app root host-relative', () => {
        expect(toAppRelativeLink('https://app.aragon.org')).toEqual({
            href: '/',
            isSite: false,
        });
        expect(toAppRelativeLink('https://app.aragon.org/')).toEqual({
            href: '/',
            isSite: false,
        });
    });

    it('keeps path, search and hash', () => {
        expect(
            toAppRelativeLink('https://app.aragon.org/create/dao?x=1#y'),
        ).toEqual({ href: '/create/dao?x=1#y', isSite: false });
    });

    it('marks links to the site itself', () => {
        expect(toAppRelativeLink('https://app.aragon.org/help')).toEqual({
            href: '/help',
            isSite: true,
        });
        expect(
            toAppRelativeLink('https://app.aragon.org/help/accounts/account#a'),
        ).toEqual({ href: '/help/accounts/account#a', isSite: true });
    });

    it('treats a path that only starts with the base path as an app path', () => {
        expect(toAppRelativeLink('https://app.aragon.org/helper')).toEqual({
            href: '/helper',
            isSite: false,
        });
    });

    it('collapses leading slashes so the link cannot leave the host', () => {
        expect(
            toAppRelativeLink('https://app.aragon.org//evil.com/x?a=1#b'),
        ).toEqual({ href: '/evil.com/x?a=1#b', isSite: false });
        expect(
            toAppRelativeLink('https://app.aragon.org/\\evil.com/x'),
        ).toEqual({ href: '/evil.com/x', isSite: false });
        expect(toAppRelativeLink('https://app.aragon.org///help/a')).toEqual({
            href: '/help/a',
            isSite: true,
        });
    });

    it('leaves other hosts alone', () => {
        expect(toAppRelativeLink('https://new.app.aragon.org/')).toBeNull();
        expect(toAppRelativeLink('https://aragon.org/')).toBeNull();
        expect(toAppRelativeLink('http://app.aragon.org/')).toBeNull();
        expect(toAppRelativeLink('mailto:help@aragon.org')).toBeNull();
    });

    it('leaves relative, malformed and missing links alone', () => {
        expect(toAppRelativeLink('/help/accounts')).toBeNull();
        expect(toAppRelativeLink('#section')).toBeNull();
        expect(toAppRelativeLink('https://')).toBeNull();
        expect(toAppRelativeLink('')).toBeNull();
        expect(toAppRelativeLink(undefined)).toBeNull();
    });
});
