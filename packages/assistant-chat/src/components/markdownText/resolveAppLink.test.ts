import { resolveAppLink } from './resolveAppLink';

describe('resolveAppLink', () => {
    const occ = 'https://new.app.aragon.org';

    it('moves a link to the canonical app origin onto the current origin', () => {
        expect(resolveAppLink('https://app.aragon.org', occ)).toBe(`${occ}/`);
        expect(
            resolveAppLink('https://app.aragon.org/create/dao?x=1#y', occ),
        ).toBe(`${occ}/create/dao?x=1#y`);
        expect(
            resolveAppLink('https://app.aragon.org/help/accounts', occ),
        ).toBe(`${occ}/help/accounts`);
    });

    it('returns the href unchanged on the canonical origin', () => {
        const href = 'https://app.aragon.org';

        expect(resolveAppLink(href, 'https://app.aragon.org')).toBe(href);
    });

    it('returns the href unchanged without a current origin', () => {
        const href = 'https://app.aragon.org/create';

        expect(resolveAppLink(href, undefined)).toBe(href);
    });

    it('leaves other hosts untouched', () => {
        for (const href of [
            'https://aragon.org/privacy-policy',
            'https://new.app.aragon.org/create',
            'http://app.aragon.org/',
            'https://app.aragon.org.evil.example/',
            'https://docs.aragon.org',
        ]) {
            expect(resolveAppLink(href, occ)).toBe(href);
        }
    });

    it('leaves relative, malformed, mailto and missing hrefs untouched', () => {
        for (const href of [
            '/create',
            '#section',
            'https://',
            'mailto:support@aragon.org',
            '',
        ]) {
            expect(resolveAppLink(href, occ)).toBe(href);
        }
        expect(resolveAppLink(undefined, occ)).toBeUndefined();
    });
});
