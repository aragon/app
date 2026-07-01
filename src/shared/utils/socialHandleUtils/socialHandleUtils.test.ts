import { socialHandleUtils } from './socialHandleUtils';

describe('socialHandleUtils', () => {
    describe('stripLeadingAt', () => {
        it('strips a single leading @', () => {
            expect(socialHandleUtils.stripLeadingAt('@handle')).toBe('handle');
        });

        it('leaves values without a leading @ untouched', () => {
            expect(socialHandleUtils.stripLeadingAt('handle')).toBe('handle');
        });
    });

    describe('isEmail', () => {
        it('accepts a valid email', () => {
            expect(socialHandleUtils.isEmail('alice@example.com')).toBe(true);
        });

        it.each([
            'not-an-email',
            'a@b',
            'a b@c.com',
            '',
        ])('rejects %p', (value) => {
            expect(socialHandleUtils.isEmail(value)).toBe(false);
        });
    });

    describe('isGithubHandle', () => {
        it('accepts a plain username with hyphens', () => {
            expect(socialHandleUtils.isGithubHandle('my-user')).toBe(true);
        });

        it.each([
            'my-user.name',
            '-user',
            'user-',
            'user/repo',
            '',
        ])('rejects %p', (value) => {
            expect(socialHandleUtils.isGithubHandle(value)).toBe(false);
        });
    });

    describe('isTwitterHandle', () => {
        it('accepts a handle with or without a leading @', () => {
            expect(socialHandleUtils.isTwitterHandle('vitalik')).toBe(true);
            expect(socialHandleUtils.isTwitterHandle('@vitalik')).toBe(true);
        });

        it.each([
            'a'.repeat(16),
            'foo bar',
            'foo.bar',
            '@',
        ])('rejects %p', (value) => {
            expect(socialHandleUtils.isTwitterHandle(value)).toBe(false);
        });
    });

    describe('isTelegramHandle', () => {
        it('accepts a handle with or without a leading @', () => {
            expect(socialHandleUtils.isTelegramHandle('durov')).toBe(true);
            expect(socialHandleUtils.isTelegramHandle('@durov')).toBe(true);
        });

        it.each([
            'abc',
            'a'.repeat(33),
            'foo.bar',
            'foo-bar',
        ])('rejects %p', (value) => {
            expect(socialHandleUtils.isTelegramHandle(value)).toBe(false);
        });
    });

    describe('isDiscordHandle', () => {
        it('accepts a valid username', () => {
            expect(socialHandleUtils.isDiscordHandle('aragon')).toBe(true);
        });

        it.each(['a', 'foo bar', 'foo-bar', ''])('rejects %p', (value) => {
            expect(socialHandleUtils.isDiscordHandle(value)).toBe(false);
        });
    });
});
