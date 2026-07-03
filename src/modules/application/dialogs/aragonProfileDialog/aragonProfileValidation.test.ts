import type { SocialKey } from './aragonProfileDialog';
import { socialFieldRules } from './aragonProfileValidation';

/** Invokes the single `validate` function defined for a social field. */
const runValidate = (field: SocialKey, value: string) => {
    const validate = socialFieldRules[field].validate as (
        value: string,
    ) => true | string;
    return validate(value);
};

describe('socialFieldRules', () => {
    const fields: SocialKey[] = [
        'email',
        'website',
        'github',
        'twitter',
        'telegram',
        'discord',
    ];

    it.each(fields)('treats an empty %s value as valid', (field) => {
        expect(runValidate(field, '')).toBe(true);
    });

    describe('email', () => {
        it('accepts a valid email', () => {
            expect(runValidate('email', 'alice@example.com')).toBe(true);
        });

        it.each([
            'alice',
            'alice@',
            'alice@example',
            'a b@example.com',
        ])('rejects malformed email "%s"', (value) => {
            expect(runValidate('email', value)).toBe(
                'app.application.aragonProfileDialog.errors.email',
            );
        });
    });

    describe('website', () => {
        it.each([
            'https://aragon.org',
            'http://aragon.org/path',
        ])('accepts http(s) URL "%s"', (value) => {
            expect(runValidate('website', value)).toBe(true);
        });

        it.each([
            'not a url',
            'ftp://aragon.org',
            'javascript:alert(1)',
        ])('rejects non-http(s) value "%s"', (value) => {
            expect(runValidate('website', value)).toBe(
                'app.application.aragonProfileDialog.errors.website',
            );
        });
    });

    describe('github', () => {
        it.each([
            'octocat',
            'my-user',
        ])('accepts valid username "%s"', (value) => {
            expect(runValidate('github', value)).toBe(true);
        });

        it.each([
            '-octocat',
            'octocat-',
            'user/repo',
            'foo bar',
        ])('rejects invalid username "%s"', (value) => {
            expect(runValidate('github', value)).toBe(
                'app.application.aragonProfileDialog.errors.github',
            );
        });
    });

    describe('twitter', () => {
        it.each([
            'vitalik',
            '@vitalik',
            'vitalik_eth',
        ])('accepts valid handle "%s"', (value) => {
            expect(runValidate('twitter', value)).toBe(true);
        });

        it.each([
            'foo bar',
            'waytoolonghandle12345',
            'a.b',
        ])('rejects invalid handle "%s"', (value) => {
            expect(runValidate('twitter', value)).toBe(
                'app.application.aragonProfileDialog.errors.twitter',
            );
        });
    });

    describe('telegram', () => {
        it.each([
            'aragon',
            '@aragon_dao',
        ])('accepts valid handle "%s"', (value) => {
            expect(runValidate('telegram', value)).toBe(true);
        });

        it.each([
            'abc',
            'foo bar',
            'a'.repeat(33),
        ])('rejects invalid handle "%s"', (value) => {
            expect(runValidate('telegram', value)).toBe(
                'app.application.aragonProfileDialog.errors.telegram',
            );
        });
    });

    describe('discord', () => {
        it.each([
            'aragon',
            'aragon.dao',
            'a_b.c',
        ])('accepts valid username "%s"', (value) => {
            expect(runValidate('discord', value)).toBe(true);
        });

        it.each([
            'a',
            'foo bar',
            'a'.repeat(33),
        ])('rejects invalid username "%s"', (value) => {
            expect(runValidate('discord', value)).toBe(
                'app.application.aragonProfileDialog.errors.discord',
            );
        });
    });
});
