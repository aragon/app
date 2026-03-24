import { buildGithubUrl, buildTwitterUrl } from './memberLinksCard';

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
