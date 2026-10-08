import { toCanonicalUrl, toMarkdownPath } from './site';

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

    describe('toMarkdownPath', () => {
        it('names the markdown copy of the home page', () => {
            expect(toMarkdownPath('/')).toBe('/help/index.md');
        });

        it('names the markdown copy next to a page', () => {
            expect(toMarkdownPath('/accounts/account')).toBe(
                '/help/accounts/account.md',
            );
        });
    });
});
