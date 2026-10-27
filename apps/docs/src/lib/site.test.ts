import {
    toCanonicalUrl,
    toMarkdownFile,
    toMarkdownRoute,
    toMarkdownUrl,
} from './site';

describe('site', () => {
    describe('toCanonicalUrl', () => {
        it('points the home page at the site itself', () => {
            expect(toCanonicalUrl('/')).toBe('https://app.aragon.org/help');
        });

        it('builds a page URL under the base path', () => {
            expect(toCanonicalUrl('/accounts/account')).toBe(
                'https://app.aragon.org/help/accounts/account',
            );
        });
    });

    describe('toMarkdownRoute', () => {
        it('names the markdown copy next to a page, without the base path', () => {
            expect(toMarkdownRoute('/')).toBe('/index.md');
            expect(toMarkdownRoute('/accounts')).toBe('/accounts.md');
            expect(toMarkdownRoute('/accounts/account')).toBe(
                '/accounts/account.md',
            );
        });
    });

    describe('toMarkdownFile', () => {
        it('names the copy inside the public directory', () => {
            expect(toMarkdownFile('/')).toBe('index.md');
            expect(toMarkdownFile('/accounts')).toBe('accounts.md');
            expect(toMarkdownFile('/accounts/account')).toBe(
                'accounts/account.md',
            );
        });
    });

    describe('toMarkdownUrl', () => {
        it('builds the public URL of the copy', () => {
            expect(toMarkdownUrl('/accounts')).toBe(
                'https://app.aragon.org/help/accounts.md',
            );
        });
    });
});
