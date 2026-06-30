import {
    buildEmailHref,
    buildGithubUrl,
    buildMemberLinks,
    buildTelegramUrl,
    buildTwitterUrl,
} from './memberLinksCard';

describe('buildTwitterUrl', () => {
    it('builds a valid X profile URL from a plain handle', () => {
        expect(buildTwitterUrl('vitalik')).toBe('https://x.com/vitalik');
    });

    it('strips leading @ from handle', () => {
        expect(buildTwitterUrl('@vitalik')).toBe('https://x.com/vitalik');
    });

    it('allows underscores in handles', () => {
        expect(buildTwitterUrl('vitalik_eth')).toBe(
            'https://x.com/vitalik_eth',
        );
    });

    it('rejects handles with path traversal characters', () => {
        expect(buildTwitterUrl('../malicious')).toBeNull();
    });

    it('rejects handles with spaces', () => {
        expect(buildTwitterUrl('foo bar')).toBeNull();
    });

    it('rejects empty handle after stripping @', () => {
        expect(buildTwitterUrl('@')).toBeNull();
    });
});

describe('buildGithubUrl', () => {
    it('builds a valid GitHub profile URL', () => {
        expect(buildGithubUrl('octocat')).toBe('https://github.com/octocat');
    });

    it('allows hyphens and dots in handles', () => {
        expect(buildGithubUrl('my-user.name')).toBe(
            'https://github.com/my-user.name',
        );
    });

    it('rejects handles with slashes', () => {
        expect(buildGithubUrl('user/repo')).toBeNull();
    });

    it('rejects handles with special characters', () => {
        expect(buildGithubUrl('user<script>')).toBeNull();
    });
});

describe('buildTelegramUrl', () => {
    it('builds a valid Telegram profile URL', () => {
        expect(buildTelegramUrl('durov')).toBe('https://t.me/durov');
    });

    it('strips leading @ from handle', () => {
        expect(buildTelegramUrl('@durov')).toBe('https://t.me/durov');
    });

    it('rejects handles with spaces', () => {
        expect(buildTelegramUrl('foo bar')).toBeNull();
    });

    it('rejects handles with slashes', () => {
        expect(buildTelegramUrl('../malicious')).toBeNull();
    });
});

describe('buildEmailHref', () => {
    it('builds a mailto href for a valid email', () => {
        expect(buildEmailHref('alice@example.com')).toBe(
            'mailto:alice%40example.com',
        );
    });

    it('rejects an invalid email', () => {
        expect(buildEmailHref('not-an-email')).toBeNull();
    });
});

describe('buildMemberLinks', () => {
    it('returns an empty array when no records resolve', () => {
        expect(buildMemberLinks({})).toEqual([]);
        expect(
            buildMemberLinks({
                url: '',
                twitter: null,
                github: undefined,
                email: '',
                telegram: null,
                discord: '',
            }),
        ).toEqual([]);
    });

    it('drops malformed values', () => {
        expect(
            buildMemberLinks({
                url: 'not a url',
                twitter: 'foo bar',
                email: 'nope',
            }),
        ).toEqual([]);
    });

    it('resolves all supported fields', () => {
        const links = buildMemberLinks({
            url: 'https://aragon.org',
            twitter: '@aragonproject',
            github: 'aragon',
            email: 'hi@aragon.org',
            telegram: '@aragon',
            discord: 'aragon',
        });

        expect(links).toHaveLength(6);
        expect(links.map((link) => link.labelKey)).toEqual([
            'app.governance.daoMemberDetailsPage.aside.links.website',
            'app.governance.daoMemberDetailsPage.aside.links.twitter',
            'app.governance.daoMemberDetailsPage.aside.links.github',
            'app.governance.daoMemberDetailsPage.aside.links.email',
            'app.governance.daoMemberDetailsPage.aside.links.telegram',
            'app.governance.daoMemberDetailsPage.aside.links.discord',
        ]);
    });

    it('renders Discord as text without an href', () => {
        const [discordLink] = buildMemberLinks({ discord: 'aragon' });
        expect(discordLink.href).toBeUndefined();
        expect(discordLink.display).toBe('aragon');
    });

    it('uses the raw email as the display value with a mailto href', () => {
        const [emailLink] = buildMemberLinks({ email: 'hi@aragon.org' });
        expect(emailLink.href).toBe('mailto:hi%40aragon.org');
        expect(emailLink.display).toBe('hi@aragon.org');
    });
});
